require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    console.log('Adding profilePicture column to users table...');
    await connection.execute('ALTER TABLE users ADD COLUMN profilePicture LONGTEXT DEFAULT NULL;');
    console.log('✅ Column profilePicture added successfully.');

    await connection.end();
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Column profilePicture already exists.');
    } else {
      console.error('❌ Migration failed:', error);
    }
  }
}

migrate();
