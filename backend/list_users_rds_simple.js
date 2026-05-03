const mysql = require('mysql2/promise');

async function listUsers() {
  const config = {
    host: 'prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Prediversa2026',
    database: 'prediversa',
    port: 3306,
    ssl: { rejectUnauthorized: false }
  };

  try {
    console.log("🔍 Consultando usuarios en la base de datos de AWS RDS...");
    const connection = await mysql.createConnection(config);
    const [users] = await connection.execute('SELECT id, email, role, name FROM users');
    
    if (users.length === 0) {
      console.log("⚠️ No hay usuarios registrados en la base de datos.");
    } else {
      console.log(`✅ Se encontraron ${users.length} usuarios:`);
      users.forEach(u => {
        console.log(`- [${u.role}] ${u.name} (${u.email})`);
      });
    }
    await connection.end();
  } catch (e) {
    console.error('❌ Error al conectar o consultar la BD:', e.message);
  }
}

listUsers();
