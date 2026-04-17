const express = require('express');
const configController = require('./config.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

// 🛡️ Middleware de Seguridad Global para el módulo de Configuración
router.use(verifyToken);
router.use(authorizeRoles('Administrador'));

/**
 * ⚙️ CONFIGURACIÓN DEL SISTEMA - Rutas Protegidas
 */

// Dependencias
router.get('/dependencias', configController.listDependencias);
router.post('/dependencias', configController.signupDependencia);
router.put('/dependencias/:id', configController.modifyDependencia);
router.delete('/dependencias/:id', configController.removeDependencia);

// Roles y Auditoría
router.get('/roles', configController.listRoles);
router.get('/auditoria', configController.getAudit);

module.exports = router;
