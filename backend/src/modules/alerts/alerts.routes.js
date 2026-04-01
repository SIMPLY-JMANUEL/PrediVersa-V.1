const express = require('express');
const alertController = require('./alerts.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

/**
 * RUTAS DEL DOMINIO ALERTAS
 */

// Obtener todas las alertas (Dashboard)
router.get('/', verifyToken, alertController.getAlerts);

// Estadísticas de alertas
router.get('/stats', verifyToken, authorizeRoles('Administrador', 'Colaboradores', 'Colaborador'), alertController.getStats);

// Crear alerta manualmente
router.post('/', verifyToken, alertController.createManual);

// Endpoint unificado para analizar mensajes (PrediVersa_RiskBot_V1 - Unified Engine)
router.post('/analyze', alertController.analyze);

// Registrar seguimiento profesional (Actuaciones/Remisiones)
router.post('/actions', verifyToken, alertController.postAction);

// Historial de seguimiento de un caso
router.get('/:id/actions', verifyToken, alertController.getHistory);

// Actualizar una alerta (Asignación, Estado, etc.)
router.put('/:id', verifyToken, alertController.update);

module.exports = router;
