const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const { query } = require('../db/connection');
const { analyzeText } = require('../utils/motorVersa');
const { createAlert } = require('../db/users');
const centralAI = require('../utils/centralAIService');

// ─────────────────────────────────────────────────────
// SSE — Clientes admin conectados en tiempo real
// ─────────────────────────────────────────────────────
const { adminClients, notificarAdmins } = require('../utils/notificaciones');

// GET /api/chatbot/stream — Admin se conecta para recibir alertas en tiempo real
router.get('/stream', verifyToken, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ tipo: 'conexion', mensaje: 'Conectado al sistema de alertas Versa ✅' })}\n\n`);
  adminClients.add(res);
  console.log(`🔗 Admin conectado al stream. Admins activos: ${adminClients.size}`);

  // Ping cada 25s para mantener conexión viva
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); }
    catch (e) { clearInterval(ping); adminClients.delete(res); }
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    adminClients.delete(res);
    console.log(`🔌 Admin desconectado. Admins activos: ${adminClients.size}`);
  });
});


// ─────────────────────────────────────────
// MIDDLEWARE: Verificar token de Botpress
// ─────────────────────────────────────────
const verificarBotpress = (req, res, next) => {
  const botToken = req.headers['x-botpress-token'];
  if (botToken && botToken === process.env.BOTPRESS_SECRET) {
    return next();
  }
  // También permite token JWT normal del frontend
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'No autorizado' });
};

// ─────────────────────────────────────────────────────
// POST /api/chatbot/analizar
// Motor Versa: 5 capas + Gemini solo si score ambiguo
// ─────────────────────────────────────────────────────
router.post('/analizar', verificarBotpress, async (req, res) => { // FIX CH-1: agregado verifyToken
  try {
    const { mensaje, tipo_violencia, frecuencia, estudiante_id } = req.body;

    if (!mensaje) {
      return res.status(400).json({ success: false, message: 'El mensaje es requerido' });
    }

    // ── CAPAS 1-4: Motor Versa local con MEMORIA ──
    let historialMensajes = [];
    if (estudiante_id && estudiante_id !== 'anonimo') {
      try {
        const reportesAnteriores = await query(
          `SELECT descripcion FROM chatbot_reportes 
           WHERE estudiante_id = ? 
           ORDER BY createdAt DESC LIMIT 5`,
          [estudiante_id]
        );
        historialMensajes = reportesAnteriores.map(r => r.descripcion);
      } catch (e) { /* continuar sin historial */ }
    }

    const resultadoMotor = analyzeText(mensaje, tipo_violencia, frecuencia, historialMensajes);
    console.log(`🧠 Motor Versa: score=${resultadoMotor.score}, nivel=${resultadoMotor.nivel_riesgo}, gemini=${resultadoMotor.requiere_gemini}`);

    // ── Si NO requiere Gemini → responder inmediatamente ──
    if (!resultadoMotor.requiere_gemini) {
      return res.json({
        success: true,
        fuente: 'motor_versa',
        data: {
          nivel_riesgo: resultadoMotor.nivel_riesgo,
          keywords_encontradas: resultadoMotor.keywords_detectadas,
          tiene_alerta_critica: resultadoMotor.es_emergencia || resultadoMotor.nivel_riesgo === 'alto',
          tipos_violencia: resultadoMotor.tipos_violencia,
          score: resultadoMotor.score,
          sentimiento: resultadoMotor.sentimiento,
          resumen_patron: resultadoMotor.resumen
        },
        // --- ARMONÍA BOTPRESS ---
        botpress: {
          action: resultadoMotor.nivel_riesgo === 'alto' ? 'escalate' : 'continue',
          suggestion: resultadoMotor.nivel_riesgo === 'alto' ? 'Necesito reportar esto a un orientador.' : 'Gracias por confiar en mí.',
          priority: resultadoMotor.nivel_riesgo === 'alto' ? 'P1' : 'P3'
        }
      });
    }

    // ── CAPA 5: Delegación al SERVIDOR CENTRAL DE IA ──
    try {
      console.log(`📡 Consultando Servidor Central de IA para validación profunda...`);
      
      const geminiResult = await centralAI.analizarRiesgo({
        mensaje,
        tipo_violencia,
        frecuencia,
        historial: historialMensajes
      });

      const nivelFinal = geminiResult.nivel_riesgo || resultadoMotor.nivel_riesgo;
      const scoreFinal = geminiResult.score || resultadoMotor.score;

      console.log(`🤖 Servidor Central validó: ${resultadoMotor.nivel_riesgo} → ${nivelFinal} (Score: ${scoreFinal})`);
      
      return res.json({
        success: true,
        fuente: 'central_ia_server',
        data: {
          nivel_riesgo: nivelFinal,
          keywords_encontradas: resultadoMotor.keywords_detectadas,
          tiene_alerta_critica: nivelFinal === 'alto',
          tipos_violencia: geminiResult.tipos_identificados || resultadoMotor.tipos_violencia,
          score: scoreFinal,
          sentimiento: resultadoMotor.sentimiento,
          resumen_patron: `${resultadoMotor.resumen} | IA Central: ${geminiResult.razon || 'Análisis exitoso'}`
        },
        // --- ARMONÍA BOTPRESS ---
        botpress: {
          action: nivelFinal === 'alto' ? 'escalate' : 'continue',
          suggestion: geminiResult.sugerencia_accion || 'Continuar acompañamiento.',
          priority: nivelFinal === 'alto' ? 'P1' : 'P3'
        }
      });
    } catch (geminiError) {
      console.error('⚠️ Fallo en Servidor Central, usando motor local:', geminiError.message);
      return res.json({
        success: true,
        fuente: 'motor_versa_fallback',
        data: {
          nivel_riesgo: resultadoMotor.nivel_riesgo,
          keywords_encontradas: resultadoMotor.keywords_detectadas,
          tiene_alerta_critica: resultadoMotor.nivel_riesgo === 'alto',
          tipos_violencia: resultadoMotor.tipos_violencia,
          score: resultadoMotor.score,
          resumen_patron: resultadoMotor.resumen
        }
      });
    }
    } catch (error) {
    console.error('❌ Error en /analizar:', error.message);
    return res.json({
      success: true,
      fuente: 'fallback_seguro',
      data: { nivel_riesgo: 'medio', keywords_encontradas: [], tiene_alerta_critica: false, tipos_violencia: [], score: 50, resumen_patron: 'Error en análisis, asumiendo riesgo medio por seguridad' }
    });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/chat-ia
// Genera una respuesta empática y conversacional usando Gemini
// ─────────────────────────────────────────────────────
router.post('/chat-ia', verifyToken, async (req, res) => { // FIX CH-1: agregado verifyToken
  try {
    const { mensaje, nivelRiesgo, historial = [] } = req.body;
    
    console.log(`💬 Generando respuesta empática vía Servidor Central...`);
    
    const respuesta = await centralAI.generarRespuesta({
      mensaje,
      nivelRiesgo,
      historial
    });
    
    return res.json({ success: true, respuesta });
  } catch (error) {
    console.error('❌ Error en /chat-ia:', error.message);
    return res.json({ success: false, respuesta: 'Te entiendo perfectamente. Sabes que cuentas conmigo para lo que necesites platicar. 💙' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/reporte
// Guarda reporte (riesgo medio) desde Botpress con FUSIÓN DE METADATOS
// ─────────────────────────────────────────────────────
router.post('/reporte', verificarBotpress, async (req, res) => {
  try {
    const {
      estudiante_id,
      nombre,
      descripcion,
      tipo_violencia,
      frecuencia,
      nivel_riesgo,
      keywords,
      resumen_patron,
      // --- FUSIÓN BOTPRESS ---
      bot_id,
      conversation_id,
      user_id_botpress,
      channel,
      sentiment_score
    } = req.body;

    if (!descripcion) {
      return res.status(400).json({ success: false, message: 'La descripción es requerida' });
    }

    // Generar número de ticket automático
    const now = new Date();
    const ticketNumber = `CHT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    // Insertar en la tabla alerts existente
    const nivelMap = {
      'bajo': 'Preventiva',
      'medio': 'Advertencia',
      'alto': 'Critica'
    };
    const alertType = nivelMap[nivel_riesgo] || 'Advertencia';

    const descripcionCompleta = `[CHATBOT - Riesgo ${(nivel_riesgo || 'medio').toUpperCase()}] 
Tipo: ${tipo_violencia || 'No especificado'} | Frecuencia: ${frecuencia || 'No especificada'}
${resumen_patron ? `Patrón detectado: ${resumen_patron}` : ''}
${keywords ? `Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords}` : ''}
${bot_id ? `\nFuente: Botpress (${bot_id}) | Canal: ${channel || 'N/A'}` : ''}

Mensaje del estudiante:
${descripcion}`;

    await createAlert({
      studentName: nombre || 'Estudiante Anónimo',
      studentUsername: estudiante_id || '',
      alertType: alertType,
      description: descripcionCompleta,
      ticketNumber: ticketNumber,
      alertDate: now.toISOString().split('T')[0],
      alertTime: now.toTimeString().slice(0, 5),
      status: 'Pendiente'
    });

    // --- ARMONÍA: NOTIFICAR EN TIEMPO REAL ---
    if (nivel_riesgo === 'alto' || nivel_riesgo === 'medio') {
        notificarAdmins({
            tipo: 'NUEVA_ALERTA_CHATBOT',
            nivel: nivel_riesgo,
            estudiante: nombre || 'Anónimo',
            ticket: ticketNumber,
            mensaje: descripcion.substring(0, 100) + '...'
        });
    }

    // También guardar en tabla chatbot_reportes con SENTIMIENTO y METADATOS BOTPRESS
    await query(
      `INSERT INTO chatbot_reportes 
       (estudiante_id, nombre, descripcion, tipo_violencia, frecuencia, 
        nivel_riesgo, keywords, resumen_patron, ticket_number, sentiment_score,
        bot_id, conversation_id, user_id_botpress, channel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        estudiante_id || 'anonimo',
        nombre || 'Anónimo',
        descripcion,
        tipo_violencia || 'no_especificado',
        frecuencia || 'no_especificado',
        nivel_riesgo || 'medio',
        typeof keywords === 'object' ? JSON.stringify(keywords) : (keywords || '[]'),
        resumen_patron || '',
        ticketNumber,
        sentiment_score || 0,
        bot_id || null,
        conversation_id || null,
        user_id_botpress || null,
        channel || null
      ]
    );

    console.log(`📋 Reporte Chatbot FUSIONADO: ${ticketNumber} - Bot: ${bot_id || 'N/A'}`);

    return res.json({ 
        success: true, 
        message: 'Reporte guardado con éxito (Fusión Versa + Botpress)', 
        ticket: ticketNumber
    });

  } catch (error) {
    console.error('❌ Error en /chatbot/reporte:', error.message);
    return res.status(500).json({ success: false, message: 'Error al registrar reporte', error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/alerta
// Guarda alerta CRÍTICA (riesgo alto) desde Botpress con FUSIÓN
// ─────────────────────────────────────────────────────
router.post('/alerta', verificarBotpress, async (req, res) => {
  try {
    const {
      estudiante_id,
      nombre,
      descripcion,
      tipo_violencia,
      frecuencia,
      nivel_riesgo,
      prioridad,
      keywords_criticas,
      reporte_pdf_url,
      // --- FUSIÓN BOTPRESS ---
      bot_id,
      conversation_id,
      channel
    } = req.body;

    if (!descripcion) {
      return res.status(400).json({ success: false, message: 'La descripción es requerida' });
    }

    const now = new Date();
    const ticketNumber = `CRIT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    const keywordsStr = typeof keywords_criticas === 'object'
      ? (keywords_criticas?.keywords_encontradas?.join(', ') || '')
      : (keywords_criticas || '');

    const descripcionCompleta = `🚨 [ALERTA CRÍTICA - CHATBOT] Prioridad: ${prioridad || 'URGENTE'}
Tipo: ${tipo_violencia || 'No especificado'} | Frecuencia: ${frecuencia || 'No especificada'}
Keywords detectadas: ${keywordsStr}
${bot_id ? `\nFuente: Botpress (${bot_id}) | Canal: ${channel || 'N/A'}` : ''}
${reporte_pdf_url ? `\nPDF adjunto: ${reporte_pdf_url}` : ''}

Mensaje del estudiante:
${descripcion}`;

    // Insertar en tabla alerts como Crítica usando función centralizada
    await createAlert({
      studentName: nombre || 'Estudiante Anónimo',
      studentUsername: estudiante_id || '',
      alertType: 'Critica',
      description: descripcionCompleta,
      ticketNumber: ticketNumber,
      alertDate: now.toISOString().split('T')[0],
      alertTime: now.toTimeString().slice(0, 5),
      status: 'Pendiente'
    });

    // Guardar en tabla chatbot_alertas_criticas con FUSIÓN
    await query(
      `INSERT INTO chatbot_alertas_criticas 
       (estudiante_id, nombre, descripcion, tipo_violencia, frecuencia,
        nivel_riesgo, prioridad, keywords_criticas, reporte_pdf_url, ticket_number,
        bot_id, conversation_id, channel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        estudiante_id || 'anonimo',
        nombre || 'Anónimo',
        descripcion,
        tipo_violencia || 'no_especificado',
        frecuencia || 'no_especificado',
        nivel_riesgo || 'alto',
        prioridad || 'URGENTE',
        typeof keywords_criticas === 'object' ? JSON.stringify(keywords_criticas) : (keywords_criticas || '{}'),
        reporte_pdf_url || '',
        ticketNumber,
        bot_id || null,
        conversation_id || null,
        channel || null
      ]
    );

    console.log(`🚨 ALERTA CRÍTICA FUSIONADA: ${ticketNumber} - Bot: ${bot_id || 'N/A'}`);

    // 📡 Notificar admins en tiempo real via SSE
    notificarAdmins({
      tipo: 'alerta_critica_versa',
      nivel: 'alto',
      prioridad: prioridad || 'URGENTE',
      nombre: nombre || 'Estudiante Anónimo',
      tipo_violencia: tipo_violencia || 'no especificado',
      ticket: ticketNumber,
      descripcion: descripcion?.substring(0, 120) + (descripcion?.length > 120 ? '...' : ''),
      keywords: keywords_criticas?.keywords_encontradas || [],
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Alerta crítica registrada',
      ticket: ticketNumber,
      prioridad: 'URGENTE'
    });

  } catch (error) {
    console.error('❌ Error en /chatbot/alerta:', error.message);
    return res.status(500).json({ success: false, message: 'Error al registrar alerta', error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/denuncia
// Guarda denuncia manual de Denuncia Fácil
// ─────────────────────────────────────────────────────
router.post('/denuncia', verifyToken, async (req, res) => { // FIX CH-1: agregado verifyToken
  try {
    const {
      estudiante_id, anonimo, tipo_violencia, descripcion, fecha_hecho, 
      lugar, involucrados, nombre_contacto, email_contacto, telefono_contacto
    } = req.body;

    if (!descripcion || !tipo_violencia) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const now = new Date();
    const ticketNumber = `DEN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    const nombreMostrado = anonimo ? 'Denuncia Anónima' : (nombre_contacto || 'Usuario Identificado');
    
    const descripcionCompleta = `🛡️ [DENUNCIA FÁCIL] ${anonimo ? '(ANÓNIMA)' : ''}
Tipo: ${tipo_violencia} | Fecha Hecho: ${fecha_hecho || 'N/A'}
Lugar: ${lugar || 'N/A'}
Involucrados: ${involucrados || 'Ninguno'}
${anonimo ? '' : `Contacto: ${email_contacto || ''} - ${telefono_contacto || ''}`}

Descripción:
${descripcion}`;

    await createAlert({
      studentName: nombreMostrado,
      studentUsername: anonimo ? 'anonimo' : (estudiante_id || ''),
      alertType: 'Advertencia',
      description: descripcionCompleta,
      ticketNumber: ticketNumber,
      alertDate: now.toISOString().split('T')[0],
      alertTime: now.toTimeString().slice(0, 5),
      status: 'Pendiente'
    });

    notificarAdmins({
      tipo: 'denuncia_facil',
      nivel: 'alto',
      prioridad: 'ALTA',
      nombre: nombreMostrado,
      tipo_violencia: tipo_violencia,
      ticket: ticketNumber,
      descripcion: descripcion?.substring(0, 120) + (descripcion?.length > 120 ? '...' : ''),
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Denuncia enviada con éxito', ticket: ticketNumber });
  } catch (error) {
    console.error('❌ Error en /denuncia:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/test-result
// Almacena y levanta alertas según el resultado del test
// ─────────────────────────────────────────────────────
router.post('/test-result', verifyToken, async (req, res) => { // FIX CH-1: agregado verifyToken
  try {
    const {
      estudianteId,
      nombre,
      testId,
      testTitle,
      score,
      nivel,
      colorClass
    } = req.body;

    const now = new Date();
    const ticketNumber = `TST-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    // Si el test arroja un resultado preocupante (.rs-alto-negativo o .rs-bajo-negativo), 
    // se fuerza la alerta crítica. De lo contrario, solo preventiva de registro.
    const isCritical = colorClass.includes('negativo') || colorClass.includes('rs-alto-negativo');
    const alertType = isCritical ? 'Critica' : 'Preventiva';
    const status = isCritical ? 'Pendiente' : 'Completado'; // FIX AL-4: era 'Urgente', no existe en ENUM
    const emoji = isCritical ? '🔴' : '🟢';

    const descripcionCompleta = `📋 [RESULTADO TEST VERSA]
${emoji} Módulo: ${testTitle} (ID: ${testId})
Puntaje Obtenido: ${score}/25
Diagnóstico Semáforo: NIVEL ${nivel.toUpperCase()}

⚠️ Interpretación del Motor:
El estudiante ha completado un módulo de evaluación continua con resultados ${isCritical ? 'PREOCUPANTES' : 'NORMALES'}.
Se requiere revisión de perfil psicosocial.`;

    // 1. Crear registro en BD Alerts
    await createAlert({
      studentName: nombre || 'Estudiante Anónimo',
      studentUsername: estudianteId || '',
      alertType: alertType,
      description: descripcionCompleta,
      ticketNumber: ticketNumber,
      alertDate: now.toISOString().split('T')[0],
      alertTime: now.toTimeString().slice(0, 5),
      status: status
    });

    // 2. Si es crítico, hacer sonar el panel de Admin
    if (isCritical) {
      notificarAdmins({
        tipo: 'test_psicosocial',
        nivel: 'alto',
        prioridad: 'ALTA',
        nombre: nombre || 'Estudiante Anónimo',
        tipo_violencia: `Alerta Psicológica: ${testTitle}`,
        ticket: ticketNumber,
        descripcion: `El estudiante obtuvo nivel ${nivel.toUpperCase()} en Riesgo. Test: ${testTitle}.`,
        timestamp: now.toISOString()
      });
    }

    return res.json({ success: true, message: 'Resultado de test guardado exitosamente', ticket: ticketNumber, isCritical });
  } catch (error) {
    console.error('❌ Error en /test-result:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno en Test API' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/reunion
// Agenda reunión con orientador desde Botpress
// ─────────────────────────────────────────────────────
router.post('/reunion', verificarBotpress, async (req, res) => { // FIX CH-1: agregado verifyToken
  try {
    const { nombre, estudiante_id, fecha, motivo } = req.body;

    if (!nombre || !fecha) {
      return res.status(400).json({ success: false, message: 'Nombre y fecha son requeridos' });
    }

    await query(
      `INSERT INTO chatbot_reuniones 
       (estudiante_id, nombre, fecha_reunion, motivo, estado)
       VALUES (?, ?, ?, ?, 'Pendiente')`,
      [
        estudiante_id || 'anonimo',
        nombre,
        fecha,
        motivo || 'Solicitud desde chatbot PrediVersa'
      ]
    );

    console.log(`📅 Nueva reunión agendada: ${nombre} - ${fecha}`);

    return res.json({
      success: true,
      message: 'Reunión agendada exitosamente',
      data: { nombre, fecha }
    });

  } catch (error) {
    console.error('❌ Error en /chatbot/reunion:', error.message);
    return res.status(500).json({ success: false, message: 'Error al agendar reunión', error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/chatbot/historial/:estudianteId
// Obtiene historial de reportes de un estudiante (detección de reincidencia)
// ─────────────────────────────────────────────────────
router.get('/historial/:estudianteId', async (req, res) => {
  try {
    const { estudianteId } = req.params;

    const reportes = await query(
      `SELECT id, nivel_riesgo, tipo_violencia, frecuencia, createdAt 
       FROM chatbot_reportes 
       WHERE estudiante_id = ? 
       AND nivel_riesgo IN ('medio', 'alto')
       ORDER BY createdAt DESC`,
      [estudianteId]
    );

    const alertas = await query(
      `SELECT id, nivel_riesgo, prioridad, createdAt 
       FROM chatbot_alertas_criticas 
       WHERE estudiante_id = ?
       ORDER BY createdAt DESC`,
      [estudianteId]
    );

    return res.json({
      success: true,
      data: {
        total_reportes: reportes.length,
        total_alertas_criticas: alertas.length,
        es_reincidente: reportes.length >= 2,
        reportes,
        alertas
      }
    });

  } catch (error) {
    console.error('❌ Error en /chatbot/historial:', error.message);
    return res.status(500).json({ success: false, message: 'Error al obtener historial' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/chatbot/alertas
// Obtiene todas las alertas del chatbot para el dashboard
// ─────────────────────────────────────────────────────
router.get('/alertas', async (req, res) => {
  try {
    const { nivel, estado, limit = 50 } = req.query;

    let sql = `SELECT * FROM chatbot_reportes`;
    const params = [];

    const conditions = [];
    if (nivel) { conditions.push('nivel_riesgo = ?'); params.push(nivel); }
    if (estado) { conditions.push('estado = ?'); params.push(estado); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(parseInt(limit));

    const reportes = await query(sql, params);

    const alertasCriticas = await query(
      `SELECT *, 'alto' as tipo_tabla FROM chatbot_alertas_criticas 
       ORDER BY createdAt DESC LIMIT 20`
    );

    const reuniones = await query(
      `SELECT * FROM chatbot_reuniones ORDER BY fecha_solicitud DESC LIMIT 20`
    );

    return res.json({
      success: true,
      data: {
        reportes,
        alertas_criticas: alertasCriticas,
        reuniones
      }
    });

  } catch (error) {
    console.error('❌ Error en GET /chatbot/alertas:', error.message);
    return res.status(500).json({ success: false, message: 'Error al obtener alertas del chatbot' });
  }
});

// ─────────────────────────────────────────────────────
// PUT /api/chatbot/alertas/:id/estado
// Actualiza estado de una alerta del chatbot
// ─────────────────────────────────────────────────────
router.put('/alertas/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, tabla } = req.body; // tabla: 'reportes' o 'alertas_criticas'

    const tableName = tabla === 'alertas_criticas'
      ? 'chatbot_alertas_criticas'
      : 'chatbot_reportes';

    await query(
      `UPDATE ${tableName} SET estado = ? WHERE id = ?`,
      [estado, id]
    );

    return res.json({ success: true, message: 'Estado actualizado' });

  } catch (error) {
    console.error('❌ Error actualizando estado:', error.message);
    return res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/chatbot/estadisticas
// Estadísticas del chatbot para el dashboard
// ─────────────────────────────────────────────────────
router.get('/estadisticas', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM chatbot_reportes) as total_interacciones,
        (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'bajo') as riesgo_bajo,
        (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'medio') as riesgo_medio,
        (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'alto') as riesgo_alto_reportes,
        (SELECT COUNT(*) FROM chatbot_alertas_criticas) as total_alertas_criticas,
        (SELECT COUNT(*) FROM chatbot_reportes WHERE estado = 'pendiente') as pendientes_atencion,
        (SELECT COUNT(*) FROM chatbot_reuniones) as reuniones_agendadas
    `);

    const s = stats[0] || {};

    return res.json({
      success: true,
      data: {
        total_interacciones: s.total_interacciones || 0,
        riesgo_bajo: s.riesgo_bajo || 0,
        riesgo_medio: s.riesgo_medio || 0,
        riesgo_alto: (s.riesgo_alto_reportes || 0) + (s.total_alertas_criticas || 0),
        alertas_criticas: s.total_alertas_criticas || 0,
        pendientes_atencion: s.pendientes_atencion || 0,
        reuniones_agendadas: s.reuniones_agendadas || 0
      }
    });

  } catch (error) {
    console.error('❌ Error en estadísticas:', error.message);
    return res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/chatbot/corregir
// Guarda corrección manual del admin para "entrenar" la IA
// ─────────────────────────────────────────────────────
router.post('/corregir', async (req, res) => {
  try {
    const { mensaje_original, nivel_original, nivel_corregido, razon, admin_id } = req.body;

    await query(
      `INSERT INTO chatbot_ajustes_ia 
       (mensaje_original, nivel_original, nivel_corregido, razon_ajuste, admin_id)
       VALUES (?, ?, ?, ?, ?)`,
      [mensaje_original, nivel_original, nivel_corregido, razon, admin_id]
    );

    console.log(`🧠 Ajuste IA guardado: ${nivel_original} -> ${nivel_corregido}`);

    return res.json({
      success: true,
      message: 'Corrección registrada. El sistema usará esto para mejorar futuros análisis.'
    });

  } catch (error) {
    console.error('❌ Error guardando ajuste IA:', error.message);
    return res.status(500).json({ success: false, message: 'Error al guardar corrección' });
  }
});

module.exports = router;
