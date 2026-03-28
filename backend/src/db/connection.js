// AWS RDS MySQL Database Configuration
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- BLINDAJE DE SEGURIDAD: VALIDACIÓN DE VARIABLES ---
const REQUIRED_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET'];
const missingVars = REQUIRED_VARS.filter(v => !process.env[v] || process.env[v].trim() === '');

if (missingVars.length > 0) {
  console.error('\n' + '!'.repeat(60));
  console.error('❌ ERROR FATAL DE CONFIGURACIÓN ❌');
  console.error(`Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`);
  console.error('Por favor, configúrelas en la consola de AWS App Runner.');
  console.error('!'.repeat(60) + '\n');
  // En producción, podrías usar process.exit(1) para forzar el reinicio ordenado
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 15, // Aumentado ligeramente para mayor concurrencia
  queueLimit: 0,
  connectTimeout: 20000, // 20s para asegurar conexión inicial en App Runner
  acquireTimeout: 20000, // 20s para obtener conexión del pool
  timeout: 30000,        // 30s de timeout de query por defecto
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // Empezar pings de red a los 10s
  charset: 'utf8mb4',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Función auxiliar para queries
async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Función para obtener una sola fila
async function querySingle(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

// Test de conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a AWS RDS MySQL');
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`🗄️  Base de datos: ${process.env.DB_DATABASE}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a RDS:', error.message);
    return false;
  }
}

// Función para ejecutar queries (similar a SQL Server pero para MySQL)
async function executeQuery(sql, params) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(sql, Object.values(params || {}));
    connection.release();
    return { recordset: rows };
  } catch (error) {
    console.error('Error executing query:', sql, error);
    throw error;
  }
}

// Función para inicializar la base de datos (crear tabla si no existe)
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Crear tabla de usuarios si no existe con TODAS las columnas necesarias
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
        
        -- Columnas adicionales de la migración v1.1
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
        INDEX idx_status (status),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 🔥 PARCHE DE ACTUALIZACIÓN: Agregar columnas si la tabla ya existía
    const columnsToPatch = [
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

    for (const colDef of columnsToPatch) {
      const colName = colDef.split(' ')[0];
      try {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${colDef};`);
        console.log(`✅ Columna de parche añadida: ${colName}`);
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') {
          console.warn(`⚠️ Aviso al añadir columna ${colName}:`, err.message);
        }
      }
    }

    console.log('✅ Tabla de usuarios verificada/actualizada correctamente');

    // Crear tabla de alertas si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT DEFAULT NULL,
        studentName VARCHAR(100) NOT NULL,
        studentDocumentId VARCHAR(20) DEFAULT '',
        studentAge VARCHAR(10) DEFAULT '',
        studentGrade VARCHAR(50) DEFAULT '',
        studentUsername VARCHAR(100) DEFAULT '',
        alertType ENUM('Informativa', 'Preventiva', 'Advertencia', 'Critica') NOT NULL,
        description TEXT NOT NULL,
        ticketNumber VARCHAR(20) DEFAULT '',
        alertDate DATE DEFAULT NULL,
        alertTime TIME DEFAULT NULL,
        deadline VARCHAR(50) DEFAULT '',
        assignedTo VARCHAR(100) DEFAULT '',
        status ENUM('Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente') DEFAULT 'Pendiente',
        createdBy INT DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_alertType (alertType),
        INDEX idx_status (status),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabla de alertas verificada/creada correctamente');

    // ─────────────────────────────────────────────────────
    // TABLAS DEL CHATBOT PREDICTIVO
    // ─────────────────────────────────────────────────────

    // Tabla para reportes del chatbot (riesgo bajo y medio)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_reportes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id VARCHAR(100) NOT NULL DEFAULT 'anonimo',
        nombre VARCHAR(200) NOT NULL DEFAULT 'Anónimo',
        descripcion TEXT NOT NULL,
        tipo_violencia VARCHAR(100) DEFAULT 'no_especificado',
        frecuencia VARCHAR(50) DEFAULT 'no_especificado',
        nivel_riesgo ENUM('bajo','medio','alto') NOT NULL DEFAULT 'medio',
        keywords JSON DEFAULT NULL,
        sentiment_score DECIMAL(5,2) DEFAULT 0,
        resumen_patron TEXT DEFAULT NULL,
        ticket_number VARCHAR(30) DEFAULT NULL,
        estado ENUM('pendiente','en_proceso','resuelto','cerrado') DEFAULT 'pendiente',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_estudiante (estudiante_id),
        INDEX idx_nivel_riesgo (nivel_riesgo),
        INDEX idx_estado (estado),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla chatbot_reportes verificada/creada');

    // Tabla para alertas críticas del chatbot (riesgo alto)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_alertas_criticas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id VARCHAR(100) NOT NULL DEFAULT 'anonimo',
        nombre VARCHAR(200) NOT NULL DEFAULT 'Anónimo',
        descripcion TEXT NOT NULL,
        tipo_violencia VARCHAR(100) DEFAULT 'no_especificado',
        frecuencia VARCHAR(50) DEFAULT 'no_especificado',
        nivel_riesgo VARCHAR(10) DEFAULT 'alto',
        prioridad VARCHAR(20) DEFAULT 'URGENTE',
        keywords_criticas JSON DEFAULT NULL,
        reporte_pdf_url VARCHAR(500) DEFAULT NULL,
        ticket_number VARCHAR(30) DEFAULT NULL,
        estado ENUM('pendiente','en_proceso','resuelto','cerrado') DEFAULT 'pendiente',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_estudiante (estudiante_id),
        INDEX idx_estado (estado),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla chatbot_alertas_criticas verificada/creada');

    // Tabla para reuniones agendadas desde el chatbot
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_reuniones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id VARCHAR(100) NOT NULL DEFAULT 'anonimo',
        nombre VARCHAR(200) NOT NULL,
        fecha_reunion DATETIME DEFAULT NULL,
        motivo TEXT DEFAULT NULL,
        estado ENUM('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
        fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_estudiante (estudiante_id),
        INDEX idx_estado (estado),
        INDEX idx_fecha_reunion (fecha_reunion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla chatbot_reuniones verificada/creada');

    // Tabla para actuaciones y remisiones (Seguimiento de casos extendido)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS case_actions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alertId INT NOT NULL,
        collaboratorId INT NOT NULL,
        category ENUM('Remision', 'Actuacion', 'Soporte', 'Normatividad') NOT NULL,
        actionType VARCHAR(100) NOT NULL,
        responsibleName VARCHAR(100),
        description TEXT,
        area VARCHAR(100),
        urgency VARCHAR(20),
        result VARCHAR(255),
        fileName VARCHAR(255),
        fileUrl VARCHAR(500),
        normType VARCHAR(100),
        normArticle VARCHAR(100),
        actionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alert (alertId),
        INDEX idx_collaborator (collaboratorId),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    // Tabla para ajustes manuales de la IA (Feedback/ML)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_ajustes_ia (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mensaje_original TEXT NOT NULL,
        nivel_original ENUM('bajo','medio','alto') NOT NULL,
        nivel_corregido ENUM('bajo','medio','alto') NOT NULL,
        razon_ajuste TEXT,
        admin_id INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla chatbot_ajustes_ia verificada/creada');

    // 🔥 TABLA DE INTERACCIONES (CON HISTORY Y SCORING REAL-TIME)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chatbot_interacciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_input TEXT,
        response TEXT,
        risk VARCHAR(10),
        risk_score INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session (session_id),
        INDEX idx_risk (risk),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla chatbot_interacciones (Scoring Engine) lista.');

    console.log('✅ Tabla case_actions verificada/creada');

    // 🚀 SEMILLA AUTOMÁTICA: Asegurar que existe al menos un Administrador
    const [adminCheck] = await connection.execute("SELECT id FROM users WHERE role = 'Administrador' LIMIT 1");
    if (adminCheck.length === 0) {
      console.log('🛠️ Base de datos vacía o sin Admin. Creando usuario inicial...');
      const adminHashed = await bcrypt.hash('admin123', 10);
      await connection.execute(
        `INSERT INTO users (documentId, email, password, name, role, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['ADMIN-001', 'admin@prediversa.com', adminHashed, 'Administrador Inicial', 'Administrador', 'Activo']
      );
      console.log('✅ Admin creado: admin@prediversa.com / admin123');
    }

    console.log('✅ Estructura de base de datos lista. (Iniciado en Modo Seguro)');

    connection.release();
    return true;
  } catch (error) {
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
