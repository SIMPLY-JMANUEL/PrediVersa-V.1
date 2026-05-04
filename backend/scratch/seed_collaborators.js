const { pool } = require('../src/db/connection');
const bcrypt = require('bcryptjs');

async function seed() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('📡 Conectado a RDS...');

    // 1. Actualizar ENUM de roles
    await conn.query(`
      ALTER TABLE users MODIFY COLUMN role 
      ENUM('Estudiante','Administrador','Colaboradores','Psicologia','Psicologo','Coordinador','Docente') 
      NOT NULL DEFAULT 'Estudiante'
    `);
    console.log('✅ Roles actualizados en ENUM.');

    const passwordHash = await bcrypt.hash('Prediversa2026*', 10);
    
    const users = [
      { doc: 'PS001', email: 'psicologo@prediversa.com', name: 'Dr. Roberto Psicólogo', role: 'Psicologo' },
      { doc: 'CO001', email: 'coordinador@prediversa.com', name: 'Mg. Laura Coordinadora', role: 'Coordinador' },
      { doc: 'DO001', email: 'docente@prediversa.com', name: 'Prof. Juan Docente', role: 'Docente' }
    ];

    for (const u of users) {
      await conn.execute(
        `INSERT INTO users (documentId, email, password, name, role, status, isVerified) 
         VALUES (?, ?, ?, ?, ?, 'Activo', 1) 
         ON DUPLICATE KEY UPDATE role = VALUES(role), name = VALUES(name)`,
        [u.doc, u.email, passwordHash, u.name, u.role]
      );
      console.log(`👤 Usuario creado/actualizado: ${u.name} (${u.role})`);
    }

    console.log('🎉 Seed completo. Ya puedes realizar la remisión.');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

seed();
