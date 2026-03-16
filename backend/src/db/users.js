const { pool } = require('./connection');

// Funciones CRUD para usuarios usando MySQL

/**
 * Obtener todos los usuarios (sin contraseñas)
 */
const getAllUsers = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, documentId, email, name, role, phone, address, birthDate, edad, lugarNacimiento, nombrePadre, nombreMadre, grado, status, createdAt, updatedAt FROM users ORDER BY id ASC'
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
    const { documentId, email, password, name, role, phone, address, birthDate, edad, lugarNacimiento, nombrePadre, nombreMadre, grado } = userData;
    
    const [result] = await pool.execute(
      `INSERT INTO users (documentId, email, password, name, role, phone, address, birthDate, edad, lugarNacimiento, nombrePadre, nombreMadre, grado, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo')`,
      [documentId, email, password, name, role, phone || '', address || '', birthDate || null, edad || '', lugarNacimiento || '', nombrePadre || '', nombreMadre || '', grado || '']
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
    const { documentId, email, name, role, phone, address, birthDate, status, password, edad, lugarNacimiento, nombrePadre, nombreMadre, grado } = userData;
    
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
    if (edad !== undefined) {
      updates.push('edad = ?');
      values.push(edad);
    }
    if (lugarNacimiento !== undefined) {
      updates.push('lugarNacimiento = ?');
      values.push(lugarNacimiento);
    }
    if (nombrePadre !== undefined) {
      updates.push('nombrePadre = ?');
      values.push(nombrePadre);
    }
    if (nombreMadre !== undefined) {
      updates.push('nombreMadre = ?');
      values.push(nombreMadre);
    }
    if (grado !== undefined) {
      updates.push('grado = ?');
      values.push(grado);
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
      'SELECT id, documentId, email, name, role, phone, address, birthDate, edad, lugarNacimiento, nombrePadre, nombreMadre, grado, status, createdAt, updatedAt FROM users WHERE id = ?',
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

// ==================== FUNCIONES DE ALERTAS ====================

/**
 * Obtener todas las alertas
 */
const getAllAlerts = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as creatorName 
       FROM alerts a 
       LEFT JOIN users u ON a.createdBy = u.id 
       ORDER BY a.createdAt DESC`
    );
    return rows;
  } catch (error) {
    console.error('❌ Error al obtener alertas:', error.message);
    throw error;
  }
};

/**
 * Obtener una alerta por ID
 */
const getAlertById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as creatorName 
       FROM alerts a 
       LEFT JOIN users u ON a.createdBy = u.id 
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error al obtener alerta por ID:', error.message);
    throw error;
  }
};

/**
 * Crear una nueva alerta
 */
const createAlert = async (alertData) => {
  try {
    const { 
      userId, studentName, studentDocumentId, studentAge, studentGrade, 
      studentUsername, alertType, description, ticketNumber, alertDate, 
      alertTime, deadline, assignedTo, status, createdBy 
    } = alertData;
    
    const [result] = await pool.execute(
      `INSERT INTO alerts (userId, studentName, studentDocumentId, studentAge, studentGrade, 
        studentUsername, alertType, description, ticketNumber, alertDate, alertTime, 
        deadline, assignedTo, status, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, studentName || '', studentDocumentId || '', studentAge || '', 
       studentGrade || '', studentUsername || '', alertType || 'Informativa', description || '', 
       ticketNumber || '', alertDate || '', alertTime || '', deadline || '', 
       assignedTo || '', status || 'Pendiente', createdBy || null]
    );
    
    return await getAlertById(result.insertId);
  } catch (error) {
    console.error('❌ Error al crear alerta:', error.message);
    throw error;
  }
};

/**
 * Actualizar una alerta
 */
const updateAlert = async (id, alertData) => {
  try {
    const { 
      userId, studentName, studentDocumentId, studentAge, studentGrade, 
      studentUsername, alertType, description, ticketNumber, alertDate, 
      alertTime, deadline, assignedTo, status 
    } = alertData;
    
    // Construir la consulta dinámicamente
    const updates = [];
    const values = [];
    
    if (userId !== undefined) { updates.push('userId = ?'); values.push(userId); }
    if (studentName !== undefined) { updates.push('studentName = ?'); values.push(studentName); }
    if (studentDocumentId !== undefined) { updates.push('studentDocumentId = ?'); values.push(studentDocumentId); }
    if (studentAge !== undefined) { updates.push('studentAge = ?'); values.push(studentAge); }
    if (studentGrade !== undefined) { updates.push('studentGrade = ?'); values.push(studentGrade); }
    if (studentUsername !== undefined) { updates.push('studentUsername = ?'); values.push(studentUsername); }
    if (alertType !== undefined) { updates.push('alertType = ?'); values.push(alertType); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (ticketNumber !== undefined) { updates.push('ticketNumber = ?'); values.push(ticketNumber); }
    if (alertDate !== undefined) { updates.push('alertDate = ?'); values.push(alertDate); }
    if (alertTime !== undefined) { updates.push('alertTime = ?'); values.push(alertTime); }
    if (deadline !== undefined) { updates.push('deadline = ?'); values.push(deadline); }
    if (assignedTo !== undefined) { updates.push('assignedTo = ?'); values.push(assignedTo); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    
    if (updates.length === 0) {
      return await getAlertById(id);
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE alerts SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      values
    );
    
    return await getAlertById(id);
  } catch (error) {
    console.error('❌ Error al actualizar alerta:', error.message);
    throw error;
  }
};

/**
 * Eliminar una alerta
 */
const deleteAlert = async (id) => {
  try {
    const alert = await getAlertById(id);
    
    if (!alert) {
      return null;
    }
    
    await pool.execute('DELETE FROM alerts WHERE id = ?', [id]);
    
    return alert;
  } catch (error) {
    console.error('❌ Error al eliminar alerta:', error.message);
    throw error;
  }
};

/**
 * Obtener estadísticas de alertas
 */
const getAlertStats = async () => {
  try {
    // Total de alertas
    const [totalResult] = await pool.execute('SELECT COUNT(*) as count FROM alerts');
    const totalAlerts = totalResult[0].count;
    
    // Alertas pendientes
    const [pendingResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM alerts WHERE status = 'Pendiente'"
    );
    const pendingAlerts = pendingResult[0].count;
    
    // Alertas resueltas
    const [resolvedResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM alerts WHERE status = 'Resuelto'"
    );
    const resolvedAlerts = resolvedResult[0].count;
    
    // Alertas por tipo
    const [typeResults] = await pool.execute(
      'SELECT alertType, COUNT(*) as count FROM alerts GROUP BY alertType'
    );
    const alertsByType = typeResults.reduce((acc, row) => {
      acc[row.alertType] = row.count;
      return acc;
    }, {});
    
    // Alertas por estado
    const [statusResults] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM alerts GROUP BY status'
    );
    const alertsByStatus = statusResults.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});
    
    return {
      totalAlerts,
      pendingAlerts,
      resolvedAlerts,
      alertsByType,
      alertsByStatus
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de alertas:', error.message);
    throw error;
  }
};

// ==================== FUNCIONES DE SEGUIMIENTO (ACCIONES) ====================

/**
 * Registrar una acción (Remisión o Actuación) sobre una alerta
 */
const createCaseAction = async (actionData) => {
  try {
    const { 
      alertId, collaboratorId, category, actionType, 
      responsibleName, description, area, urgency, actionDate,
      result: actionResult, fileName, fileUrl, normType, normArticle 
    } = actionData;
    
    const [result] = await pool.execute(
      `INSERT INTO case_actions 
       (alertId, collaboratorId, category, actionType, responsibleName, description, area, urgency, actionDate, result, fileName, fileUrl, normType, normArticle) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [alertId, collaboratorId, category, actionType, 
       responsibleName || '', description || '', area || '', urgency || '', actionDate || new Date(),
       actionResult || '', fileName || '', fileUrl || '', normType || '', normArticle || '']
    );
    
    // Si la acción fue de tipo "Cierre del caso", actualizar el estado de la alerta
    if (actionType === 'Cierre del caso' || actionType === 'Cierre') {
      await pool.execute("UPDATE alerts SET status = 'Resuelta' WHERE id = ?", [alertId]);
    } else if (actionType === 'Escalamiento' || category === 'Remision') {
      await pool.execute("UPDATE alerts SET status = 'En Proceso' WHERE id = ?", [alertId]);
    }
    
    return result.insertId;
  } catch (error) {
    console.error('❌ Error al crear acción de caso:', error.message);
    throw error;
  }
};

/**
 * Obtener todas las acciones registradas para una alerta específica
 */
const getActionsByAlertId = async (alertId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ca.*, u.name as collaboratorName 
       FROM case_actions ca 
       LEFT JOIN users u ON ca.collaboratorId = u.id 
       WHERE ca.alertId = ? 
       ORDER BY ca.actionDate DESC`,
      [alertId]
    );
    return rows;
  } catch (error) {
    console.error('❌ Error al obtener acciones por AlertId:', error.message);
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
  documentIdExists,
  // Funciones de alertas
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertStats,
  // Seguimiento
  createCaseAction,
  getActionsByAlertId
};
