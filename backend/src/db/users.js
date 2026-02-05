const { pool } = require('./connection');

// Funciones CRUD para usuarios usando MySQL

/**
 * Obtener todos los usuarios (sin contraseñas)
 */
const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, documentId, email, name, role, phone, address, birthDate, status, createdAt, updatedAt FROM users ORDER BY id ASC'
    );
    return rows;
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    throw error;
  }
};

/**
 * Obtener un usuario por ID (con contraseña para autenticación)
 */
const getUserById = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error al obtener usuario por ID:', error.message);
    throw error;
  }
};

/**
 * Obtener un usuario por email (con contraseña para autenticación)
 */
const getUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error al obtener usuario por email:', error.message);
    throw error;
  }
};

/**
 * Obtener un usuario por documentId
 */
const getUserByDocumentId = async (documentId) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, documentId, email, name, role, phone, address, birthDate, status, createdAt, updatedAt FROM users WHERE documentId = ?',
      [documentId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error al obtener usuario por documento:', error.message);
    throw error;
  }
};

/**
 * Crear un nuevo usuario
 */
const createUser = async (userData) => {
  try {
    const { documentId, email, password, name, role, phone, address, birthDate } = userData;
    
    const [result] = await pool.execute(
      `INSERT INTO users (documentId, email, password, name, role, phone, address, birthDate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Activo')`,
      [documentId, email, password, name, role, phone || '', address || '', birthDate || null]
    );
    
    // Retornar el usuario creado (sin contraseña)
    return await getUserById(result.insertId);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
    throw error;
  }
};

/**
 * Actualizar un usuario
 */
const updateUser = async (id, userData) => {
  try {
    const { documentId, email, name, role, phone, address, birthDate, status, password } = userData;
    
    // Construir la consulta dinámicamente según los campos proporcionados
    const updates = [];
    const values = [];
    
    if (documentId !== undefined) {
      updates.push('documentId = ?');
      values.push(documentId);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (birthDate !== undefined) {
      updates.push('birthDate = ?');
      values.push(birthDate || null);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (password !== undefined) {
      updates.push('password = ?');
      values.push(password);
    }
    
    if (updates.length === 0) {
      return await getUserById(id);
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Retornar el usuario actualizado (sin contraseña)
    const [rows] = await pool.execute(
      'SELECT id, documentId, email, name, role, phone, address, birthDate, status, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error.message);
    throw error;
  }
};

/**
 * Eliminar un usuario
 */
const deleteUser = async (id) => {
  try {
    // Primero obtener el usuario para retornarlo después de eliminar
    const user = await getUserById(id);
    
    if (!user) {
      return null;
    }
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    // Retornar usuario sin contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error.message);
    throw error;
  }
};

/**
 * Obtener estadísticas de usuarios
 */
const getUserStats = async () => {
  try {
    // Total de usuarios
    const [totalResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalResult[0].count;
    
    // Usuarios activos
    const [activeResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE status = 'Activo'"
    );
    const activeUsers = activeResult[0].count;
    
    // Usuarios inactivos
    const [inactiveResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE status = 'Inactivo'"
    );
    const inactiveUsers = inactiveResult[0].count;
    
    // Usuarios por rol
    const [roleResults] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    const usersByRole = roleResults.reduce((acc, row) => {
      acc[row.role] = row.count;
      return acc;
    }, {});
    
    // Usuarios por estado
    const [statusResults] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM users GROUP BY status'
    );
    const usersByStatus = statusResults.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});
    
    // Usuarios recientes (últimos 5)
    const [recentResults] = await pool.execute(
      `SELECT id, documentId, email, name, role, phone, address, birthDate, status, createdAt, updatedAt 
       FROM users ORDER BY createdAt DESC LIMIT 5`
    );
    const recentUsers = recentResults;
    
    // Usuarios por mes de registro
    const [monthResults] = await pool.execute(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count 
       FROM users GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month`
    );
    const usersByMonth = monthResults.reduce((acc, row) => {
      acc[row.month] = row.count;
      return acc;
    }, {});
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      usersByStatus,
      recentUsers,
      usersByMonth
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message);
    throw error;
  }
};

/**
 * Verificar si existe un email (excluyendo un ID específico opcionalmente)
 */
const emailExists = async (email, excludeId = null) => {
  try {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  } catch (error) {
    console.error('❌ Error al verificar email:', error.message);
    throw error;
  }
};

/**
 * Verificar si existe un documentId (excluyendo un ID específico opcionalmente)
 */
const documentIdExists = async (documentId, excludeId = null) => {
  try {
    let query = 'SELECT id FROM users WHERE documentId = ?';
    const params = [documentId];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  } catch (error) {
    console.error('❌ Error al verificar documento:', error.message);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByDocumentId,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  emailExists,
  documentIdExists
};
