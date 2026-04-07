const alertService = require('./alerts.service');
const AppError = require('../../utils/appError');

/**
 * CONTROLADOR (EXPRESS INTERFACE) - DOMINIO ALERTAS
 */

const getAlerts = async (req, res, next) => {
  try {
    // Paginación server-side: ?page=1&limit=20&status=&alertType=
    const page    = Math.max(1, parseInt(req.query.page)  || 1);
    const limit   = Math.min(100, parseInt(req.query.limit) || 20);
    const status  = req.query.status  || null;
    const alertType = req.query.alertType || null;

    const { alerts, total } = await alertService.listAlerts({ page, limit, status, alertType });
    res.json({
      success: true,
      alerts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await alertService.getStats();
    res.json({ success: true, stats, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const createManual = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newAlert = await alertService.createManualAlert(req.body, userId);
    res.status(201).json({ success: true, message: 'Alerta creada', alert: newAlert, requestId: req.requestId });
  } catch (error) {
    next(new AppError('Fallo al crear alerta manual', 400));
  }
};

const analyze = async (req, res, next) => {
  try {
    const result = await alertService.analyzeAndCreateAlert(req.body);
    res.status(201).json({ success: true, ...result, requestId: req.requestId });
  } catch (error) {
    // Error operacional en el análisis IA
    next(new AppError(`Error en análisis Versa: ${error.message}`, 400));
  }
};

const postAction = async (req, res, next) => {
  try {
    const actionId = await alertService.registerAction(req.body);
    res.status(201).json({ success: true, message: 'Seguimiento registrado con éxito', actionId, requestId: req.requestId });
  } catch (error) {
    next(new AppError(`Error al registrar seguimiento: ${error.message}`, 400));
  }
};

const getHistory = async (req, res, next) => {
  try {
    const actions = await alertService.getHistory(req.params.id);
    res.json({ success: true, actions, requestId: req.requestId });
  } catch (error) {
    next(new AppError('No se pudo obtener el historial del caso', 404));
  }
};

const update = async (req, res, next) => {
  try {
    const updatedAlert = await alertService.updateAlert(req.params.id, req.body);
    if (!updatedAlert) return next(new AppError('Alerta no encontrada', 404));
    res.json({ success: true, message: 'Alerta actualizada', alert: updatedAlert, requestId: req.requestId });
  } catch (error) {
    next(new AppError('Fallo en actualización de alerta', 400));
  }
};

module.exports = {
  getAlerts,
  getStats,
  createManual,
  analyze,
  postAction,
  getHistory,
  update
};
