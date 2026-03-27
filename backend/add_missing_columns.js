require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateAllFields() {
  try {
    console.log('Connecting to AWS RDS...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Validating users table columns...');
    
    // Lista de columnas a agregar
    const columns = [
      "edad VARCHAR(10) DEFAULT ''",
      "lugarNacimiento VARCHAR(100) DEFAULT ''",
      "nombrePadre VARCHAR(100) DEFAULT ''",
      "nombreMadre VARCHAR(100) DEFAULT ''",
      "grado VARCHAR(50) DEFAULT ''",
      "repName VARCHAR(100) DEFAULT ''",
      "repDocType VARCHAR(10) DEFAULT ''",
      "repDocId VARCHAR(20) DEFAULT ''",
      "repRelationship VARCHAR(50) DEFAULT ''",
      "repPhone VARCHAR(20) DEFAULT ''",
      "repEmail VARCHAR(100) DEFAULT ''",
      "repAddress VARCHAR(255) DEFAULT ''",
      "institutionalEmail VARCHAR(100) DEFAULT ''",
      "isVerified BOOLEAN DEFAULT false"
    ];

    for (const colDef of columns) {
      const colName = colDef.split(' ')[0];
      try {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${colDef};`);
        console.log(`✅ Column ${colName} added successfully.`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`🔄 Column ${colName} already exists.`);
        } else {
          console.error(`❌ Failed to add ${colName}:`, err.message);
        }
      }
    }

    await connection.end();
    console.log('Migration completed.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

migrateAllFields();
