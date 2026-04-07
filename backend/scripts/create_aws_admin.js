const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  console.log('Conectando a AWS RDS...');
  try {
    const connection = await mysql.createConnection({
      host: 'prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com',
      user: 'admin',
      password: 'Prediversa2026',
      database: 'prediversa',
      connectTimeout: 20000
    });

    console.log('Conexión Exitosa. Verificando usuarios...');
    
    const [users] = await connection.execute('SELECT id, email, role FROM users');
    console.log('USUARIOS ACTUALES EN AWS:', users);

    // Crear un Master Admin si no existe
    const masterEmail = 'ceo@prediversa.com';
    const [exists] = await connection.execute('SELECT * FROM users WHERE email = ?', [masterEmail]);
    
    if (exists.length === 0) {
      console.log('Creando Administrador Oficial (ceo@prediversa.com)...');
      const hashedPassword = await bcrypt.hash('Prediversa2026*', 10);
      
      await connection.execute(`
        INSERT INTO users (
          documentId, email, password, name, role, isVerified, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'ADMIN001', 
        masterEmail, 
        hashedPassword, 
        'Administrador Supremo', 
        'Administrador', 
        true, 
        'Activo'
      ]);
      console.log('✅ CEO Creado exitosamente! Correo: ceo@prediversa.com | Contraseña: Prediversa2026*');
    } else {
      console.log('✅ El CEO ya existe. Actualizando contraseña a "Prediversa2026*" por si acaso...');
      const hashedPassword = await bcrypt.hash('Prediversa2026*', 10);
      await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, masterEmail]);
    }

    // --- CREAR ESTUDIANTE ---
    const studentEmail = 'estudiante@prediversa.com';
    const [existsStudent] = await connection.execute('SELECT * FROM users WHERE email = ?', [studentEmail]);
    if (existsStudent.length === 0) {
      console.log('Creando Estudiante de Prueba...');
      const hp = await bcrypt.hash('Estudiante2026*', 10);
      await connection.execute(`
        INSERT INTO users (documentId, email, password, name, role, isVerified, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['EST001', studentEmail, hp, 'Carlos Estudiante', 'Estudiante', true, 'Activo']);
      console.log('✅ Estudiante Creado: estudiante@prediversa.com | Estudiante2026*');
    } else {
      const hp = await bcrypt.hash('Estudiante2026*', 10);
      await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hp, studentEmail]);
    }

    // --- CREAR COLABORADOR ---
    const colabEmail = 'colaborador@prediversa.com';
    const [existsColab] = await connection.execute('SELECT * FROM users WHERE email = ?', [colabEmail]);
    if (existsColab.length === 0) {
      console.log('Creando Colaborador de Prueba...');
      const hp2 = await bcrypt.hash('Colaborador2026*', 10);
      await connection.execute(`
        INSERT INTO users (documentId, email, password, name, role, isVerified, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['COL001', colabEmail, hp2, 'Ana Colaboradora', 'Colaboradores', true, 'Activo']);
      console.log('✅ Colaborador Creado: colaborador@prediversa.com | Colaborador2026*');
    } else {
      const hp2 = await bcrypt.hash('Colaborador2026*', 10);
      await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hp2, colabEmail]);
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

createAdmin();
