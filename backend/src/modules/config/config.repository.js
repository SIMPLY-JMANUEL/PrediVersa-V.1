const { pool } = require('../../db/connection');

/**
 * REPOSITORY - DOMINIO CONFIGURACIÓN
 */

// --- DEPENDENCIAS ---
const getDependencias = async () => {
  const [rows] = await pool.execute('SELECT * FROM dependencias ORDER BY id_dependencia DESC');
  return rows;
};

const createDependencia = async (d) => {
  const [r] = await pool.execute(
    'INSERT INTO dependencias (nombre, tipo, id_responsable, correo, telefono, estado) VALUES (?,?,?,?,?,?)',
    [d.nombre, d.tipo || 'Otro', d.id_responsable || null, d.correo || '', d.telefono || '', d.estado || 'Activa']
  );
  return r.insertId;
};

const updateDependencia = async (id, d) => {
  await pool.execute(
    'UPDATE dependencias SET nombre=?, tipo=?, id_responsable=?, correo=?, telefono=?, estado=? WHERE id_dependencia=?',
    [d.nombre, d.tipo, d.id_responsable || null, d.correo || '', d.telefono || '', d.estado, id]
  );
};

const deleteDependencia = async (id) => {
  await pool.execute('DELETE FROM dependencias WHERE id_dependencia=?', [id]);
};

// --- ROLES ---
const getRoles = async () => {
  const [rows] = await pool.execute('SELECT * FROM roles ORDER BY id_rol DESC');
  return rows;
};

const createRol = async (r) => {
  await pool.execute(
    'INSERT INTO roles (nombre_rol, descripcion, permisos, estado) VALUES (?,?,?,?)',
    [r.nombre_rol, r.descripcion, r.permisos ? JSON.stringify(r.permisos) : null, r.estado || 'Activo']
  );
};

// --- AUDITORÍA ---
const getAuditLogs = async (limit = 200) => {
  const [rows] = await pool.execute(
    'SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT ?',
    [limit]
  );
  return rows;
};

module.exports = {
  getDependencias,
  createDependencia,
  updateDependencia,
  deleteDependencia,
  getRoles,
  createRol,
  getAuditLogs
};
