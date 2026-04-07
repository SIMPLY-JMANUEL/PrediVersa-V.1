const express = require('express');
const configController = require('./config.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

/**
 * RUTAS DE CONFIGURACIÓN & ADMINISTRACIÓN
 * Todas protegidas con RBAC para Administradores.
 */
router.use(verifyToken);
router.use(authorizeRoles('Administrador'));

// 🏫 Gestión de Dependencias
router.get('/dependencias', configController.getDependencies);
router.post('/dependencias', configController.postDependency);
router.put('/dependencias/:id', configController.putDependency);
router.delete('/dependencias/:id', configController.deleteDependency);

// 🛡️ Gestión de Roles (Unificada)
router.get('/roles', configController.getRoles);

// 🗄️ Libro de Auditoría (Forense)
router.get('/auditoria', configController.getAudit);

module.exports = router;
