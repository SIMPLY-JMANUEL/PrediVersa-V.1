/**
 * MIGRACIÓN: Tablas chatbot + Fix ENUM alerts
 * Ejecutar: node migrate_chatbot_tables.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function migrate() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    multipleStatements: true,
  });

  const conn = await pool.getConnection();
  console.log('✅ Conectado a la BD. Ejecutando migración...\n');

  const queries = [
    // FIX AL-4: Agregar 'Urgente' al ENUM de status
    `ALTER TABLE alerts MODIFY COLUMN status ENUM('Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente') DEFAULT 'Pendiente'`,
    // FIX AL-6: Agregar columna assignedToId
    `ALTER TABLE alerts ADD COLUMN IF NOT EXISTS assignedToId INT DEFAULT NULL COMMENT 'ID del colaborador asignado'`,

    // FIX AL-7: Tabla chatbot_reportes
    `CREATE TABLE IF NOT EXISTS chatbot_reportes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      estudiante_id VARCHAR(50) DEFAULT 'anonimo',
      nombre VARCHAR(100) DEFAULT 'Anónimo',
      descripcion TEXT NOT NULL,
      tipo_violencia VARCHAR(80) DEFAULT 'no_especificado',
      frecuencia VARCHAR(50) DEFAULT 'no_especificado',
      nivel_riesgo ENUM('bajo', 'medio', 'alto') DEFAULT 'medio',
      keywords JSON DEFAULT NULL,
      resumen_patron TEXT DEFAULT NULL,
      ticket_number VARCHAR(30) DEFAULT '',
      sentiment_score INT DEFAULT 0,
      estado ENUM('pendiente', 'en_proceso', 'completado', 'cerrado') DEFAULT 'pendiente',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_estudiante (estudiante_id),
      INDEX idx_nivel (nivel_riesgo),
      INDEX idx_estado (estado)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // FIX AL-7: Tabla chatbot_alertas_criticas
    `CREATE TABLE IF NOT EXISTS chatbot_alertas_criticas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      estudiante_id VARCHAR(50) DEFAULT 'anonimo',
      nombre VARCHAR(100) DEFAULT 'Anónimo',
      descripcion TEXT NOT NULL,
      tipo_violencia VARCHAR(80) DEFAULT 'no_especificado',
      frecuencia VARCHAR(50) DEFAULT 'no_especificado',
      nivel_riesgo VARCHAR(20) DEFAULT 'alto',
      prioridad VARCHAR(20) DEFAULT 'URGENTE',
      keywords_criticas JSON DEFAULT NULL,
      reporte_pdf_url VARCHAR(500) DEFAULT '',
      ticket_number VARCHAR(30) DEFAULT '',
      estado ENUM('pendiente', 'en_proceso', 'completado', 'cerrado') DEFAULT 'pendiente',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_estudiante (estudiante_id),
      INDEX idx_prioridad (prioridad)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // FIX AL-7: Tabla chatbot_reuniones
    `CREATE TABLE IF NOT EXISTS chatbot_reuniones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      estudiante_id VARCHAR(50) DEFAULT 'anonimo',
      nombre VARCHAR(100) NOT NULL,
      fecha_reunion VARCHAR(200) NOT NULL,
      motivo TEXT DEFAULT NULL,
      estado ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Realizada') DEFAULT 'Pendiente',
      fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_estado (estado)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // FIX AL-7: Tabla chatbot_ajustes_ia
    `CREATE TABLE IF NOT EXISTS chatbot_ajustes_ia (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mensaje_original TEXT NOT NULL,
      nivel_original VARCHAR(20),
      nivel_corregido VARCHAR(20),
      razon_ajuste TEXT DEFAULT NULL,
      admin_id INT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin (admin_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  for (const [i, sql] of queries.entries()) {
    try {
      await conn.execute(sql);
      console.log(`✅ Query ${i + 1}/${queries.length} ejecutada correctamente`);
    } catch (err) {
      if (err.message.includes('Duplicate column') || err.message.includes('already exists')) {
        console.log(`⚠️  Query ${i + 1} saltada (ya existía): ${err.message.slice(0, 80)}`);
      } else {
        console.error(`❌ Error en Query ${i + 1}: ${err.message}`);
      }
    }
  }

  conn.release();
  await pool.end();
  console.log('\n🎉 Migración completada exitosamente.');
}

migrate().catch(err => {
  console.error('❌ Error fatal en migración:', err.message);
  process.exit(1);
});
