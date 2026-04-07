const userService = require('./users.service');
const AppError = require('../../utils/appError');

/**
 * CONTROLADOR (EXPRESS INTERFACE) - DOMINIO USUARIOS
 */

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    res.json({ success: true, count: users.length, users, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    const activos = users.filter(u => u.status === 'Activo').length;
    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers: activos,
        inactiveUsers: users.length - activos,
        usersByRole: {
          Estudiante: users.filter(u => u.role === 'Estudiante').length,
          Colaboradores: users.filter(u => u.role === 'Colaboradores').length,
          Administrador: users.filter(u => u.role === 'Administrador').length
        }
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ success: true, user, requestId: req.requestId });
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

const register = async (req, res, next) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json({ success: true, user: newUser, requestId: req.requestId });
  } catch (error) {
    const code = error.message.includes('ya está registrado') ? 409 : 400;
    next(new AppError(error.message, code));
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const updatedUser = await userService.updateProfile(userId, req.body);
    res.json({ success: true, user: updatedUser, requestId: req.requestId });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

const deactivate = async (req, res, next) => {
  try {
    const result = await userService.deactivateUser(req.params.id);
    res.json({ ...result, requestId: req.requestId });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

module.exports = {
  getAllUsers,
  getProfile,
  register,
  update,
  deactivate,
  getStats
};
