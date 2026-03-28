const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const { query, executeQuery } = require('../db/connection');
const { invokeMotorVersaLambda } = require('../utils/lambdaService');
const { createAlert } = require('../db/users');
const centralAI = require('../utils/centralAIService');
const { sendToLex } = require('../utils/lexService');
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Clientes AWS
const awsRegion = process.env.AWS_REGION || "us-east-1";
const snsClient = new SNSClient({ region: awsRegion });
const sesClient = new SESClient({ region: awsRegion });

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
  const { text, sessionId, historial = [] } = req.body;
  const user = req.user;

  // RESPUESTA POR DEFECTO (POR SI LEX O LA RED FALLAN)
  let lexResponse = {
    messages: [{ content: "He recibido tu información. Estoy procesando tu mensaje de forma segura para brindarte la mejor orientación." }],
    intent: 'FallbackLocal'
  };

  try {
    if (!text) return res.status(400).json({ success: false, message: 'Falta texto' });

    // 1. Análisis de Riesgo (Risk Index v2 + IA Central)
    let finalRisk = 'BAJO';
    let finalScore = 0;
    let riskResult = {};

    try {
      riskResult = await centralAI.analizarRiesgo({ mensaje: text, historial });
      finalRisk = riskResult.nivel_riesgo;
      finalScore = riskResult.score;
    } catch (e) { 
      console.error('⚠️ Error en análisis de riesgo:', e.message);
      if (text.toLowerCase().includes('morir')) finalRisk = 'ALTO';
    }

    // 2. Comunicación Combinada (Amazon Lex + Motor AI Central)
    try {
      const realLexResponse = await sendToLex(user.id || sessionId || 'anonimo', text);
      if (realLexResponse) {
        if (realLexResponse.intent) lexResponse.intent = realLexResponse.intent;
      }

      const respuestaDinamica = await centralAI.generarRespuesta({
        mensaje: text,
        nivelRiesgo: finalRisk,
        historial: historial
      });

      if (respuestaDinamica) {
        lexResponse.messages = [{ content: respuestaDinamica }];
      }
      finalResponse = lexResponse.messages[0].content;

      // 3. PERSISTENCIA Y MÉTRICAS (Producto Real)
      await executeQuery(
        `INSERT INTO chatbot_interacciones (session_id, user_input, response, risk, risk_score)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id || sessionId || 'anonimo', text, finalResponse, finalRisk, finalScore]
      );
    } catch (error) {
      console.error('❌ Error en Motor AI o Lex:', error.message);
      finalResponse = lexResponse.messages[0].content;
    }

    // 3. Persistencia de Alertas (Todos los niveles de riesgo van al Dashboard de Admin)
    try {
      if (['alto', 'medio', 'bajo'].includes(finalRisk)) {
        const ticket = `LEX-${Date.now()}`;

        let tipoAlerta = 'Informativa'; // Por defecto para 'bajo'
        if (finalRisk === 'alto') tipoAlerta = 'Critica';
        else if (finalRisk === 'medio') tipoAlerta = 'Advertencia';

        const alertSummary = riskResult.razon || `Intención: ${riskResult.intencion_principal || 'N/A'}`;
        const detectedEmotions = (riskResult.emociones_detectadas || []).join(', ');

        await createAlert({
          studentName: user.name || 'Estudiante Lex',
          studentUsername: user.email || '',
          alertType: tipoAlerta,
          description: `[SISTEMA VERSA v2 - ${finalRisk.toUpperCase()}]\n\nMensaje: "${text}"\n\nAnálisis IA:\n- Razonamiento: ${alertSummary}\n- Emociones: ${detectedEmotions}\n- Palabras Clave: ${(riskResult.palabras_clave_criticas || []).join(', ')}`,
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

        // ESCALAMIENTO REAL-TIME VÍA SMS (AWS SNS) Y EMAIL (AWS SES)
        if (finalRisk === 'alto') {
          console.log(`🚨 Escalando vía SMS y Email a administradores: Caso ${ticket}`);
          try {
            // ================== 1. ENVÍO DE SMS ==================
            // Aquí puedes agregar 1, 3 o hasta 10 números separados por comas.
            const numerosAdmin = [
              "+573206708788", // Rector
              "+573225892184", // Psicología
              "+573234071416"  // Coordinador
            ];
            
            const messageText = `🚨 ALERTA CRÍTICA PREDIVERSA 🚨\nTicket: ${ticket}\nEstudiante: ${user.name || 'Estudiante Lex'}\nRiesgo: ALTO.\nIngresa al Dashboard urgente.`;
            
            const smsPromises = numerosAdmin.map(numero =>
              snsClient.send(new PublishCommand({ Message: messageText, PhoneNumber: numero }))
            );
            
            await Promise.allSettled(smsPromises);
            console.log('✅ SMS enviados al comité administrativo.');

            // ================== 2. ENVÍO DE EMAIL ==================
            const correosAdministrativos = [
              "ha.l@lanuevaamerica.edu.co",
              "h.salcedob@lanuevaamerica.edu.co",
              "jm.calvou@lanuevaamerica.edu.co"
            ];
            
            try {
              const emailParams = {
                // El remitente debe ser uno de los correos autorizados en SES Sandbox
                Source: "ha.l@lanuevaamerica.edu.co", 
                // Se envía copia a todo el comité
                Destination: { ToAddresses: correosAdministrativos }, 
                Message: {
                  Subject: { Data: `🚨 IMPORTANTE: Alerta de Riesgo Alto - Ticket ${ticket}` },
                  Body: {
                    Html: { Data: `
                      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ff4d4f; border-radius: 8px;">
                        <h2 style="color: #ff4d4f; margin-top: 0;">🚨 ALERTA DE SEGURIDAD ESCOLAR - RIESGO ALTO</h2>
                        <p>El Motor de Inteligencia Artificial (Versa) acaba de detectar una situación crítica en el chat.</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>🔖 Ticket:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${ticket}</td></tr>
                          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Estudiante:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.name || 'Estudiante Lex'} / Correo: ${user.email || 'N/A'}</td></tr>
                          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>💬 Mensaje detectado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; background: #fff0f0;">"${text}"</td></tr>
                          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>⚠️ Nivel de Riesgo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #e11d48; font-weight: bold;">ALTO</td></tr>
                        </table>
                        <p style="margin-top: 20px;">Por favor, ingresa inmediatamente al Panel de Estudiante > <strong>Dashboard Administrativo</strong> para tomar acción.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
                        <small style="color: #666;">Este es un mensaje automático generado de forma confidencial por PrediVersa.</small>
                      </div>
                    ` },
                    Text: { Data: `ALERTA DE RIESGO ALTO\n\nTicket: ${ticket}\nEstudiante: ${user.name}\nMensaje: "${text}"\n\nIngresa urgente al panel.` }
                  }
                }
              };

              await sesClient.send(new SendEmailCommand(emailParams));
              console.log('✅ Correo(s) electrónico(s) de alerta enviado(s) al comité.');
            } catch (emailError) {
              console.error('⚠️ Error enviando Email de Alerta (¿Están verificados en AWS SES?):', emailError.message);
            }

          } catch (snsError) {
            console.error('❌ Error en proceso de escalamiento:', snsError.message);
          }
        }
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
