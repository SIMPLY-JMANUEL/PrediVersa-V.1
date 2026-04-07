const configService = require('./config.service');

/**
 * CONTROLLER - DOMINIO CONFIGURACIÓN
 */

/** --- DEPENDENCIAS --- */
const getDependencies = async (req, res, next) => {
  try {
    const list = await configService.listDependencies();
    res.json({ success: true, dependencias: list, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const postDependency = async (req, res, next) => {
  try {
    const userContext = { id: req.user.id, name: req.user.name, ip: req.ip };
    const id = await configService.addDependency(req.body, userContext);
    res.status(201).json({ success: true, id, message: 'Dependencia creada', requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const putDependency = async (req, res, next) => {
  try {
    const userContext = { id: req.user.id, name: req.user.name, ip: req.ip };
    await configService.editDependency(req.params.id, req.body, userContext);
    res.json({ success: true, message: 'Dependencia actualizada', requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const deleteDependency = async (req, res, next) => {
  try {
    const userContext = { id: req.user.id, name: req.user.name, ip: req.ip };
    await configService.removeDependency(req.params.id, userContext);
    res.json({ success: true, message: 'Dependencia eliminada', requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

/** --- ROLES --- */
const getRoles = async (req, res, next) => {
  try {
    const list = await configService.listRoles();
    res.json({ success: true, roles: list, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

/** --- AUDITORÍA --- */
const getAudit = async (req, res, next) => {
  try {
    const list = await configService.listAuditLogs(200);
    res.json({ success: true, registros: list, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDependencies,
  postDependency,
  putDependency,
  deleteDependency,
  getRoles,
  getAudit
};
