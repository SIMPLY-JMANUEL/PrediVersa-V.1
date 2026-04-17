const configService = require('./config.service');

/**
 * CONTROLLER - DOMINIO CONFIGURACIÓN
 */

const listDependencias = async (req, res, next) => {
  try {
    const data = await configService.getDependencias();
    res.json({ success: true, dependencias: data });
  } catch (error) { next(error); }
};

const signupDependencia = async (req, res, next) => {
  try {
    const id = await configService.createDependencia(req.body);
    res.status(201).json({ success: true, id, message: 'Dependencia creada' });
  } catch (error) { next(error); }
};

const modifyDependencia = async (req, res, next) => {
  try {
    await configService.updateDependencia(req.params.id, req.body);
    res.json({ success: true, message: 'Dependencia actualizada' });
  } catch (error) { next(error); }
};

const removeDependencia = async (req, res, next) => {
  try {
    await configService.deleteDependencia(req.params.id);
    res.json({ success: true, message: 'Dependencia eliminada' });
  } catch (error) { next(error); }
};

const listRoles = async (req, res, next) => {
  try {
    const data = await configService.getRoles();
    res.json({ success: true, roles: data });
  } catch (error) { next(error); }
};

const getAudit = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 200;
    const data = await configService.getAuditLogs(limit);
    res.json({ success: true, registros: data });
  } catch (error) { next(error); }
};

module.exports = {
  listDependencias,
  signupDependencia,
  modifyDependencia,
  removeDependencia,
  listRoles,
  getAudit
};
