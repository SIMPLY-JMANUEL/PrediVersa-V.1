// AWS RDS MySQL Database Configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
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

    // Crear tabla de usuarios si no existe
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
        status ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_status (status),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabla de usuarios verificada/creada correctamente');

    // Verificar si hay usuarios, si no, insertar datos de prueba
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      
      // Generar hashes para las contraseñas
      const estudianteHash = await bcrypt.hash('Estudiante123!', saltRounds);
      const adminHash = await bcrypt.hash('Admin123!', saltRounds);
      const colaboradorHash = await bcrypt.hash('Colaborador123!', saltRounds);
      
      await connection.execute(`
        INSERT INTO users (documentId, email, password, name, role, phone, address, birthDate, status, createdAt) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        '1234567890', 'estudiante@prediversa.com', estudianteHash, 'Estudiante', 'Estudiante', '3001234567', 'Calle 123 #45-67, Bogotá', '2000-05-15', 'Activo', '2024-01-15 10:30:00',
        '9876543210', 'admin@prediversa.com', adminHash, 'Administrador', 'Administrador', '3109876543', 'Carrera 45 #67-89, Medellín', '1985-12-20', 'Activo', '2024-01-10 08:00:00',
        '1122334455', 'colaborador@prediversa.com', colaboradorHash, 'Colaborador', 'Colaboradores', '3201122334', 'Avenida 10 #20-30, Cali', '1990-08-08', 'Activo', '2024-01-12 14:15:00'
      ]);
      console.log('✅ Usuarios de prueba insertados correctamente');
    }

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
