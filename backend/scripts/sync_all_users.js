const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function syncUsers() {
  const config = {
    host: 'prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Prediversa2026',
    database: 'prediversa',
    ssl: { rejectUnauthorized: false }
  };

  const connection = await mysql.createConnection(config);
  const password = 'Predi2026*';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const users = [
    { email: 'estudiante@prediversa.com', role: 'Estudiante', name: 'Estudiante Maestro' },
    { email: 'colaborador@prediversa.com', role: 'Colaboradores', name: 'Colaborador Maestro' }
  ];

  console.log('🚀 Iniciando sincronización masiva...');

  for (const u of users) {
    const [res] = await connection.execute(
      'UPDATE users SET password = ?, status = "Activo" WHERE email = ?', 
      [hashedPassword, u.email]
    );

    if (res.affectedRows === 0) {
      console.log(`➕ Creando usuario: ${u.email}`);
      await connection.execute(
        'INSERT INTO users (documentId, email, password, name, role, status, isVerified) VALUES (?, ?, ?, ?, ?, "Activo", true)',
        [`DOC-${Math.floor(Math.random() * 100000)}`, u.email, hashedPassword, u.name, u.role]
      );
    } else {
      console.log(`✅ Contraseña actualizada para: ${u.email}`);
    }
  }

  await connection.end();
  console.log('✨ Sincronización completada exitosamente.');
}

syncUsers().catch(console.error);
