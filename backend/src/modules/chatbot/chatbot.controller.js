const chatbotService = require('./chatbot.service');
const AppError = require('../../utils/appError');
const { adminClients } = require('../../utils/notificaciones');

/**
 * CONTROLADOR (EXPRESS INTERFACE) - DOMINIO CHATBOT (Motor Versa IA)
 */

const postMessage = async (req, res, next) => {
  try {
    const { text, sessionId, historial = [] } = req.body;
    const user = req.user || { id: 'anonimo', name: 'Estudiante Lex' };
    
    if (!text) return next(new AppError('El mensaje de texto es obligatorio', 400));

    const result = await chatbotService.processMessage(text, user, sessionId, historial);

    res.json({
      success: true,
      botResponse: result.finalResponse,
      risk: {
        level: result.riskResult.nivel_riesgo,
        score: result.riskResult.score,
        keywords: result.riskResult.keywords_detectadas || []
      },
      lexIntent: result.riskResult.intent || 'MessageProcessed',
      requestId: req.requestId
    });
  } catch (error) {
    // Si falla la IA, no matamos la petición, pero lo logueamos como error operacional de sistema
    next(new AppError(`Fallo en el procesamiento IA: ${error.message}`, 500, false));
  }
};

const getStream = (req, res) => {
  // SSE: No usa next(error) directamente ya que es un stream abierto
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); 
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ tipo: 'conexion', mensaje: 'Rastreo SSE Activado', requestId: req.requestId })}\n\n`);
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
};

const getStats = async (req, res, next) => {
  try {
    const stats = await chatbotService.getStats();
    res.json({ success: true, data: { ...stats }, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const checkIntegrity = (req, res) => {
  const required = ['AWS_REGION', 'DB_HOST', 'DB_DATABASE', 'JWT_SECRET'];
  const status = required.reduce((acc, v) => ({ ...acc, [v]: process.env[v] ? '✅' : '❌' }), {});
  res.json({ success: true, diagnostico: status, requestId: req.requestId });
};

const analyze = async (req, res, next) => {
  try {
    const { mensaje, estudiante_id } = req.body;
    if (!mensaje) return next(new AppError('El mensaje es obligatorio', 400));

    const data = await chatbotService.analyzeRisk(mensaje, estudiante_id);
    res.json({ success: true, data, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const chatIA = async (req, res, next) => {
  try {
    const { mensaje, nivelRiesgo, historial = [] } = req.body;
    if (!mensaje) return next(new AppError('El mensaje es obligatorio', 400));

    const respuesta = await chatbotService.generateAIResponse(mensaje, nivelRiesgo, historial);
    res.json({ success: true, respuesta, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const alert = await chatbotService.createAlert(req.body);
    res.json({ success: true, alert, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const result = await chatbotService.createMeeting(req.body);
    res.json({ success: true, ...result, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postMessage,
  analyze,
  chatIA,
  createAlert,
  createMeeting,
  getStream,
  getStats,
  checkIntegrity
};
