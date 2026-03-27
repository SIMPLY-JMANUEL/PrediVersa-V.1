require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateConfig() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Conectando...');

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS dependencias (
      id_dependencia INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      tipo ENUM('Facultad','Coordinación','Bienestar','Dirección','Psicología','Otro') DEFAULT 'Otro',
      id_responsable INT DEFAULT NULL,
      correo VARCHAR(100) DEFAULT '',
      telefono VARCHAR(20) DEFAULT '',
      estado ENUM('Activa','Inactiva') DEFAULT 'Activa',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('✅ Tabla dependencias OK');

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id_rol INT AUTO_INCREMENT PRIMARY KEY,
      nombre_rol VARCHAR(80) NOT NULL UNIQUE,
      descripcion TEXT DEFAULT '',
      permisos JSON DEFAULT NULL,
      estado ENUM('Activo','Inactivo') DEFAULT 'Activo',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('✅ Tabla roles OK');

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT DEFAULT NULL,
      usuario_nombre VARCHAR(100) DEFAULT 'Sistema',
      accion VARCHAR(200) NOT NULL,
      modulo VARCHAR(80) NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip VARCHAR(45) DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('✅ Tabla auditoria OK');

  await conn.end();
  console.log('Migración completada.');
}

migrateConfig().catch(console.error);
