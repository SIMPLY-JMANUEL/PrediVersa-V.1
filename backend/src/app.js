const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { securityMiddleware, globalLimiter } = require('./middleware/security');
const requestIdMiddleware = require('./middleware/requestId');
const globalErrorHandler = require('./middleware/errorHandler');

// --- ARQUITECTURA POR DOMINIOS (Modular DDD-lite) ---
const authModule = require('./modules/auth/auth.routes');
const userModule = require('./modules/users/users.routes');
const alertModule = require('./modules/alerts/alerts.routes');
const chatbotModule = require('./modules/chatbot/chatbot.routes');
const dashboardModule = require('./modules/dashboard/dashboard.routes');
const configModule = require('./modules/config/config.routes');

const app = express();

// Middlewares - BLINDAJE DE SEGURIDAD GLOBAL & OBSERVABILIDAD
app.use(requestIdMiddleware); // Rastreo UUID por petición (Trazabilidad)
securityMiddleware(app); // Configuración de Helmet y headers de seguridad
app.use(globalLimiter); // Protección contra DoS y escaneo de IPs (100 req / 15 min)
app.use(cookieParser()); // Habilitar lectura de cookies para Refresh Tokens

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedPatterns = [
      /https:\/\/.*\.amplifyapp\.com$/, 
      /https:\/\/.*\.awsapprunner\.com$/,
      /http:\/\/localhost:\d+$/
    ];
    if (!origin || allowedPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ACTIVACIÓN DE MÓDULOS DE DOMINIO ---
app.use('/api/auth', authModule);      // 🛡️ Seguridad
app.use('/api/users', userModule);     // 👤 Personas
app.use('/api/alerts', alertModule);   // 📢 Alertas/Casos
app.use('/api/chatbot', chatbotModule);// 🤖 IA Motor Versa
app.use('/api/dashboard', dashboardModule); // 📊 Analítica
app.use('/api/config', configModule);  // ⚙️ Administración

// Static files (Frontend)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Health check
const { testConnection } = require('./db/connection');
app.get('/api/health', async (req, res) => {
  try {
    const isDbConnected = await testConnection();
    res.json({ 
      status: isDbConnected ? 'online' : 'error',
      database: isDbConnected ? 'CONECTADO ✅' : 'FALLO DE CONEXIÓN ❌',
      serverTime: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ status: 'error', database: 'DESCONECTADO ❌', error: e.message });
  }
});

// SPA Fallback
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `La ruta ${req.originalUrl} no existe.` });
});

// Error Handler CENTRALIZADO (Observability Layer)
app.use(globalErrorHandler);

module.exports = app;
