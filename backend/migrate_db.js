const { pool } = require('./src/db/connection');

async function migrate() {
  try {
    console.log('🚀 Iniciando migración de base de datos...');
    const connection = await pool.getConnection();

    console.log('📦 Añadiendo columnas a la tabla users...');
    const columns = [
      'ADD COLUMN repName VARCHAR(255)',
      'ADD COLUMN repDocType VARCHAR(50)',
      'ADD COLUMN repDocId VARCHAR(50)',
      'ADD COLUMN repRelationship VARCHAR(50)',
      'ADD COLUMN repPhone VARCHAR(50)',
      'ADD COLUMN repEmail VARCHAR(255)',
      'ADD COLUMN repAddress VARCHAR(255)',
      'ADD COLUMN institutionalEmail VARCHAR(255)',
      'ADD COLUMN isVerified BOOLEAN DEFAULT FALSE'
    ];

    for (const col of columns) {
      try {
        // En MySQL ALTER TABLE ADD COLUMN IF NOT EXISTS no existe directamente en versiones antiguas,
        // pero podemos intentar ejecutarla y atrapar el error si ya existe.
        // O usar una consulta más segura.
        await connection.execute(`ALTER TABLE users ${col}`);
        console.log(`✅ Columna procesada: ${col}`);
      } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
          console.log(`ℹ️ La columna ya existe, saltando...`);
        } else {
          console.error(`❌ Error al añadir columna: ${err.message}`);
        }
      }
    }

    console.log('✨ Migración completada con éxito.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal en la migración:', error.message);
    process.exit(1);
  }
}

migrate();
