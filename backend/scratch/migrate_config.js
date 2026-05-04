const { pool } = require('../src/db/connection');

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log('🚀 Creando tabla system_config...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        config_key VARCHAR(50) PRIMARY KEY,
        config_value JSON NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const aiSettings = {
      temperature: 0.3,
      max_tokens: 1000,
      risk_sensitivity: 'high',
      model_id: 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
    };

    await conn.query(
      'INSERT IGNORE INTO system_config (config_key, config_value) VALUES (?, ?)',
      ['ai_settings', JSON.stringify(aiSettings)]
    );

    console.log('✅ Tabla system_config inicializada con valores por defecto.');
  } catch (e) {
    console.error('❌ Error en migración:', e.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();
