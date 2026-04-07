const dashboardRepository = require('./dashboard.repository');

/**
 * SERVICE - DOMINIO DASHBOARD
 */

const getAnalytics = async () => {
  const [trends, critical, distribution] = await Promise.all([
    dashboardRepository.getRiskTrends(),
    dashboardRepository.getCriticalStudents(),
    dashboardRepository.getRiskDistribution()
  ]);

  return {
    trends,
    critical,
    distribution
  };
};

module.exports = {
  getAnalytics
};
