const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * 🛰️ MIDDLEWARE DE ENFORCEMENT HTTPS (DevSecOps)
 * Detecta el tráfico desde el balanceador de carga de AWS App Runner.
 */
const enforceHTTPS = (req, res, next) => {
  // AWS App Runner envía el protocolo original en 'x-forwarded-proto'
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};

/**
 * 🛡️ CONFIGURACIÓN DE RATE LIMITING GLOBAL
 * Evita ataques de Denegación de Servicio (DoS) y escaneo masivo.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 reqs por IP
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
  },
  standardHeaders: true, // Retorna info de límite en 'RateLimit-*' headers
  legacyHeaders: false,
});

/**
 * 🔥 PROTECCIÓN CONTRA FUERZA BRUTA (BRUTE FORCE) EN LOGIN
 * Limita intentos de inicio de sesión para proteger las cuentas.
 */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Solo 5 intentos permitidos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. IP bloqueada por 10 minutos.'
  },
  handler: (req, res, next, options) => {
    console.warn(`🚨 POSIBLE ATAQUE DE FUERZA BRUTA detectado desde IP: ${req.ip} intentando entrar a ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 📧 PROTECCIÓN PARA RECUPERACIÓN DE CONTRASEÑA
 * Evita el spam de correos de recuperación.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 solicitudes por hora por IP
  message: {
    success: false,
    message: 'Has solicitado demasiadas recuperaciones. Por favor intenta de nuevo en una hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🧠 MIDDLEWARE DE SEGURIDAD GENERAL (HELMET)
 * Configura encabezados HTTP de seguridad de forma estricta.
 */
const securityMiddleware = (app) => {
  // Helmet configura encabezados contra Clickjacking, XSS, MIME Sniffing, etc.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://*.amplifyapp.com", "https://*.awsapprunner.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 año (HSTS Proyectado para Producción)
      includeSubDomains: true,
      preload: true
    }
  }));

  // Ocultar que usamos Express para prevenir ataques dirigidos
  app.disable('x-powered-by');

  // Enforce HTTPS en Producción
  if (process.env.NODE_ENV === 'production') {
    app.use(enforceHTTPS);
  }

  console.log('✅ Escudo de seguridad DevSecOps (HSTS + HTTPS Enforce) activado.');
};

module.exports = {
  globalLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  securityMiddleware,
  enforceHTTPS
};
