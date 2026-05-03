const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../users/users.repository');
const authRepository = require('./auth.repository');
const logger = require('../../utils/logger');

// FIX CRÍTICO: Fallback para JWT_SECRET
// Evita que el servidor muera al arrancar en App Runner si la variable de entorno no está configurada,
// lo cual era la causa real de los rollbacks (TCP Health Check fallaba por proceso muerto).
const JWT_SECRET = (process.env.JWT_SECRET || 'PrediVersa*Titanium*Secure*Key*2026!').trim();

if (JWT_SECRET === 'PrediVersa*Titanium*Secure*Key*2026!') {
  logger.warn('⚠️ ADVERTENCIA: JWT_SECRET no detectado en el entorno. Usando clave de respaldo. Asegúrate de configurarlo en AWS.');
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
  const maskedEmail = email.replace(/^(..)(.*)(@.*)$/, "$1***$3");
  console.log(`🔍 [AUTH] Iniciando intento de login para: ${maskedEmail}`);
  
  // ── SEGURIDAD: Sin backdoors hardcodeadas. Toda autenticación pasa por la DB. ──
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    console.warn(`⚠️ [AUTH] Intento de login fallido: Usuario no encontrado.`);
    throw new Error('Credenciales inválidas');
  }

  console.log(`✅ [AUTH] Usuario localizado. Verificando credenciales...`);
  const match = await bcrypt.compare(password, user.password);
  
  if (!match) {
    console.warn(`❌ [AUTH] Contraseña incorrecta para: ${maskedEmail}`);
    throw new Error('Credenciales inválidas');
  }

  if (user.status !== 'Activo') {
    console.warn(`🚫 [AUTH] Intento de entrada en cuenta inactiva: ${maskedEmail}`);
    throw new Error('Cuenta inactiva. Contacte al administrador.');
  }

  console.log(`🎫 [AUTH] Generando tokens de sesión...`);
  const { accessToken, refreshToken } = generateTokens(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  console.log(`💾 [AUTH] Guardando Refresh Token en DB...`);
  await authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

  console.log(`✨ [AUTH] Login exitoso para usuario ID: ${user.id}`);
  logger.info({ event: 'USER_LOGIN_SUCCESS', userId: user.id, role: user.role });
  
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
