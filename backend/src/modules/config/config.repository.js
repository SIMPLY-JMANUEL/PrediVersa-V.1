const { pool } = require('../../db/connection');

/**
 * REPOSITORY - DOMINIO CONFIGURACIÓN & ADMIN
 */

/** --- DEPENDENCIAS --- */
const getDependencies = async () => {
  const [rows] = await pool.execute('SELECT * FROM dependencias ORDER BY id_dependencia DESC');
  return rows;
};

const createDependency = async (data) => {
  const { nombre, tipo, id_responsable, correo, telefono, estado } = data;
  const [result] = await pool.execute(
    'INSERT INTO dependencias (nombre, tipo, id_responsable, correo, telefono, estado) VALUES (?,?,?,?,?,?)',
    [nombre, tipo || 'Otro', id_responsable || null, correo || '', telefono || '', estado || 'Activa']
  );
  return result.insertId;
};

const updateDependency = async (id, data) => {
  const { nombre, tipo, id_responsable, correo, telefono, estado } = data;
  await pool.execute(
    'UPDATE dependencias SET nombre=?, tipo=?, id_responsable=?, correo=?, telefono=?, estado=? WHERE id_dependencia=?',
    [nombre, tipo, id_responsable || null, correo || '', telefono || '', estado, id]
  );
};

const deleteDependency = async (id) => {
  await pool.execute('DELETE FROM dependencias WHERE id_dependencia=?', [id]);
};

/** --- ROLES --- */
const getRoles = async () => {
  const [rows] = await pool.execute('SELECT * FROM roles ORDER BY id DESC');
  return rows;
};

/** --- AUDITORÍA --- */
const logAudit = async (data) => {
  const { userId, userName, action, module, ip } = data;
  await pool.execute(
    'INSERT INTO auditoria (id_usuario, usuario_nombre, accion, modulo, ip) VALUES (?,?,?,?,?)',
    [userId || null, userName || 'Sistema', action, module, ip || '']
  );
};

const getAuditLogs = async (limit = 200) => {
  const [rows] = await pool.execute('SELECT * FROM auditoria ORDER BY fecha DESC LIMIT ?', [limit]);
  return rows;
};

module.exports = {
  getDependencies,
  createDependency,
  updateDependency,
  deleteDependency,
  getRoles,
  logAudit,
  getAuditLogs
};
