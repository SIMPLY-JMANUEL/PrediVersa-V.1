const configRepository = require('./config.repository');

/**
 * SERVICE - DOMINIO CONFIGURACIÓN
 */

const getDependencias = () => configRepository.getDependencias();
const createDependencia = (data) => configRepository.createDependencia(data);
const updateDependencia = (id, data) => configRepository.updateDependencia(id, data);
const deleteDependencia = (id) => configRepository.deleteDependencia(id);

const getRoles = () => configRepository.getRoles();
const createRol = (data) => configRepository.createRol(data);

const getAuditLogs = (limit) => configRepository.getAuditLogs(limit);

module.exports = {
  getDependencias,
  createDependencia,
  updateDependencia,
  deleteDependencia,
  getRoles,
  createRol,
  getAuditLogs
};
