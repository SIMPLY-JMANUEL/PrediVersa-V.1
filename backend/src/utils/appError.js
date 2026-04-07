/**
 * CLASE DE ERROR PERSONALIZADA (DevSecOps & Observability)
 * Permite diferenciar entre errores operacionales (4xx) y fallos de sistema (5xx).
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational; // true = operacional (ej. validación), false = crítico (ej. base de datos)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
