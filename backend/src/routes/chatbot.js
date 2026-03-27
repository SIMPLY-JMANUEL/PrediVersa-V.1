const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const { query } = require('../db/connection');
const { analyzeText } = require('../utils/motorVersa');
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
  const user = req.user; // De verifyToken

  try {
    if (!text) return res.status(400).json({ success: false, message: 'Falta texto' });

    // 1. Análisis de Riesgo (Motor Versa + IA Central si es necesario)
    const riskResult = analyzeText(text, 'no_especificado', 'unica_vez', []);
    let finalRisk = riskResult.nivel_riesgo;
    let finalScore = riskResult.score;

    if (riskResult.requiere_gemini) {
      try {
        const geminiResult = await centralAI.analizarRiesgo({ mensaje: text });
        finalRisk = geminiResult.nivel_riesgo || finalRisk;
        finalScore = geminiResult.score || finalScore;
      } catch (e) { console.error('Falló validación Gemini, usando motor local'); }
    }

    // 2. Comunicación con Amazon Lex (ID: DERGWSU1C8)
    const lexResponse = await sendToLex(user.id || sessionId || 'anonimo', text);
    
    // 3. Persistencia de Alertas (Si riesgo es Medio/Alto)
    if (finalRisk === 'alto' || finalRisk === 'medio') {
      const ticket = `LEX-${Date.now()}`;
      await createAlert({
        studentName: user.name || 'Estudiante Lex',
        studentUsername: user.email || '',
        alertType: finalRisk === 'alto' ? 'Critica' : 'Advertencia',
        description: `[ALERTA AMAZON LEX - ${finalRisk.toUpperCase()}]\n${text}\n\nInterpretación Lex: ${lexResponse.intent}`,
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

    // 4. Responder al Frontend
    return res.json({
      success: true,
      botResponse: lexResponse.messages.map(m => m.content).join('\n') || 'Lex está procesando tu solicitud...',
      risk: {
        level: finalRisk,
        score: finalScore,
        keywords: riskResult.keywords_detectadas
      },
      lexIntent: lexResponse.intent
    });

  } catch (error) {
    console.error('❌ Error en unified /message:', error.message);
    return res.status(500).json({ success: false, message: 'Error procesando mensaje' });
  }
});

/**
 * 🔍 DIAGNÓSTICO: /api/chatbot/check
 * Verifica que las variables de AWS estén cargadas sin exponer secretos.
 */
router.get('/check', verifyToken, (req, res) => {
    const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'LEX_BOT_ID', 'LEX_BOT_ALIAS_ID'];
    const status = required.reduce((acc, v) => {
        acc[v] = process.env[v] ? '✅ CARGADA' : '❌ FALTANTE';
        return acc;
    }, {});
    
    return res.json({
        success: true,
        diagnostico: status,
        nota: "Si alguna aparece como 'FALTANTE', debes agregarla en la consola de AWS App Runner."
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
