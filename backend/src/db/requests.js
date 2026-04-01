const { pool, query, querySingle } = require('./connection');

/**
 * Gestión de solicitudes de registro (Admin Approval)
 */

/**
 * Obtener todas las solicitudes pendientes
 */
const getAllPendingRequests = () => query(
  `SELECT * FROM user_requests WHERE status = 'Pendiente' ORDER BY createdAt DESC`
);

/**
 * Obtener una solicitud por ID
 */
const getRequestById = (id) => querySingle(
  `SELECT * FROM user_requests WHERE id = ?`,
  [id]
);

/**
 * Crear una nueva solicitud de acceso
 */
const createAccessRequest = async (requestData) => {
  try {
    const { name, email, phone, documentId, role } = requestData;
    
    // Verificar si el usuario ya existe para no duplicar solicitudes innecesariamente
    const [existing] = await pool.execute(
      "SELECT id FROM user_requests WHERE email = ? AND status = 'Pendiente'", 
      [email]
    );
    
    if (existing.length > 0) {
      throw new Error("Ya existe una solicitud pendiente con este correo electrónico.");
    }

    const [result] = await pool.execute(
      `INSERT INTO user_requests (name, email, phone, documentId, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || '', documentId || '', role || 'Estudiante']
    );
    
    return result.insertId;
  } catch (error) {
    console.error('❌ Error al crear solicitud de acceso:', error.message);
    throw error;
  }
};

/**
 * Procesar una solicitud (Aprobar o Rechazar)
 */
const processRequest = async (id, status, adminId) => {
  try {
    const processedAt = new Date();
    await pool.execute(
      `UPDATE user_requests 
       SET status = ?, processed_by = ?, processed_at = ? 
       WHERE id = ?`,
      [status, adminId, processedAt, id]
    );
    
    return true;
  } catch (error) {
    console.error('❌ Error al procesar solicitud:', error.message);
    throw error;
  }
};

module.exports = {
  getAllPendingRequests,
  getRequestById,
  createAccessRequest,
  processRequest
};
