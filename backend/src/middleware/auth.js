const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_123';

/**
 * Middleware para verificar si el usuario está autenticado mediante JWT
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticación no proporcionado' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adjuntar datos del usuario al objeto request
    next();
  } catch (error) {
    console.error('❌ Error de validación de token:', error.message);
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {Array} roles - Lista de roles permitidos (ej. ['Administrador', 'Colaboradores'])
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para realizar esta acción' 
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
