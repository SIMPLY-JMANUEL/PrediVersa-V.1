const express = require('express');
const alertController = require('./alerts.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

/**
 * 🛡️ RUTAS DEL DOMINIO ALERTAS (con validación Zod)
 */

// Obtener todas las alertas (Dashboard) — con paginación server-side
router.get('/', verifyToken, alertController.getAlerts);

// Estadísticas de alertas
router.get('/stats', verifyToken, authorizeRoles('Administrador', 'Colaboradores', 'Colaborador'), alertController.getStats);

// Crear alerta manualmente (con validación de esquema)
router.post('/', verifyToken, validate(schemas.createAlertSchema), alertController.createManual);

// Endpoint unificado para analizar mensajes (Motor VERSA)
router.post('/analyze', validate(schemas.analyzeAlertSchema), alertController.analyze);

// Registrar seguimiento profesional (Actuaciones/Remisiones)
router.post('/actions', verifyToken, alertController.postAction);

// Historial de seguimiento de un caso
router.get('/:id/actions', verifyToken, alertController.getHistory);

// Actualizar una alerta (con validación de campos permitidos)
router.put('/:id', verifyToken, validate(schemas.updateAlertSchema), alertController.update);

module.exports = router;

