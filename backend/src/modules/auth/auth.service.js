const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../users/users.repository');
const authRepository = require('./auth.repository');
const logger = require('../../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.error('❌ CRÍTICO: JWT_SECRET no definido. El servidor no puede iniciar de forma segura.');
  process.exit(1);
}

/**
 * CAPA DE SERVICIO (BUSINESS LOGIC) - DOMINIO AUTENTICACIÓN
 */

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const login = async (email, password) => {
  // ── SEGURIDAD: Sin backdoors hardcodeadas. Toda autenticación pasa por la DB. ──
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error('Credenciales inválidas');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Credenciales inválidas');

  if (user.status !== 'Activo') throw new Error('Cuenta inactiva. Contacte al administrador.');

  const { accessToken, refreshToken } = generateTokens(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

  logger.info({ event: 'USER_LOGIN_SUCCESS', userId: user.id, email: user.email, role: user.role });
  return { accessToken, refreshToken, user };
};

const refreshSession = async (tokenString) => {
  const decoded = jwt.verify(tokenString, JWT_SECRET);
  const tokenRecord = await authRepository.findToken(tokenString);

  // DETECCION DE REUSO (Security Hardening)
  if (tokenRecord && tokenRecord.is_revoked) {
    await authRepository.revokeAllUserTokens(decoded.id);
    throw new Error('Ataque de reuso detectado. Sesión invalidada completamente.');
  }

  if (!tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
    throw new Error('Sesión expirada o inválida');
  }

  const user = await userRepository.findById(decoded.id);
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Rotación: Quemar el actual y guardar el nuevo vinculado
  await authRepository.revokeToken(tokenRecord.id, newRefreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await authRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId, tokenString) => {
  await authRepository.deleteTokenByString(userId, tokenString);
};

module.exports = {
  login,
  refreshSession,
  logout
};
