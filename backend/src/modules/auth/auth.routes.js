const express = require('express');
const authController = require('./auth.controller');
const { loginLimiter } = require('../../middleware/security');
const { verifyToken } = require('../../middleware/auth');

const router = express.Router();

/**
 * RUTAS DEL DOMINIO AUTENTICACIÓN
 */

// Login con protección contra fuerza bruta (LoginLimiter)
router.post('/login', loginLimiter, authController.login);

// Rotación de tokens (Refresh)
router.post('/refresh', authController.refresh);

// Cerrar sesión e invalidar tokens
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
