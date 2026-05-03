// AWS RDS MySQL Database Configuration
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');

// AWS RDS Global CA Bundle (Requerido para validación real de certificado)
const caCertPath = path.join(__dirname, '../../certs/global-bundle.pem');
const hasCert = fs.existsSync(caCertPath);

// Hardening: Si el certificado existe, se usa por defecto para asegurar la conexión con RDS
const sslConfig = hasCert ? {
  ca: fs.readFileSync(caCertPath),
  rejectUnauthorized: true 
} : undefined;

if (hasCert) {
  console.log('🔒 SSL Configurado: Usando certificado global-bundle.pem para RDS');
}

const pool = mysql.createPool({
  host: (process.env.DB_HOST || '').trim(),
  user: (process.env.DB_USER || '').trim(),
  password: (process.env.DB_PASSWORD || '').trim(),
  database: (process.env.DB_DATABASE || process.env.DB_NAME || 'prediversa').trim(),
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 50, // Aumentado para escalabilidad
  queueLimit: 0,
  connectTimeout: 10000, 
  acquireTimeout: 10000, 
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, 
  charset: 'utf8mb4',
  ssl: sslConfig
});

pool.on('error', (err) => {
  console.error('🚨 Error inesperado en el pool de RDS:', err.message);
});

// Helpers para queries centralizados
async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function querySingle(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function executeQuery(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const queryParams = Array.isArray(params) ? params : Object.values(params);
    const [rows] = await connection.query(sql, queryParams);
    return { recordset: rows };
  } catch (error) {
    console.error('❌ Error ejecutando query SQL:', sql, error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a AWS RDS MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a RDS:', error.message);
    return false;
  }
}

/**
 * 🏛️ INICIALIZADOR DE BASE DE DATOS (Fase 2 - Consolidado)
 * Define el esquema final de una sola vez, sin parches manuales.
 */
const initializeDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Tabla de Usuarios (Esquema Titanium Consolidado)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        documentId VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('Estudiante', 'Administrador', 'Colaboradores') NOT NULL,
        phone VARCHAR(20) DEFAULT '',
        address VARCHAR(255) DEFAULT '',
        birthDate DATE DEFAULT NULL,
        profilePicture LONGTEXT DEFAULT NULL,
        status ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
        edad VARCHAR(10) DEFAULT '',
        lugarNacimiento VARCHAR(100) DEFAULT '',
        nombrePadre VARCHAR(100) DEFAULT '',
        nombreMadre VARCHAR(100) DEFAULT '',
        grado VARCHAR(50) DEFAULT '',
        repName VARCHAR(100) DEFAULT '',
        repDocType VARCHAR(10) DEFAULT '',
        repDocId VARCHAR(20) DEFAULT '',
        repRelationship VARCHAR(50) DEFAULT '',
        repPhone VARCHAR(20) DEFAULT '',
        repEmail VARCHAR(100) DEFAULT '',
        repAddress VARCHAR(255) DEFAULT '',
        institutionalEmail VARCHAR(100) DEFAULT '',
        isVerified BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Tabla de Refresh Tokens (Seguridad JWT)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        is_revoked BOOLEAN DEFAULT FALSE,
        replaced_by_token VARCHAR(500) DEFAULT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        CONSTRAINT fk_user_refresh FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Tabla de Alertas (Gestión de Riesgo)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT DEFAULT NULL,
        studentName VARCHAR(100) NOT NULL,
        studentDocumentId VARCHAR(20) DEFAULT '',
        alertType ENUM('Informativa', 'Preventiva', 'Advertencia', 'Critica') NOT NULL,
        description TEXT NOT NULL,
        ticketNumber VARCHAR(20) DEFAULT '',
        status ENUM('Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente') DEFAULT 'Pendiente',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_alertType (alertType),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Tablas del Chatbot VERSA (Consolidadas)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_interacciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_input TEXT,
        response TEXT,
        risk VARCHAR(20),
        risk_score DECIMAL(5,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session (session_id),
        INDEX idx_risk (risk)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_reportes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id VARCHAR(100) NOT NULL DEFAULT 'anonimo',
        nombre VARCHAR(200) NOT NULL DEFAULT 'Anónimo',
        descripcion TEXT NOT NULL,
        nivel_riesgo ENUM('bajo','medio','alto') NOT NULL DEFAULT 'medio',
        ticket_number VARCHAR(30) DEFAULT NULL,
        estado ENUM('pendiente','en_proceso','resuelto','cerrado') DEFAULT 'pendiente',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_nivel_riesgo (nivel_riesgo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_reuniones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id VARCHAR(100) NOT NULL DEFAULT 'anonimo',
        nombre VARCHAR(200) NOT NULL,
        fecha_reunion DATETIME DEFAULT NULL,
        estado ENUM('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Gestión de Dependencias Institucionales
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dependencias (
        id_dependencia INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        tipo VARCHAR(100) DEFAULT 'Otro',
        id_responsable INT DEFAULT NULL,
        correo VARCHAR(100) DEFAULT '',
        telefono VARCHAR(20) DEFAULT '',
        estado ENUM('Activa', 'Inactiva') DEFAULT 'Activa',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. Configuración de Roles y Permisos (Sistema Dinámico)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id_rol INT AUTO_INCREMENT PRIMARY KEY,
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        permisos JSON DEFAULT NULL,
        estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. Logs de Auditoría (Cumplimiento de Seguridad)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        userId INT DEFAULT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 🚀 VERIFICACIÓN DE INTEGRIDAD: Asegurar que existe al menos un Administrador
    const [adminCheck] = await connection.execute("SELECT id FROM users WHERE role = 'Administrador' LIMIT 1");
    if (adminCheck.length === 0) {
      console.warn('⚠️ ADVERTENCIA: No se detectó ninguna cuenta de Administrador. Por favor, cree una cuenta inicial de forma segura.');
    }

    // 🚀 OPTIMIZACIÓN DE PERFORMANCE (Fase 2+)
    try {
      await connection.execute(`
        CREATE INDEX idx_chatbot_analytics ON chatbot_interacciones (createdAt, risk_score, risk)
      `);
      console.log('✅ Índice de analíticas creado con éxito.');
    } catch (e) { /* El índice ya existe */ }

    console.log('✅ Base de datos inicializada correctamente (Estructura Fase 2 - Hardened)');
    connection.release();
    return true;
  } catch (error) {
    if (connection) connection.release();
    console.error('❌ Error al inicializar la base de datos:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  querySingle,
  executeQuery,
  testConnection,
  initializeDatabase
};
