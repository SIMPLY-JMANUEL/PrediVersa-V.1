const { pool } = require('../../db/connection');

/**
 * REPOSITORY - DOMINIO DASHBOARD
 * Consultas de analítica optimizadas.
 */

const getRiskTrends = async (days = 30) => {
  const [rows] = await pool.execute(`
    SELECT 
      DATE(createdAt) as date, 
      ROUND(AVG(risk_score), 2) as avg_risk,
      COUNT(*) as total_messages
    FROM chatbot_interacciones
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date DESC
  `, [days]);
  return rows;
};

const getCriticalStudents = async (limit = 10) => {
  const [rows] = await pool.execute(`
    SELECT 
      session_id as student_id, 
      MAX(risk_score) as max_risk,
      COUNT(*) as total_interacciones,
      MAX(createdAt) as last_seen
    FROM chatbot_interacciones
    WHERE risk = 'ALTO'
    GROUP BY session_id
    ORDER BY max_risk DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

const getRiskDistribution = async () => {
  const [rows] = await pool.execute(`
    SELECT risk, COUNT(*) as count 
    FROM chatbot_interacciones 
    GROUP BY risk
  `);
  return rows;
};

module.exports = {
  getRiskTrends,
  getCriticalStudents,
  getRiskDistribution
};
