const { v4: uuidv4 } = require('uuid');

/**
 * MIDDLEWARE DE IDENTIFICACIÓN DE PETICIÓN (TRAZABILIDAD)
 * Asigna un UUID único a cada request para rastreo en logs.
 */
const requestIdMiddleware = (req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId); // Para que el cliente pueda reportarlo
  next();
};

module.exports = requestIdMiddleware;
