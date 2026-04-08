const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const alertRoutes = require('./modules/alerts/alerts.routes');
const chatbotRoutes = require('./modules/chatbot/chatbot.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const configRoutes = require('./modules/config/config.routes');

const app = express();

// Middlewares
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-botpress-token'],
  credentials: true
};

// Permitir preflight requests
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
// Middlewares (Blindados para Cargas Masivas)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);


// --- SERVIDOR ESTÁTICO Y FALLBACK DE SPA (PARA EVITAR 404 EN /student) ---
const frontendPath = path.join(__dirname, '../../frontend/dist');
const fs = require('fs');

if (fs.existsSync(frontendPath)) {
  // Servir archivos estáticos del build del frontend
  app.use(express.static(frontendPath));

  // 🔥 CLAVE: SPA Fallback
  // Cualquier ruta que NO empiece por /api y no sea un archivo real, sirve el index.html
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      const indexPath = path.join(frontendPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ success: false, message: 'Frontend dist/index.html no encontrado.' });
      }
    }
  });
} else {
  console.warn('⚠️ ADVERTENCIA: No se encontró la carpeta frontend/dist. El servidor funcionará solo como API.');
  app.get('/', (req, res) => {
    res.json({ 
      success: true, 
      message: 'PrediVersa API Online', 
      frontendStatus: 'Not served by this instance' 
    });
  });
}

// Health checks con prueba de vida a la base de datos
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

// 404 Handler - Siempre devolver JSON
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `La ruta ${req.originalUrl} no existe en este servidor.` 
  });
});

// Manejo global de errores (al final)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  console.error(`❌ [${statusCode}] Error API:`, message, err.stack);
  
  res.status(statusCode).json({ 
    success: false, 
    message,
    // Exponiendo el error para diagnóstico en App Runner
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.requestId
  });
});


module.exports = app;
