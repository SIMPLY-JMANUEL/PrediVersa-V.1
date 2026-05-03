const authService = require('./auth.service');
const userRepository = require('../users/users.repository');
const bcrypt = require('bcryptjs');
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
    next(new AppError(error.message, 401));
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError('No refresh token provided', 401);
    
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
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const data = req.validatedBody || req.body; 
    const safeData = {
      ...data,
      role: 'Estudiante',
      status: 'Activo'
    };

    const existingUser = await userRepository.findByEmail(safeData.email);
    if (existingUser) throw new AppError('El email ya está registrado', 409);

    const hashedPassword = await bcrypt.hash(safeData.password, 12); // Aumentado costo de hash
    const result = await userRepository.create({ ...safeData, password: hashedPassword });
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente', 
      user: { id: result.insertId, email: safeData.email, name: safeData.name, role: 'Estudiante' } 
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user || user.status !== 'Activo') {
      throw new AppError('Sesión inválida o cuenta inactiva', 403);
    }
    
    res.json({
      success: true,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role, profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
  logout,
  register,
  me
};
