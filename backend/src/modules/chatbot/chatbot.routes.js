const express = require('express');
const { verifyToken } = require('../../middleware/auth');
const { query, executeQuery } = require('../../db/connection');
const { sendToLex } = require('../../utils/lexService');
const centralAI = require('../../utils/centralAIService');
const { createAlert } = require('../../db/users');
const { PublishCommand } = require("@aws-sdk/client-sns");
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { snsClient, sesClient } = require('../../utils/awsConfig');
const { adminClients, notificarAdmins } = require('../../utils/notificaciones');

const router = express.Router();

/**
 * @route GET /api/chatbot/stream
 * @desc SSE para notificaciones en tiempo real al administrador
 */
router.get('/stream', verifyToken, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ tipo: 'conexion', mensaje: 'Conectado al sistema de alertas Lex Versa ✅' })}\n\n`);
  adminClients.add(res);

  const ping = setInterval(() => {
    try { 
      res.write(': ping\n\n'); 
      if (typeof res.flush === 'function') res.flush();
    } catch (e) { 
      clearInterval(ping); 
      adminClients.delete(res); 
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(ping);
    adminClients.delete(res);
  });

  req.on('error', (err) => {
    console.error('❌ Error en stream SSE:', err.message);
    clearInterval(ping);
    adminClients.delete(res);
  });
});

/**
 * @route POST /api/chatbot/message
 * @desc Mensajería unificada con Amazon Lex y Motor VERSA (DDD)
 */
router.post('/message', verifyToken, async (req, res) => {
  const { text, sessionId, historial = [] } = req.body;
  const user = req.user;

  let lexResponse = {
    messages: [{ content: "He recibido tu información. Estoy procesando tu mensaje de forma segura." }],
    intent: 'FallbackLocal'
  };

  try {
    if (!text) return res.status(400).json({ success: false, message: 'Falta texto' });

    // 1. Análisis de Riesgo
    let finalRisk = 'BAJO';
    let finalScore = 0;
    let riskResult = {};

    try {
      riskResult = await centralAI.analizarRiesgo({ mensaje: text, historial });
      finalRisk = (riskResult.nivel_riesgo || 'BAJO').toUpperCase();
      finalScore = riskResult.score || 0;
    } catch (e) { 
      console.error('⚠️ Error en análisis de riesgo:', e.message);
      if (text.toLowerCase().includes('morir')) finalRisk = 'ALTO';
    }

    // 2. Comunicación Combinada (Lex + CentralAI)
    let finalResponse = lexResponse.messages[0].content;

    try {
      await sendToLex(user.id || sessionId || 'anonimo', text);
      const respuestaDinamica = await centralAI.generarRespuesta({
        mensaje: text,
        nivelRiesgo: finalRisk,
        historial: historial
      });

      if (respuestaDinamica) {
        finalResponse = respuestaDinamica;
      }
    } catch (error) {
      console.error('❌ Error en Motor AI o Lex:', error.message);
    }

    // 3. Persistencia
    await executeQuery(
      `INSERT INTO chatbot_interacciones (session_id, user_input, response, risk, risk_score)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id || sessionId || 'anonimo', text, finalResponse, finalRisk, finalScore]
    );

    // 4. Alertas y Escalamiento
    if (['ALTO', 'MEDIO', 'BAJO'].includes(finalRisk)) {
      const ticket = `LEX-${Date.now()}`;
      let tipoAlerta = (finalRisk === 'ALTO') ? 'Critica' : (finalRisk === 'MEDIO' ? 'Advertencia' : 'Informativa');

      await createAlert({
        studentName: user.name || 'Estudiante Lex',
        studentUsername: user.email || '',
        alertType: tipoAlerta,
        description: `[ALERTA VERSA - EJE: ${riskResult.eje_principal || 'GENERAL'}]\n\n"${text}"\n\nAcción: ${riskResult.accion_sugerida || 'Monitoreo'}`,
        ticketNumber: ticket,
        status: (finalRisk === 'ALTO') ? 'Urgente' : 'Pendiente'
      });

      notificarAdmins({
        tipo: 'alerta_lex',
        nivel: finalRisk,
        estudiante: user.name || 'Estudiante Lex',
        ticket: ticket,
        mensaje: text.substring(0, 50) + '...'
      });

      // Escalamiento AWS (SNS/SES) si es ALTO
      if (finalRisk === 'ALTO') {
        const messageText = `🚨 ALERTA CRÍTICA PREDIVERSA 🚨\nTicket: ${ticket}\nEstudiante: ${user.name}\nRiesgo: ALTO.`;
        const numerosAdmin = ["+573206708788", "+573225892184"];
        
        numerosAdmin.forEach(numero => {
          snsClient.send(new PublishCommand({ Message: messageText, PhoneNumber: numero })).catch(() => {});
        });

        const emailParams = {
          Source: "ha.l@lanuevaamerica.edu.co",
          Destination: { ToAddresses: ["ha.l@lanuevaamerica.edu.co"] },
          Message: {
            Subject: { Data: `🚨 Alerta Riesgo Alto - ${ticket}` },
            Body: { Html: { Data: `<h2>Alerta Crítica</h2><p>Estudiante: ${user.name}</p><p>Mensaje: ${text}</p>` } }
          }
        };
        sesClient.send(new SendEmailCommand(emailParams)).catch(() => {});
      }
    }

    return res.json({
      success: true,
      botResponse: finalResponse,
      risk: { level: finalRisk, score: finalScore },
      lexIntent: lexResponse.intent
    });

  } catch (error) {
    console.error('❌ ERROR EN CHATBOT DDD:', error);
    return res.json({
      success: true,
      botResponse: "Estamos procesando tu solicitud.",
      risk: { level: 'ERROR', score: 0 }
    });
  }
});

/**
 * @route GET /api/chatbot/stats
 * @desc Estadísticas para Dashboard Administrativo
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [stats] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM chatbot_interacciones) as total_interacciones,
        (SELECT COUNT(*) FROM chatbot_interacciones WHERE risk = 'BAJO') as riesgo_bajo,
        (SELECT COUNT(*) FROM chatbot_interacciones WHERE risk = 'MEDIO') as riesgo_medio,
        (SELECT COUNT(*) FROM chatbot_interacciones WHERE risk = 'ALTO') as riesgo_alto
    `);
    return res.json({ success: true, data: stats });
  } catch (error) { 
    res.status(500).json({ success: false, message: error.message }); 
  }
});

module.exports = router;
