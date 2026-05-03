const express = require('express');
const chatbotController = require('./chatbot.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/chatbot/stream
 * @desc SSE para notificaciones en tiempo real (Solo Admin y Colaboradores)
 * Blindaje: Se requiere rol administrativo para evitar fuga de privacidad estudiantil.
 */
router.get('/stream', 
  verifyToken, 
  authorizeRoles('Administrador', 'Colaboradores'), 
  chatbotController.getStream
);

/**
 * @route POST /api/chatbot/message
 * @desc Mensajería unificada con Amazon Lex y Motor VERSA (DDD)
 */
router.post('/message', 
  verifyToken, 
  chatbotController.postMessage
);

/**
 * @route POST /api/chatbot/analizar
 * @desc Análisis de riesgo inmediato (Motor VERSA v3.1 Titanium)
 */
router.post('/analizar',
  verifyToken,
  chatbotController.analyze
);

/**
 * @route POST /api/chatbot/chat-ia
 * @desc Generación de respuesta conversacional empática
 */
router.post('/chat-ia',
  verifyToken,
  chatbotController.chatIA
);

/**
 * @route POST /api/chatbot/alerta
 * @desc Registro de alertas críticas desde el chatbot
 */
router.post('/alerta',
  verifyToken,
  chatbotController.createAlert
);

/**
 * @route POST /api/chatbot/reunion
 * @desc Solicitud de citas con orientación
 */
router.post('/reunion',
  verifyToken,
  chatbotController.createMeeting
);

/**
 * @route GET /api/chatbot/stats
 * @desc Estadísticas para Dashboard Administrativo
 */
router.get('/stats', 
  verifyToken, 
  authorizeRoles('Administrador'), 
  chatbotController.getStats
);

/**
 * @route GET /api/chatbot/integrity
 * @desc Diagnóstico de infraestructura (Solo Admin)
 */
router.get('/integrity', 
  verifyToken, 
  authorizeRoles('Administrador'), 
  chatbotController.checkIntegrity
);

module.exports = router;
