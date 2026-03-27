const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const chatbotRoutes = require('./routes/chatbot');
const configRoutes = require('./routes/config');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/config', configRoutes);


// Health checks
app.get('/', (req, res) => res.status(200).send('API PrediVersa Online'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend funcionando' });
});

// Manejo global de errores (al final)
app.use((err, req, res, next) => {
  console.error('❌ Error API:', err.message, err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    // Exponiendo el error temporalmente para diagnóstico en App Runner
    error: err.message || 'Error desconocido'
  });
});


module.exports = app;
