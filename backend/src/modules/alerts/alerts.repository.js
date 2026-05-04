const { pool } = require('../../db/connection');

/**
 * CAPA DE ACCESO A DATOS (REPOSITORY) - DOMINIO ALERTAS
 */

/**
 * Busca todas las alertas con paginación server-side y filtros opcionales.
 * @param {object} opts - { page, limit, status, alertType }
 */
const findAll = async ({ page = 1, limit = 20, status = null, alertType = null } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (status)    { conditions.push('a.status = ?');     params.push(status); }
  if (alertType) { conditions.push('a.alertType = ?');  params.push(alertType); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) as total FROM alerts a ${where}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT a.*, u.name as creatorName 
     FROM alerts a 
     LEFT JOIN users u ON a.createdBy = u.id 
     ${where}
     ORDER BY a.createdAt DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  return { alerts: rows, total };
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT a.*, u.name as creatorName 
     FROM alerts a 
     LEFT JOIN users u ON a.createdBy = u.id 
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const create = async (alertData) => {
  const { 
    userId, studentName, studentDocumentId, studentAge, studentGrade, 
    studentUsername, alertType, description, ticketNumber, alertDate, 
    alertTime, deadline, assignedTo, status, createdBy 
  } = alertData;
  
  const [result] = await pool.execute(
    `INSERT INTO alerts (userId, studentName, studentDocumentId, studentAge, studentGrade, 
      studentUsername, alertType, description, ticketNumber, alertDate, alertTime, 
      deadline, assignedTo, status, createdBy, restart_count, parent_alert_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId || null, studentName || '', studentDocumentId || '', studentAge || '', 
     studentGrade || '', studentUsername || '', alertType || 'Informativa', description || '', 
     ticketNumber || '', alertDate || '', alertTime || '', deadline || '', 
     assignedTo || '', status || 'Pendiente', createdBy || null, restart_count || 0, parent_alert_id || null]
  );
  
  return await findById(result.insertId);
};

const update = async (id, updates, values) => {
  await pool.execute(
    `UPDATE alerts SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
    [...values, id]
  );
  return await findById(id);
};

const getStats = async () => {
  const [totalRes] = await pool.execute('SELECT COUNT(*) as count FROM alerts');
  const [pendingRes] = await pool.execute("SELECT COUNT(*) as count FROM alerts WHERE status = 'Pendiente'");
  const [resolvedRes] = await pool.execute("SELECT COUNT(*) as count FROM alerts WHERE status = 'Resuelto'");
  
  const [typeRes] = await pool.execute('SELECT alertType, COUNT(*) as count FROM alerts GROUP BY alertType');
  const [statusRes] = await pool.execute('SELECT status, COUNT(*) as count FROM alerts GROUP BY status');
  
  return {
    total: totalRes[0].count,
    pending: pendingRes[0].count,
    resolved: resolvedRes[0].count,
    byType: typeRes.reduce((acc, row) => ({ ...acc, [row.alertType]: row.count }), {}),
    byStatus: statusRes.reduce((acc, row) => ({ ...acc, [row.status]: row.count }), {})
  };
};

// --- Gestión de Acciones de Seguimiento ---

const createAction = async (actionData) => {
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
  
  // Lógica de actualización de estado automática (Regla de negocio simple)
  if (actionType === 'Cierre del caso' || actionType === 'Cierre') {
    await pool.execute("UPDATE alerts SET status = 'Resuelta' WHERE id = ?", [alertId]);
  } else if (actionType === 'Escalamiento' || category === 'Remision') {
    await pool.execute("UPDATE alerts SET status = 'En Proceso' WHERE id = ?", [alertId]);
  }
  
  return result.insertId;
};

const findActionsByAlertId = async (alertId) => {
  const [rows] = await pool.execute(
    `SELECT ca.*, u.name as collaboratorName 
     FROM case_actions ca 
     LEFT JOIN users u ON ca.collaboratorId = u.id 
     WHERE ca.alertId = ? 
     ORDER BY ca.actionDate DESC`,
    [alertId]
  );
  return rows;
};

// --- Trazabilidad v4.0 ---

const saveHistory = async (historyData) => {
  const { alert_id, action, performed_by, metadata } = historyData;
  const [result] = await pool.execute(
    'INSERT INTO alert_history (alert_id, action, performed_by, metadata) VALUES (?, ?, ?, ?)',
    [alert_id, action, performed_by, JSON.stringify(metadata || {})]
  );
  return result.insertId;
};

const findHistoryByAlertId = async (alert_id) => {
  const [rows] = await pool.execute(
    `SELECT ah.*, u.name as userName, u.role as userRole
     FROM alert_history ah
     LEFT JOIN users u ON ah.performed_by = u.id
     WHERE ah.alert_id = ?
     ORDER BY ah.timestamp DESC`,
    [alert_id]
  );
  return rows;
};

// --- Colaboración v4.5 ---

const createMessage = async (msgData) => {
  const { alert_id, sender_id, message, is_internal } = msgData;
  const [result] = await pool.execute(
    'INSERT INTO alert_messages (alert_id, sender_id, message, is_internal) VALUES (?, ?, ?, ?)',
    [alert_id, sender_id, message, is_internal !== undefined ? is_internal : true]
  );
  return result.insertId;
};

const findMessagesByAlertId = async (alert_id) => {
  const [rows] = await pool.execute(
    `SELECT am.*, u.name as senderName, u.role as senderRole
     FROM alert_messages am
     LEFT JOIN users u ON am.sender_id = u.id
     WHERE am.alert_id = ?
     ORDER BY am.timestamp ASC`,
    [alert_id]
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  getStats,
  createAction,
  findActionsByAlertId,
  saveHistory,
  findHistoryByAlertId,
  createMessage,
  findMessagesByAlertId
};
