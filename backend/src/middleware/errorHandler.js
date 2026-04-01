const logger = require('../utils/logger');

/**
 * MIDDLEWARE DE GESTIÓN CENTRALIZADA DE ERRORES
 * Captura y loguea errores de forma estructurada.
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // LOG ESTRUCTURADO (Para CloudWatch)
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    requestId: req.requestId,
    userId: req.user ? req.user.id : 'anonimo',
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    isOperational: err.isOperational || false
  });

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      requestId: req.requestId,
      stack: err.stack
    });
  }

  // PRODUCCIÓN: No filtrar detalles internos (solo mensajes operacionales)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      requestId: req.requestId
    });
  } else {
    // Error crítico/desconocido (ej. crash de DB)
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal en nuestros servidores. Reporta el RequestId.',
      requestId: req.requestId
    });
  }
};

module.exports = globalErrorHandler;
