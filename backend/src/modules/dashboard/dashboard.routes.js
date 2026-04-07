const express = require('express');
const { verifyToken } = require('../../middleware/auth');
const { executeQuery } = require('../../db/connection');

const router = express.Router();

/**
 * 🔥 DASHBOARD DE ANALÍTICA DE RIESGO - Estructura DDD
 * Proporciona datos agregados para la visualización de riesgos en el panel administrativo.
 */

// 1. Tendencia de Riesgo (Últimos 30 días)
router.get('/risk-trends', verifyToken, async (req, res) => {
  try {
    const results = await executeQuery(`
      SELECT 
        DATE(createdAt) as date, 
        ROUND(AVG(risk_score), 2) as avg_risk,
        COUNT(*) as total_messages
      FROM chatbot_interacciones
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `);
    res.json({ success: true, data: results || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Estudiantes en Riesgo (Liderando el ranking de criticidad)
router.get('/critical-students', verifyToken, async (req, res) => {
  try {
    const results = await executeQuery(`
      SELECT 
        session_id as student_id, 
        MAX(risk_score) as max_risk,
        COUNT(*) as total_interacciones,
        MAX(createdAt) as last_seen
      FROM chatbot_interacciones
      WHERE risk = 'ALTO'
      GROUP BY session_id
      ORDER BY max_risk DESC
      LIMIT 10
    `);
    res.json({ success: true, data: results || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Distribución de Niveles de Riesgo
router.get('/risk-distribution', verifyToken, async (req, res) => {
  try {
    const results = await executeQuery(`
      SELECT risk, COUNT(*) as count 
      FROM chatbot_interacciones 
      GROUP BY risk
    `);
    res.json({ success: true, data: results || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
