-- Script SQL para crear la base de datos y tabla de usuarios
-- Compatible con MySQL 8.0+ y AWS RDS

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS prediversa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prediversa;

-- ================================================================================
-- MIGRACIÓN: Agregar columnas nuevas a la tabla users (si no existen)
-- ================================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS edad VARCHAR(10) DEFAULT '' COMMENT 'Edad del estudiante' AFTER birthDate;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lugarNacimiento VARCHAR(100) DEFAULT '' COMMENT 'Lugar de nacimiento' AFTER edad;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nombrePadre VARCHAR(100) DEFAULT '' COMMENT 'Nombre del padre' AFTER lugarNacimiento;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nombreMadre VARCHAR(100) DEFAULT '' COMMENT 'Nombre de la madre' AFTER nombrePadre;
ALTER TABLE users ADD COLUMN IF NOT EXISTS grado VARCHAR(50) DEFAULT '' COMMENT 'Grado o curso' AFTER nombreMadre;

-- Verificar y agregar rol 'Psicología' si no existe (MySQL 8.0+)
-- Nota: Esto requiere recrear la tabla en versiones antiguas de MySQL

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documentId VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de documento de identidad',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo electrónico',
  password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
  name VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
  role ENUM('Estudiante', 'Administrador', 'Colaboradores', 'Psicología') NOT NULL COMMENT 'Rol del usuario',
  phone VARCHAR(20) DEFAULT '' COMMENT 'Teléfono de contacto',
  address VARCHAR(255) DEFAULT '' COMMENT 'Dirección física',
  birthDate DATE DEFAULT NULL COMMENT 'Fecha de nacimiento',
  edad VARCHAR(10) DEFAULT '' COMMENT 'Edad del estudiante',
  lugarNacimiento VARCHAR(100) DEFAULT '' COMMENT 'Lugar de nacimiento',
  nombrePadre VARCHAR(100) DEFAULT '' COMMENT 'Nombre del padre',
  nombreMadre VARCHAR(100) DEFAULT '' COMMENT 'Nombre de la madre',
  grado VARCHAR(50) DEFAULT '' COMMENT 'Grado o curso',
  status ENUM('Activo', 'Inactivo') DEFAULT 'Activo' COMMENT 'Estado del usuario',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  -- Índices para búsquedas frecuentes
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de usuarios del sistema PrediVersa';

-- Insertar usuarios iniciales (opcional - datos de prueba)
-- Contraseñas hasheadas con bcrypt (saltRounds: 10)
-- estudiante@prediversa.com / estudiante123
-- admin@prediversa.com / admin123
-- colaborador@prediversa.com / colaborador123

INSERT INTO users (documentId, email, password, name, role, phone, address, birthDate, status, createdAt) VALUES
('1234567890', 'estudiante@prediversa.com', '$2a$10$cDMAwteTRWeRrZkmAT8O.u26oWONfXr6ksL2FG7Mp0kf0Vu2mwkr2', 'Estudiante', 'Estudiante', '3001234567', 'Calle 123 #45-67, Bogotá', '2000-05-15', 'Activo', '2024-01-15 10:30:00'),
('9876543210', 'admin@prediversa.com', '$2a$10$wikPn93Empg7hEYBGuyOx.BUTtd5ZRvVWTI8/iFUIPLBL86Z5da4C', 'Administrador', 'Administrador', '3109876543', 'Carrera 45 #67-89, Medellín', '1985-12-20', 'Activo', '2024-01-10 08:00:00'),
('1122334455', 'colaborador@prediversa.com', '$2a$10$dycUv0KY8pM9EAG4rgYoD.oY5Qnl6PyCchPWflwXpuNFyxHJwLFy6', 'Colaborador', 'Colaboradores', '3201122334', 'Avenida 10 #20-30, Cali', '1990-08-08', 'Activo', '2024-01-12 14:15:00')
ON DUPLICATE KEY UPDATE 
  email = VALUES(email),
  name = VALUES(name);

-- Verificar la estructura de la tabla
DESCRIBE users;

-- Verificar usuarios insertados (sin mostrar contraseñas)
SELECT id, documentId, email, name, role, phone, address, birthDate, status, createdAt, updatedAt 
FROM users;

-- ================================================================================
-- Tabla de Alertas
-- ================================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT DEFAULT NULL COMMENT 'Usuario relacionado con la alerta (opcional)',
  studentName VARCHAR(100) NOT NULL COMMENT 'Nombre del estudiante',
  studentDocumentId VARCHAR(20) DEFAULT '' COMMENT 'Documento del estudiante',
  studentAge VARCHAR(10) DEFAULT '' COMMENT 'Edad del estudiante',
  studentGrade VARCHAR(50) DEFAULT '' COMMENT 'Grado del estudiante',
  studentUsername VARCHAR(100) DEFAULT '' COMMENT 'Usuario del estudiante',
  
  alertType ENUM('Informativa', 'Preventiva', 'Advertencia', 'Critica') NOT NULL COMMENT 'Tipo de alerta',
  description TEXT NOT NULL COMMENT 'Descripción de la alerta/orden de acción',
  
  ticketNumber VARCHAR(20) DEFAULT '' COMMENT 'Número de ticket',
  alertDate DATE DEFAULT NULL COMMENT 'Fecha de la alerta',
  alertTime TIME DEFAULT NULL COMMENT 'Hora de la alerta',
  deadline VARCHAR(50) DEFAULT '' COMMENT 'Plazo para responder',
  assignedTo VARCHAR(100) DEFAULT '' COMMENT 'Usuario asignado para atender la alerta',
  
  -- FIX AL-4: Se agrega 'Urgente' al ENUM para cubrir alertas de riesgo alto de TestVersa
  status ENUM('Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente') DEFAULT 'Pendiente' COMMENT 'Estado de la alerta',
  
  -- FIX AL-6: Campo ID para asignación precisa (evita ruptura por cambio de nombre)
  assignedToId INT DEFAULT NULL COMMENT 'ID del usuario colaborador asignado',
  
  createdBy INT DEFAULT NULL COMMENT 'ID del admin que creó la alerta',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  INDEX idx_alertType (alertType),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla de alertas del sistema PrediVersa';

-- Migración en caliente para BD existente (ejecutar si la tabla ya existe)
ALTER TABLE alerts
  MODIFY COLUMN status ENUM('Pendiente', 'En Proceso', 'Resuelta', 'Cerrada', 'Urgente') DEFAULT 'Pendiente',
  ADD COLUMN IF NOT EXISTS assignedToId INT DEFAULT NULL COMMENT 'ID del colaborador asignado';

-- Insertar alertas de ejemplo
INSERT INTO alerts (studentName, studentDocumentId, studentAge, studentGrade, alertType, description, ticketNumber, alertDate, alertTime, deadline, assignedTo, status) VALUES
('Juan Díaz', '12345678', '15', '10A', 'Informativa', 'Se le solicita de manera inmediata al funcionario tomar acciones con el fin de identificar la conducta y prevenir cualquier alteración.', 'TKT-001', '2024-01-15', '09:30:00', '24 horas', 'María Pérez', 'Pendiente'),
('Carlos Gómez', '87654321', '14', '9B', 'Preventiva', 'Se requiere revisión de comportamiento en clase de matemáticas.', 'TKT-002', '2024-01-14', '14:20:00', '48 horas', 'Ana López', 'En Proceso'),
('María López', '11223344', '16', '11C', 'Advertencia', 'Seguimiento a situación reportada anteriormente.', 'TKT-003', '2024-01-13', '10:00:00', '72 horas', 'Pedro Sánchez', 'Resuelta')
ON DUPLICATE KEY UPDATE studentName = VALUES(studentName);

-- ================================================================================
-- FIX AL-7: Tablas del Chatbot FALTANTES en schema original
-- ================================================================================

-- Tabla de reportes del chatbot (riesgo bajo/medio)
CREATE TABLE IF NOT EXISTS chatbot_reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id VARCHAR(50) DEFAULT 'anonimo' COMMENT 'ID o username del estudiante',
  nombre VARCHAR(100) DEFAULT 'Anónimo' COMMENT 'Nombre del estudiante',
  descripcion TEXT NOT NULL COMMENT 'Mensaje reportado por el estudiante',
  tipo_violencia VARCHAR(80) DEFAULT 'no_especificado' COMMENT 'Tipo de violencia identificado',
  frecuencia VARCHAR(50) DEFAULT 'no_especificado' COMMENT 'Frecuencia del evento',
  nivel_riesgo ENUM('bajo', 'medio', 'alto') DEFAULT 'medio' COMMENT 'Nivel de riesgo asignado',
  keywords JSON DEFAULT NULL COMMENT 'Palabras clave detectadas',
  resumen_patron TEXT DEFAULT NULL COMMENT 'Resumen del patrón detectado por el motor',
  ticket_number VARCHAR(30) DEFAULT '' COMMENT 'Número de ticket generado',
  sentiment_score INT DEFAULT 0 COMMENT 'Puntuación de sentimiento',
  estado ENUM('pendiente', 'en_proceso', 'completado', 'cerrado') DEFAULT 'pendiente',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estudiante (estudiante_id),
  INDEX idx_nivel (nivel_riesgo),
  INDEX idx_estado (estado),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reportes de riesgo registrados por el chatbot Versa';

-- Tabla de alertas críticas del chatbot (riesgo alto)
CREATE TABLE IF NOT EXISTS chatbot_alertas_criticas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id VARCHAR(50) DEFAULT 'anonimo',
  nombre VARCHAR(100) DEFAULT 'Anónimo',
  descripcion TEXT NOT NULL,
  tipo_violencia VARCHAR(80) DEFAULT 'no_especificado',
  frecuencia VARCHAR(50) DEFAULT 'no_especificado',
  nivel_riesgo VARCHAR(20) DEFAULT 'alto',
  prioridad VARCHAR(20) DEFAULT 'URGENTE',
  keywords_criticas JSON DEFAULT NULL COMMENT 'Keywords críticas con metadatos',
  reporte_pdf_url VARCHAR(500) DEFAULT '' COMMENT 'URL del PDF adjunto si existe',
  ticket_number VARCHAR(30) DEFAULT '',
  estado ENUM('pendiente', 'en_proceso', 'completado', 'cerrado') DEFAULT 'pendiente',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estudiante (estudiante_id),
  INDEX idx_prioridad (prioridad),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alertas críticas de riesgo alto generadas por el chatbot Versa';

-- Tabla de reuniones solicitadas desde el chatbot
CREATE TABLE IF NOT EXISTS chatbot_reuniones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id VARCHAR(50) DEFAULT 'anonimo',
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del estudiante',
  fecha_reunion VARCHAR(200) NOT NULL COMMENT 'Fecha y hora solicitada (texto libre)',
  motivo TEXT DEFAULT NULL COMMENT 'Motivo de la reunión',
  estado ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Realizada') DEFAULT 'Pendiente',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se hizo la solicitud',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado),
  INDEX idx_fecha_solicitud (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reuniones con orientador solicitadas desde el chatbot Versa';

-- Tabla de ajustes / correcciones de IA del administrador
CREATE TABLE IF NOT EXISTS chatbot_ajustes_ia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mensaje_original TEXT NOT NULL COMMENT 'Mensaje original del estudiante',
  nivel_original VARCHAR(20) COMMENT 'Nivel asignado originalmente por el motor',
  nivel_corregido VARCHAR(20) COMMENT 'Nivel corregido manualmente por el admin',
  razon_ajuste TEXT DEFAULT NULL COMMENT 'Razón de la corrección',
  admin_id INT DEFAULT NULL COMMENT 'ID del administrador que realizó la corrección',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin (admin_id),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Correcciones manuales de IA para mejora del modelo Versa';
