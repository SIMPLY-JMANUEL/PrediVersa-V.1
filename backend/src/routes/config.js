const express = require('express');
const { pool } = require('../db/connection');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

/* ─────────────────────────────────────────────
   DEPENDENCIAS
───────────────────────────────────────────── */
router.get('/dependencias', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM dependencias ORDER BY id_dependencia DESC');
    res.json({ success: true, dependencias: rows });
  } catch (e) {
    console.error('❌ dependencias GET:', e.message);
    res.status(500).json({ success: false, message: 'Error al obtener dependencias' });
  }
});

router.post('/dependencias', async (req, res) => {
  const { nombre, tipo, id_responsable, correo, telefono, estado } = req.body;
  if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' });
  try {
    const [r] = await pool.execute(
      'INSERT INTO dependencias (nombre, tipo, id_responsable, correo, telefono, estado) VALUES (?,?,?,?,?,?)',
      [nombre, tipo || 'Otro', id_responsable || null, correo || '', telefono || '', estado || 'Activa']
    );
    res.status(201).json({ success: true, id: r.insertId, message: 'Dependencia creada' });
  } catch (e) {
    console.error('❌ dependencias POST:', e.message);
    res.status(500).json({ success: false, message: 'Error al crear dependencia' });
  }
});

router.put('/dependencias/:id', async (req, res) => {
  const { nombre, tipo, id_responsable, correo, telefono, estado } = req.body;
  try {
    await pool.execute(
      'UPDATE dependencias SET nombre=?, tipo=?, id_responsable=?, correo=?, telefono=?, estado=? WHERE id_dependencia=?',
      [nombre, tipo, id_responsable || null, correo || '', telefono || '', estado, req.params.id]
    );
    res.json({ success: true, message: 'Dependencia actualizada' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
});

router.delete('/dependencias/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM dependencias WHERE id_dependencia=?', [req.params.id]);
    res.json({ success: true, message: 'Dependencia eliminada' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
});

/* ─────────────────────────────────────────────
   ROLES Y PERMISOS
───────────────────────────────────────────── */
router.get('/roles', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM roles ORDER BY id_rol DESC');
    res.json({ success: true, roles: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al obtener roles' });
  }
});

router.post('/roles', async (req, res) => {
  const { nombre_rol, descripcion, permisos, estado } = req.body;
  if (!nombre_rol) return res.status(400).json({ success: false, message: 'Nombre del rol requerido' });
  try {
    const [r] = await pool.execute(
      'INSERT INTO roles (nombre_rol, descripcion, permisos, estado) VALUES (?,?,?,?)',
      [nombre_rol, descripcion || '', permisos ? JSON.stringify(permisos) : null, estado || 'Activo']
    );
    res.status(201).json({ success: true, id: r.insertId, message: 'Rol creado' });
  } catch (e) {
    console.error('❌ roles POST:', e.message);
    res.status(500).json({ success: false, message: 'Error al crear rol' });
  }
});

router.put('/roles/:id', async (req, res) => {
  const { nombre_rol, descripcion, permisos, estado } = req.body;
  try {
    await pool.execute(
      'UPDATE roles SET nombre_rol=?, descripcion=?, permisos=?, estado=? WHERE id_rol=?',
      [nombre_rol, descripcion || '', permisos ? JSON.stringify(permisos) : null, estado, req.params.id]
    );
    res.json({ success: true, message: 'Rol actualizado' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM roles WHERE id_rol=?', [req.params.id]);
    res.json({ success: true, message: 'Rol eliminado' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al eliminar' });
  }
});

/* ─────────────────────────────────────────────
   AUDITORÍA
───────────────────────────────────────────── */
router.get('/auditoria', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM auditoria ORDER BY fecha DESC LIMIT 200'
    );
    res.json({ success: true, registros: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al obtener auditoría' });
  }
});

// Helper para registrar acciones (pueden llamarlo otras rutas internas)
router.post('/auditoria', async (req, res) => {
  const { id_usuario, usuario_nombre, accion, modulo, ip } = req.body;
  try {
    await pool.execute(
      'INSERT INTO auditoria (id_usuario, usuario_nombre, accion, modulo, ip) VALUES (?,?,?,?,?)',
      [id_usuario || null, usuario_nombre || 'Sistema', accion, modulo, ip || '']
    );
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error al registrar auditoría' });
  }
});

module.exports = router;
