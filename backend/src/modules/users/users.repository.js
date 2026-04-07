const { pool } = require('../../db/connection');

/**
 * CAPA DE ACCESO A DATOS (REPOSITORY) - DOMINIO USUARIOS
 * Solo consultas SQL puras. No hay lógica de negocio aquí.
 */

const findAll = async () => {
  const [rows] = await pool.execute(
    `SELECT id, documentId, email, name, role, phone, address, birthDate, edad, lugarNacimiento, 
     nombrePadre, nombreMadre, grado, profilePicture, status, 
     repName, repDocType, repDocId, repRelationship, repPhone, repEmail, repAddress,
     institutionalEmail, isVerified, createdAt, updatedAt 
     FROM users ORDER BY id ASC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findByDocumentId = async (documentId) => {
  const [rows] = await pool.execute(
    'SELECT id, documentId, email, name, role, phone, address, birthDate, status, createdAt, updatedAt FROM users WHERE documentId = ?',
    [documentId]
  );
  return rows[0] || null;
};

const create = async (userData) => {
  const { 
    documentId, email, password, name, role, phone, address, birthDate, edad, 
    lugarNacimiento, nombrePadre, nombreMadre, grado, profilePicture,
    repName, repDocType, repDocId, repRelationship, repPhone, repEmail, repAddress,
    institutionalEmail, isVerified
  } = userData;
  
  const valuesToInsert = [
    documentId, email, password, name, role, phone, address, birthDate, edad, 
    lugarNacimiento, nombrePadre, nombreMadre, grado, profilePicture,
    repName, repDocType, repDocId, repRelationship, repPhone, 
    repEmail, repAddress, institutionalEmail, isVerified
  ].map(v => (v === undefined || v === '' || v === 'null') ? null : v);

  const [result] = await pool.execute(
    `INSERT INTO users (
      documentId, email, password, name, role, phone, address, birthDate, edad, 
      lugarNacimiento, nombrePadre, nombreMadre, grado, profilePicture, 
      repName, repDocType, repDocId, repRelationship, repPhone, repEmail, repAddress,
      institutionalEmail, isVerified, status
    ) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo')`,
    valuesToInsert
  );
  
  return result.insertId;
};

const update = async (id, updates, values) => {
  await pool.execute(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    [...values, id]
  );
  return await findById(id);
};

const remove = async (id) => {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
};

const countByStatus = async (status) => {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) as count FROM users WHERE status = ?",
    [status]
  );
  return rows[0].count;
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByDocumentId,
  create,
  update,
  remove,
  countByStatus
};
