const dashboardService = require('./dashboard.service');

/**
 * CONTROLLER - DOMINIO DASHBOARD
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
    const data = await dashboardService.getAnalytics();
    res.json({ success: true, data: data.trends, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const getCritical = async (req, res, next) => {
  try {
    const data = await dashboardService.getAnalytics();
    res.json({ success: true, data: data.critical, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
};

const getDistribution = async (req, res, next) => {
  try {
    const data = await dashboardService.getAnalytics();
    res.json({ success: true, data: data.distribution, requestId: req.requestId });
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
