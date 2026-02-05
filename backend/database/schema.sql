-- Script SQL para crear la base de datos y tabla de usuarios
-- Compatible con MySQL 8.0+ y AWS RDS

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS prediversa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prediversa;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documentId VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de documento de identidad',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo electrónico',
  password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
  name VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
  role ENUM('Estudiante', 'Administrador', 'Colaboradores') NOT NULL COMMENT 'Rol del usuario',
  phone VARCHAR(20) DEFAULT '' COMMENT 'Teléfono de contacto',
  address VARCHAR(255) DEFAULT '' COMMENT 'Dirección física',
  birthDate DATE DEFAULT NULL COMMENT 'Fecha de nacimiento',
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
