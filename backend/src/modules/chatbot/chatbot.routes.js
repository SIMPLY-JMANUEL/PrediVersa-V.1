const express = require('express');
const chatbotController = require('./chatbot.controller');
const { verifyToken } = require('../../middleware/auth');

const router = express.Router();

/**
 * RUTAS DEL DOMINIO CHATBOT / MOTOR VERSA IA
 */

// Streaming de Alertas en Tiempo Real (SSE)
router.get('/stream', verifyToken, chatbotController.getStream);

// Procesamiento de Mensajes (IA Central + Lex Bridge)
router.post('/message', verifyToken, chatbotController.postMessage);

// Diagnóstico de Conexión AWS / DB
router.get('/check', chatbotController.checkIntegrity);

// Estadísticas de Predictivas Lex Versa
router.get('/estadisticas', verifyToken, chatbotController.getStats);

module.exports = router;
