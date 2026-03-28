const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const { query } = require('../db/connection');
const { invokeMotorVersaLambda } = require('../utils/lambdaService');
const { createAlert } = require('../db/users');
const centralAI = require('../utils/centralAIService');
const { sendToLex } = require('../utils/lexService');

// SSE — Admin connection
const { adminClients, notificarAdmins } = require('../utils/notificaciones');

// GET /api/chatbot/stream (No changes needed)
router.get('/stream', verifyToken, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ tipo: 'conexion', mensaje: 'Conectado al sistema de alertas Lex Versa ✅' })}\n\n`);
  adminClients.add(res);
  
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); }
    catch (e) { clearInterval(ping); adminClients.delete(res); }
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    adminClients.delete(res);
  });
});

/**
 * 🚀 NUEVO ENDPOINT UNIFICADO: /api/chatbot/message
 * Procesa mensaje vía Motor Versa (Riesgo) y responde vía Amazon Lex
 */
router.post('/message', verifyToken, async (req, res) => {
  const { text, sessionId } = req.body;
  const user = req.user; 
  
  // RESPUESTA POR DEFECTO (POR SI LEX O LA RED FALLAN)
  let lexResponse = { 
    messages: [{ content: "He recibido tu información. Estoy procesando tu mensaje de forma segura para brindarte la mejor orientación." }], 
    intent: 'FallbackLocal' 
  };

  try {
    if (!text) return res.status(400).json({ success: false, message: 'Falta texto' });

    // 1. Análisis de Riesgo (Motor Versa + IA Central si es necesario)
    let finalRisk = 'bajo';
    let finalScore = 0;
    let riskResult = { keywords_detectadas: [] };

    try {
      riskResult = await invokeMotorVersaLambda({
        texto: text,
        tipoViolencia: 'no_especificado',
        frecuencia: 'unica_vez',
        historial: []
      });
      finalRisk = riskResult.nivel_riesgo;
      finalScore = riskResult.score;

      if (riskResult.requiere_gemini) {
        try {
          const geminiResult = await centralAI.analizarRiesgo({ mensaje: text });
          finalRisk = geminiResult.nivel_riesgo || finalRisk;
          finalScore = geminiResult.score || finalScore;
        } catch (e) { console.error('Falló validación Gemini, usando motor local'); }
      }
    } catch (e) { console.error('⚠️ Falló motor de riesgo, continuando con respuesta Lex'); }

    // 2. Comunicación con Amazon Lex (CON FALLBACK DE SEGURIDAD)
    try {
      const realLexResponse = await sendToLex(user.id || sessionId || 'anonimo', text);
      if (realLexResponse && realLexResponse.messages?.length > 0) {
        lexResponse = realLexResponse;
      }
    } catch (error) {
       console.error('❌ Error comunicando con Lex, activando IA de respaldo local:', error.message);
       // Respuesta manual basada en el riesgo analizado por Motor Versa
       if (finalRisk === 'alto') {
         lexResponse.messages = [{ content: "Entiendo que estás pasando por un momento difícil. He escalado tu mensaje de forma urgente a nuestros orientadores. Pronto te contactaremos." }];
       } else if (finalRisk === 'medio') {
         lexResponse.messages = [{ content: "Tu bienestar es importante para nosotros. He registrado tu reporte. ¿Hay algo más en lo que te gustaría profundizar?" }];
       }
    }
    
    // 3. Persistencia de Alertas (Si riesgo es Medio/Alto)
    try {
      if (finalRisk === 'alto' || finalRisk === 'medio') {
        const ticket = `LEX-${Date.now()}`;
        await createAlert({
          studentName: user.name || 'Estudiante Lex',
          studentUsername: user.email || '',
          alertType: finalRisk === 'alto' ? 'Critica' : 'Advertencia',
          description: `[ALERTA PREDIVERSA - ${finalRisk.toUpperCase()}]\n${text}\n\nResumen: ${riskResult.resumen || 'Análisis Automático'}`,
          ticketNumber: ticket,
          status: 'Pendiente'
        });

        notificarAdmins({
          tipo: 'alerta_lex',
          nivel: finalRisk,
          estudiante: user.name || 'Estudiante Lex',
          ticket: ticket,
          mensaje: text.substring(0, 100) + '...'
        });
      }
    } catch (e) { console.error('⚠️ No se pudo guardar la alerta en DB, pero el chat sigue vivo.'); }

    // 4. Responder al Frontend (GARANTIZADO)
    return res.json({
      success: true,
      botResponse: lexResponse.messages.map(m => m.content).join('\n'),
      risk: {
        level: finalRisk,
        score: finalScore,
        keywords: riskResult.keywords_detectadas || []
      },
      lexIntent: lexResponse.intent
    });

  } catch (error) {
    console.error('❌ ERROR FATAL EN CHATBOT /message:', error);
    // Respuesta de pánico absoluta (último recurso)
    return res.json({ 
      success: true, 
      botResponse: "Gracias por escribirnos. Estamos revisando tu solicitud con nuestros profesionales para darte una respuesta adecuada.",
      risk: { level: 'desconocido', score: 0, keywords: [] },
      lexIntent: 'EmergencyFallback'
    });
  }
});

/**
 * 🔍 DIAGNÓSTICO: /api/chatbot/check
 * Verifica que las variables de AWS estén cargadas sin exponer secretos.
 */
router.get('/check', (req, res) => {
    const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'LEX_BOT_ID', 'LEX_BOT_ALIAS_ID', 'DB_HOST', 'DB_DATABASE'];
    const status = required.reduce((acc, v) => {
        acc[v] = process.env[v] ? '✅ CARGADA' : '❌ NO DEFINIDA';
        return acc;
    }, {});
    
    return res.json({
        success: true,
        diagnostico: status,
        config_actual: {
            region: process.env.AWS_REGION || 'us-east-1',
            botId: process.env.LEX_BOT_ID || 'DERGWSU1C8',
            // XVK50SN8KY = PrediVersaAlias (Producción, Versión 1)
            aliasId: process.env.LEX_BOT_ALIAS_ID || 'XVK50SN8KY',
            localeId: process.env.LEX_LOCALE_ID || 'es_US',
            db_host: process.env.DB_HOST ? `${process.env.DB_HOST.substring(0, 20)}...` : 'NO DEFINIDO',
            db_name: process.env.DB_DATABASE || 'NO DEFINIDO',
            lambda_motor: process.env.LAMBDA_MOTOR_VERSA_NAME || 'MotorVersaEngine',
            usa_lambda: process.env.USE_LAMBDA_MOTOR || 'false'
        }
    });
});


// Mantener endpoints de estadísticas y administración (Dashboard)
router.get('/estadisticas', verifyToken, async (req, res) => {
    try {
        const stats = await query(`
          SELECT 
            (SELECT COUNT(*) FROM chatbot_reportes) as total_interacciones,
            (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'bajo') as riesgo_bajo,
            (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'medio') as riesgo_medio,
            (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'alto') as riesgo_alto_reportes,
            (SELECT COUNT(*) FROM chatbot_alertas_criticas) as total_alertas_criticas,
            (SELECT COUNT(*) FROM chatbot_reuniones) as reuniones_agendadas
        `);
        const s = stats[0] || {};
        return res.json({ success: true, data: { ...s, total_lex_active: true } });
    } catch (error) { res.status(500).json({ success: false }); }
});

module.exports = router;
