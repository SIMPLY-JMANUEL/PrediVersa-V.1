const winston = require('winston');

/**
 * LOGGER ESTRUCTURADO (WINSTON)
 * Genera logs en formato JSON para máxima compatibilidad con AWS CloudWatch.
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Estructura JSON para observabilidad real
  ),
  defaultMeta: { service: 'prediversa-backend' },
  transports: [
    // Consola para AWS CloudWatch / App Runner logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
