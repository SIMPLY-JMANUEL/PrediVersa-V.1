const configRepository = require('./config.repository');
const AppError = require('../../utils/appError');

/**
 * SERVICE - DOMINIO CONFIGURACIÓN
 */

/** --- DEPENDENCIAS --- */
const listDependencies = async () => {
  return await configRepository.getDependencies();
};

const addDependency = async (data, userContext) => {
  if (!data.nombre) throw new AppError('El nombre de la dependencia es requerido', 400);
  const id = await configRepository.createDependency(data);
  
  // Auditar acción
  await configRepository.logAudit({
    userId: userContext.id,
    userName: userContext.name,
    action: `CRÉACIÓN: Dependencia ${data.nombre}`,
    module: 'CONFIG',
    ip: userContext.ip
  });

  return id;
};

const editDependency = async (id, data, userContext) => {
  await configRepository.updateDependency(id, data);
  
  await configRepository.logAudit({
    userId: userContext.id,
    userName: userContext.name,
    action: `EDICIÓN: Dependencia ID ${id}`,
    module: 'CONFIG',
    ip: userContext.ip
  });
};

const removeDependency = async (id, userContext) => {
  await configRepository.deleteDependency(id);
  
  await configRepository.logAudit({
    userId: userContext.id,
    userName: userContext.name,
    action: `ELIMINACIÓN: Dependencia ID ${id}`,
    module: 'CONFIG',
    ip: userContext.ip
  });
};

/** --- ROLES --- */
const listRoles = async () => {
  return await configRepository.getRoles();
};

/** --- AUDITORÍA --- */
const listAuditLogs = async (limit) => {
  return await configRepository.getAuditLogs(limit);
};

module.exports = {
  listDependencies,
  addDependency,
  editDependency,
  removeDependency,
  listRoles,
  listAuditLogs
};
