const { pool } = require('./src/db/connection');

async function wipeDatabase() {
  console.log('🧹 Iniciando limpieza profunda de la base de datos...');
  
  const tables = [
    'case_actions',
    'chatbot_reuniones',
    'chatbot_alertas_criticas',
    'chatbot_reportes',
    'chatbot_ajustes_ia',
    'alerts',
    'users'
  ];

  for (const table of tables) {
    try {
      console.log(`- Vaciando tabla: ${table}...`);
      await pool.execute(`DELETE FROM ${table}`);
    } catch (error) {
      console.warn(`⚠️ No se pudo vaciar ${table} (puede que no exista): ${error.message}`);
    }
  }

  console.log('✨ Base de datos completamente limpia.');
  process.exit(0);
}

wipeDatabase();
