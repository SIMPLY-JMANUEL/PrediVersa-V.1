const { pool } = require('../../db/connection');

/**
 * CAPA DE ACCESO A DATOS (REPOSITORY) - DOMINIO CHATBOT
 */

const saveInteraction = async (data) => {
  const { sessionId, userInput, response, risk, riskScore } = data;
  await pool.execute(
    `INSERT INTO chatbot_interacciones (session_id, user_input, response, risk, risk_score)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, userInput, response, risk, riskScore]
  );
};

const getStats = async () => {
  const [rows] = await pool.execute(`
    SELECT 
      (SELECT COUNT(*) FROM chatbot_reportes) as total_interacciones,
      (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'bajo') as riesgo_bajo,
      (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'medio') as riesgo_medio,
      (SELECT COUNT(*) FROM chatbot_reportes WHERE nivel_riesgo = 'alto') as riesgo_alto_reportes,
      (SELECT COUNT(*) FROM chatbot_alertas_criticas) as total_alertas_criticas,
      (SELECT COUNT(*) FROM chatbot_reuniones) as reuniones_agendadas
  `);
  return rows[0] || {};
};

const saveChatbotAlert = async (alertData) => {
  const { estudiante_id, nombre, descripcion, nivel_riesgo, ticket_number } = alertData;
  await pool.execute(
    `INSERT INTO chatbot_reportes (estudiante_id, nombre, descripcion, nivel_riesgo, ticket_number)
     VALUES (?, ?, ?, ?, ?)`,
    [estudiante_id, nombre, descripcion, nivel_riesgo, ticket_number]
  );
};

module.exports = {
  saveInteraction,
  getStats,
  saveChatbotAlert
};
