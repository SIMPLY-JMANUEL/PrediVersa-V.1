const app = require('./app');
require('dotenv').config();
const { testConnection, initializeDatabase } = require('./db/connection');

const PORT = process.env.PORT || 5000;

// Inicializar servidor con conexión a base de datos
const startServer = async () => {
  try {
    // Verificar conexión a MySQL
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica tus credenciales en el archivo .env');
      console.log('💡 El servidor continuará ejecutándose pero las operaciones con la base de datos fallarán.');
    } else {
      // Inicializar base de datos (crear tablas si no existen)
      await initializeDatabase();
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
