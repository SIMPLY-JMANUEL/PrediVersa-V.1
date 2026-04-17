const dashboardService = require('./dashboard.service');

/**
 * CONTROLLER - DOMINIO DASHBOARD
 * Manejo de peticiones de analítica.
 */

const getFullAnalytics = async (req, res, next) => {
  try {
    const data = await dashboardService.getAnalytics();
    res.json({ success: true, ...data, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await dashboardService.getRiskTrends(days);
    res.json({ success: true, data, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const getCritical = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await dashboardService.getCriticalStudents(limit);
    res.json({ success: true, data, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const getDistribution = async (req, res, next) => {
  try {
    const data = await dashboardService.getRiskDistribution();
    res.json({ success: true, data, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFullAnalytics,
  getTrends,
  getCritical,
  getDistribution
};
