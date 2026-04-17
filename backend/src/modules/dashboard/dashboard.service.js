const dashboardRepository = require('./dashboard.repository');

/**
 * SERVICE - DOMINIO DASHBOARD
 * Lógica de negocio para analíticas.
 */

const getAnalytics = async () => {
  const [trends, critical, distribution] = await Promise.all([
    dashboardRepository.getRiskTrends(),
    dashboardRepository.getCriticalStudents(),
    dashboardRepository.getRiskDistribution()
  ]);
  return { trends, critical, distribution };
};

const getRiskTrends = async (days) => {
  return await dashboardRepository.getRiskTrends(days);
};

const getCriticalStudents = async (limit) => {
  return await dashboardRepository.getCriticalStudents(limit);
};

const getRiskDistribution = async () => {
  return await dashboardRepository.getRiskDistribution();
};

module.exports = {
  getAnalytics,
  getRiskTrends,
  getCriticalStudents,
  getRiskDistribution
};
