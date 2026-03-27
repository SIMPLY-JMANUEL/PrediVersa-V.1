const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// @route   POST /api/chatbot/report
// @desc    Recibe un reporte de riesgo desde el Motor de IA (Lex/Rasa/Custom)
// @access  Public (Internal/Webhook Hook)
router.post('/report', async (req, res) => {
  const { 
    estudianteId, 
    nombre, 
    descripcion, 
    tipo_violencia, 
    frecuencia, 
    nivel_riesgo, 
    keywords,
    sentiment_score,
    resumen_patron,
    ticket
  } = req.body;

  try {
    const [result] = await pool.execute(`
      INSERT INTO chatbot_reportes 
      (estudiante_id, nombre, descripcion, tipo_violencia, frecuencia, nivel_riesgo, keywords, sentiment_score, resumen_patron, ticket_number) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      estudianteId || 'anonimo',
      nombre || 'Anónimo',
      descripcion || 'Sin descripción',
      tipo_violencia || 'no_especificado',
      frecuencia || 'no_especificado',
      nivel_riesgo || 'medio',
      JSON.stringify(keywords || []),
      sentiment_score || 0,
      resumen_patron || '',
      ticket || `BOT-${Date.now().toString().slice(-6)}`
    ]);

    // Si el riesgo es alto, también lo registramos en alertas críticas
    if (nivel_riesgo === 'alto') {
      await pool.execute(`
        INSERT INTO chatbot_alertas_criticas 
        (estudiante_id, nombre, descripcion, tipo_violencia, nivel_riesgo, prioridad, ticket_number) 
        VALUES (?, ?, ?, ?, ?, 'URGENTE', ?)
      `, [
        estudianteId || 'anonimo',
        nombre || 'Anónimo',
        descripcion || 'Alerta Crítica detectada por IA',
        tipo_violencia || 'critico',
        'alto',
        ticket || `ALRT-${Date.now().toString().slice(-6)}`
      ]);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Reporte del Motor de Riesgo procesado correctamente',
      reportId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error al procesar reporte de chatbot:', error);
    res.status(500).json({ success: false, message: 'Error al guardar el reporte' });
  }
});

// @route   POST /api/chatbot/meeting
// @desc    Agenda una reunión desde el chatbot
router.post('/meeting', async (req, res) => {
  const { estudianteId, nombre, fecha_reunion, motivo } = req.body;

  try {
    await pool.execute(`
      INSERT INTO chatbot_reuniones (estudiante_id, nombre, fecha_reunion, motivo) 
      VALUES (?, ?, ?, ?)
    `, [
      estudianteId || 'anonimo',
      nombre || 'Anónimo',
      fecha_reunion,
      motivo || 'Cita agendada por chatbot'
    ]);

    res.status(201).json({ success: true, message: 'Reunión agendada' });
  } catch (error) {
    console.error('❌ Error al agendar reunión:', error);
    res.status(500).json({ success: false, message: 'Error al agendar la cita' });
  }
});

module.exports = router;
