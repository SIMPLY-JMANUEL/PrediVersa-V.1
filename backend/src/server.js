const app = require('./app');
require('dotenv').config();
const { testConnection, initializeDatabase } = require('./db/connection');

const PORT = process.env.PORT || 5000;

// Iniciar servidor inmediatamente bind-eado a 0.0.0.0 para compatibilidad con el Health Check TCP de AWS App Runner
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT} (0.0.0.0)`);
  console.log(`📡 API disponible en: http://0.0.0.0:${PORT}/api`);

  try {
    // Inicializar base de datos en segundo plano
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica RDS.');
    } else {
      await initializeDatabase();
      console.log('✅ Base de datos lista.');
    }
  } catch (error) {
    console.error('❌ Error durante la inicialización diferida:', error);
  }
});
