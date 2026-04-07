const express = require('express');
const dashboardController = require('./dashboard.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

// Todas las rutas de dashboard requieren token de administrador o colaborador
router.use(verifyToken);
router.use(authorizeRoles('Administrador', 'Colaboradores', 'Colaborador'));

router.get('/all', dashboardController.getFullAnalytics);
router.get('/risk-trends', dashboardController.getTrends);
router.get('/critical-students', dashboardController.getCritical);
router.get('/risk-distribution', dashboardController.getDistribution);

module.exports = router;
