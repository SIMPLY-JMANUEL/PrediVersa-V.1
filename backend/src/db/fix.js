const bcrypt = require('bcryptjs');
const { pool } = require('./connection');

async function fixUsers() {
  try {
    const saltRounds = 10;
    const estPassword = await bcrypt.hash('estudiante123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const colPassword = await bcrypt.hash('colaborador123', saltRounds);

    await pool.query("DELETE FROM users WHERE email IN ('admin@prediversa.com', 'estudiante@prediversa.com', 'colaborador@prediversa.com')");

    const query = `
      INSERT INTO users (documentId, email, password, name, role, phone, address, birthDate, status, createdAt) VALUES
      ('DOC-EST-1', 'estudiante@prediversa.com', ?, 'Estudiante Demo', 'Estudiante', '3000000000', 'Dirección Estudiante', '2005-01-01', 'Activo', NOW()),
      ('DOC-ADM-1', 'admin@prediversa.com', ?, 'Administrador Demo', 'Administrador', '3100000000', 'Dirección Admin', '1980-01-01', 'Activo', NOW()),
      ('DOC-COL-1', 'colaborador@prediversa.com', ?, 'Colaborador Demo', 'Colaboradores', '3200000000', 'Dirección Colaborador', '1990-01-01', 'Activo', NOW())
    `;

    await pool.query(query, [estPassword, adminPassword, colPassword]);
    
    console.log("✅ Usuarios creados/restaurados exitosamente en AWS RDS:");
    console.log("- admin@prediversa.com / admin123");
    console.log("- estudiante@prediversa.com / estudiante123");
    console.log("- colaborador@prediversa.com / colaborador123");

  } catch (error) {
    console.error("❌ Error arreglando usuarios:", error);
  } finally {
    process.exit(0);
  }
}

fixUsers();
