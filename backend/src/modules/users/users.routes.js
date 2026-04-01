const express = require('express');
const userController = require('./users.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

/**
 * RUTAS DEL DOMINIO USUARIOS
 */

// Obtener perfil propio (Access 15 min / Refresh 7 días activados)
router.get('/me', verifyToken, userController.getProfile);

// Actualizar perfil propio
router.put('/profile', verifyToken, userController.update);

// --- RUTAS ADMINISTRATIVAS ---
router.get('/', verifyToken, authorizeRoles('Administrador'), userController.getAllUsers);

// Registro de nuevos estudiantes (Público)
router.post('/register', userController.register);

// Desactivar usuario (Admin)
router.patch('/:id/deactivate', verifyToken, authorizeRoles('Administrador'), userController.deactivate);

module.exports = router;
