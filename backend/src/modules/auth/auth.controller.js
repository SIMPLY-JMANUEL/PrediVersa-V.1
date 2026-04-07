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

module.exports = {
  login,
  refresh,
  logout
};
