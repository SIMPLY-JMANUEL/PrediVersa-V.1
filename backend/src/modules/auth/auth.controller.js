const authService = require('./auth.service');
const AppError = require('../../utils/appError');

/**
 * CONTROLADOR (EXPRESS INTERFACE) - DOMINIO AUTENTICACIÓN
 */

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      message: 'Inicio exitoso', 
      token: accessToken, 
      user: userWithoutPassword,
      requestId: req.requestId 
    });
  } catch (error) {
    // Convertir a AppError Operacional (401)
    next(new AppError(error.message, 401));
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(token);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, token: accessToken, requestId: req.requestId });
  } catch (error) {
    next(new AppError(error.message, 401));
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    await authService.logout(req.user.id, token);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Sesión cerrada', requestId: req.requestId });
  } catch (error) {
    next(error); // Error Crítico o Desconocido
  }
};

const register = async (req, res, next) => {
  try {
    const userRepository = require('../users/users.repository');
    const bcrypt = require('bcryptjs');
    
    // 🔥 SEGURIDAD: Usar req.validatedBody de Zod y FORZAR el rol de Estudiante
    const data = req.validatedBody || req.body; 
    const safeData = {
      ...data,
      role: 'Estudiante',
      status: 'Activo'
    };

    const existingUser = await userRepository.findByEmail(safeData.email);
    if (existingUser) return res.status(409).json({ success: false, message: 'El email ya está registrado' });

    const hashedPassword = await bcrypt.hash(safeData.password, 10);
    const result = await userRepository.create({ ...safeData, password: hashedPassword });
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente como Estudiante', 
      user: { id: result.insertId, email: safeData.email, name: safeData.name, role: 'Estudiante' } 
    });
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    next(new AppError('Error interno del servidor en registro', 500));
  }
};

const me = async (req, res, next) => {
  try {
    const userRepository = require('../users/users.repository');
    // Using req.user hydrated by verifyToken middleware
    const user = await userRepository.findById(req.user.id);
    if (!user || user.status !== 'Activo') return res.status(403).json({ success: false, message: 'Sesión inválida o cuenta inactiva' });
    
    res.json({
      success: true,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role, profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token expirado o inválido' });
  }
};

module.exports = {
  login,
  refresh,
  logout,
  register,
  me
};
