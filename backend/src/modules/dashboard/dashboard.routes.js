const express = require('express');
const dashboardController = require('./dashboard.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

/**
 * 🔒 RUTAS ADMINISTRATIVAS - DASHBOARD
 * Solo accesibles por Administradores y Colaboradores.
 */

// 1. Obtener analítica completa (Dashboard Summary)
router.get('/', verifyToken, authorizeRoles('Administrador', 'Colaboradores'), dashboardController.getFullAnalytics);

// 2. Tendencia de Riesgo (Últimos 30 días)
router.get('/risk-trends', verifyToken, authorizeRoles('Administrador', 'Colaboradores'), dashboardController.getTrends);

// 3. Estudiantes en Riesgo (Critical Rankings)
router.get('/critical-students', verifyToken, authorizeRoles('Administrador', 'Colaboradores'), dashboardController.getCritical);

// 4. Distribución de Niveles de Riesgo
router.get('/risk-distribution', verifyToken, authorizeRoles('Administrador', 'Colaboradores'), dashboardController.getDistribution);

module.exports = router;
