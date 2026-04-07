const { pool } = require('../../db/connection');

/**
 * CAPA DE ACCESO A DATOS (REPOSITORY) - DOMINIO AUTENTICACIÓN
 * Manejo especializado de la tabla refresh_tokens.
 */

const saveRefreshToken = async (userId, token, expiresAt) => {
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

const findToken = async (token) => {
  const [rows] = await pool.execute(
    'SELECT * FROM refresh_tokens WHERE token = ?',
    [token]
  );
  return rows[0] || null;
};

const revokeToken = async (id, newRefreshToken = null) => {
  await pool.execute(
    'UPDATE refresh_tokens SET is_revoked = TRUE, replaced_by_token = ? WHERE id = ?',
    [newRefreshToken, id]
  );
};

const revokeAllUserTokens = async (userId) => {
  await pool.execute(
    'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?',
    [userId]
  );
};

const deleteTokenByString = async (userId, token) => {
  await pool.execute(
    'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ? AND token = ?',
    [userId, token]
  );
};

module.exports = {
  saveRefreshToken,
  findToken,
  revokeToken,
  revokeAllUserTokens,
  deleteTokenByString
};
