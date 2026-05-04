const alertRepository = require('./alerts.repository');
const userRepository = require('../users/users.repository');
const { invokeMotorVersaLambda } = require('../../utils/lambdaService');
const { notificarAdmins } = require('../../utils/notificaciones');

/**
 * CAPA DE SERVICIO (BUSINESS LOGIC) - DOMINIO ALERTAS
 */

const getStats = async () => {
  return await alertRepository.getStats();
};

const listAlerts = async ({ page = 1, limit = 20, status = null, alertType = null } = {}) => {
  return await alertRepository.findAll({ page, limit, status, alertType });
};

const createManualAlert = async (alertData, userId) => {
  const data = { ...alertData, createdBy: userId };
  if (!data.ticketNumber) {
    data.ticketNumber = `TKT-${Date.now()}`;
  }
  return await alertRepository.create(data);
};

const analyzeAndCreateAlert = async (inputData) => {
  const { studentName, studentUsername, mensaje, tipoViolencia, esUrgente = false } = inputData;
  
  const analisis = await invokeMotorVersaLambda({
    texto: mensaje || '',
    tipoViolencia: tipoViolencia || '',
    frecuencia: '',
    historial: []
  });

  const now = new Date();
  const alertTypeMap = { 'bajo': 'Informativa', 'medio': 'Advertencia', 'alto': 'Critica' };
  const finalAlertType = analisis.es_emergencia ? 'Critica' : alertTypeMap[analisis.nivel_riesgo];
  const emoji = analisis.nivel_riesgo === 'alto' ? '🔴' : (analisis.nivel_riesgo === 'medio' ? '🟠' : '🟢');
  
  const ticketNumber = `BOT-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${now.getTime().toString().slice(-6)}`;

  const description = [
    `${emoji} ALERTA AUTOMÁTICA — CHATBOT PREDIVERSA`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Nivel Versa: ${analisis.nivel_riesgo.toUpperCase()} (${analisis.score}/100)`,
    `Tipo: ${tipoViolencia || 'General'}`,
    `Categorías: ${analisis.tipos_violencia.join(', ') || 'General'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Mensaje Estudiante: "${mensaje || 'Sin texto'}"`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Fuente: Motor Versa Unified`
  ].join('\n');

  const newAlert = await alertRepository.create({
    studentName,
    studentUsername,
    alertType: finalAlertType,
    description,
    ticketNumber,
    alertDate: now.toISOString().split('T')[0],
    alertTime: now.toTimeString().slice(0, 5),
    status: (analisis.nivel_riesgo === 'alto' || esUrgente) ? 'Urgente' : 'Pendiente'
  });

  return { alert: newAlert, score: analisis.score };
};

const registerAction = async (actionData) => {
  const actionId = await alertRepository.createAction(actionData);
  const alertData = await alertRepository.findById(actionData.alertId);
  
  if (alertData) {
    notificarAdmins({
      tipo: 'colaborador_accion',
      nivel: 'medio',
      nombre: alertData.studentName,
      ticket: alertData.ticketNumber,
      descripcion: `Colaborador ${actionData.responsibleName || 'N/A'} registró actividad: ${actionData.actionType}.`,
      timestamp: new Date().toISOString()
    });
  }
  
  return actionId;
};

const getHistory = async (alertId) => {
  return await alertRepository.findActionsByAlertId(alertId);
};

const updateAlert = async (id, data) => {
  const updates = [];
  const values = [];
  
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  });

  if (updates.length === 0) return await alertRepository.findById(id);
  return await alertRepository.update(id, updates, values);
};

// --- Colaboración v4.5: Autonomía y Chat ---

const reassignAlert = async (alertId, fromUser, toUserId, area, deadline) => {
  const original = await alertRepository.findById(alertId);
  if (!original) throw new Error('Alerta no encontrada');

  const targetUser = await userRepository.findById(toUserId);
  if (!targetUser) throw new Error('Usuario destino no encontrado');

  const canReassign = (actorRole, targetRole) => {
    if (actorRole === 'Administrador' || actorRole === 'Coordinador') return true;
    if (actorRole === 'Psicologo') return targetRole === 'Psicologo' || targetRole === 'Coordinador';
    if (actorRole === 'Docente') return targetRole === 'Coordinador';
    return false;
  };

  if (!canReassign(fromUser.role, targetUser.role)) {
    throw new Error(`El rol ${fromUser.role} no tiene permisos para reasignar a un ${targetUser.role}`);
  }

  // 1. Ejecutar Cambio con todos los campos
  await alertRepository.update(
    alertId, 
    ['assignedTo = ?', 'assignedArea = ?', 'deadline = ?', 'status = ?'], 
    [toUserId, area || null, deadline || null, 'En Proceso']
  );

  // 2. Registrar en Historial
  await alertRepository.saveHistory({
    alert_id: alertId,
    action: 'assigned',
    performed_by: fromUser.id,
    metadata: { 
      from_role: fromUser.role,
      to_name: targetUser.name, 
      to_role: targetUser.role,
      area: area,
      deadline: deadline,
      reason: 'Reasignación autónoma operativa'
    }
  });

  return { success: true, new_assigned: targetUser.name };
};

const postMessage = async (alertId, senderId, message) => {
  return await alertRepository.createMessage({ alert_id: alertId, sender_id: senderId, message });
};

const getMessages = async (alertId) => {
  return await alertRepository.findMessagesByAlertId(alertId);
};

const restartAlert = async (alertId, adminId) => {
  const original = await alertRepository.findById(alertId);
  if (!original) throw new Error('Alerta original no encontrada');

  const now = new Date();
  const restartCount = (original.restart_count || 0) + 1;
  const newTicket = `RE-${original.ticketNumber}-${restartCount}`;

  const newAlert = await alertRepository.create({
    ...original,
    id: undefined,
    ticketNumber: newTicket,
    status: 'Pendiente',
    restart_count: restartCount,
    parent_alert_id: original.id,
    description: `[REINICIO v${restartCount}] Ciclo de seguimiento reiniciado por administrador. Referencia original: ${original.ticketNumber}.`,
    alertDate: now.toISOString().split('T')[0],
    alertTime: now.toTimeString().slice(0, 5),
    createdAt: undefined,
    updatedAt: undefined
  });

  await alertRepository.saveHistory({
    alert_id: original.id,
    action: 'restarted',
    performed_by: adminId,
    metadata: { 
      new_ticket: newTicket, 
      new_alert_id: newAlert.id,
      reason: 'Seguimiento reiniciado para nueva observación'
    }
  });

  await alertRepository.saveHistory({
    alert_id: newAlert.id,
    action: 'created',
    performed_by: adminId,
    metadata: { 
      is_restart: true, 
      parent_id: original.id,
      parent_ticket: original.ticketNumber
    }
  });

  await alertRepository.update(original.id, ['status = ?'], ['Cerrada']);

  return newAlert;
};

module.exports = {
  getStats,
  listAlerts,
  createManualAlert,
  analyzeAndCreateAlert,
  registerAction,
  getHistory,
  updateAlert,
  restartAlert,
  reassignAlert,
  postMessage,
  getMessages
};
