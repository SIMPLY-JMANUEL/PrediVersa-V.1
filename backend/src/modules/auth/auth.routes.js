const express = require('express');
const authController = require('./auth.controller');
const { loginLimiter, forgotPasswordLimiter } = require('../../middleware/security');
const { verifyToken } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

/**
 * 🛡️ RUTAS DEL DOMINIO AUTENTICACIÓN (con validación Zod)
 */

// Login con protección bruta + validación de esquema
router.post('/login', loginLimiter, validate(schemas.loginSchema), authController.login);

// Rotación de tokens (Refresh)
router.post('/refresh', authController.refresh);

// Cerrar sesión e invalidar tokens
router.post('/logout', verifyToken, authController.logout);

// Registro (solicitud de acceso) con validación
router.post('/register', validate(schemas.registerSchema), authController.register);

// Recuperación de contraseña (Rate limited + validación)
router.post('/forgot-password', forgotPasswordLimiter, validate(schemas.forgotPasswordSchema), authController.forgotPassword);

// Reset de contraseña con validación de esquema fuerte
router.post('/reset-password', validate(schemas.resetPasswordSchema), authController.resetPassword);

// Obtener usuario actual
router.get('/me', verifyToken, authController.me);

module.exports = router;
