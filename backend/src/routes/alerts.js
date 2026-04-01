const express = require('express');
const jwt = require('jsonwebtoken');
const { analyzeText } = require('../utils/motorVersa');
const {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertStats,
  createCaseAction,
  getActionsByAlertId
} = require('../db/users');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { notificarAdmins } = require('../utils/notificaciones');
const { invokeMotorVersaLambda } = require('../utils/lambdaService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_123';

/**
 * @route GET /api/alerts
 * @desc Obtener todas las alertas del sistema (Dashboard Admin/Colab)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const alerts = await getAllAlerts();
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('❌ Error al obtener alertas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

/**
 * @route GET /api/alerts/stats
 * @desc Estadísticas de alertas por tipo y estado
 */
router.get('/stats', verifyToken, authorizeRoles('Administrador', 'Colaboradores', 'Colaborador'), async (req, res) => { // FIX AL-5
  try {
    const stats = await getAlertStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de alertas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

/**
 * @route POST /api/alerts
 * @desc Crear alerta manual desde el Dashboard
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const alertData = req.body;
    
    // Identificar creador desde el objeto req.user adjunto por el middleware
    alertData.createdBy = req.user.id;

    if (!alertData.ticketNumber) {
      alertData.ticketNumber = `TKT-${Date.now()}`;
    }

    const newAlert = await createAlert(alertData);
    res.status(201).json({ success: true, message: 'Alerta creada', alert: newAlert });
  } catch (error) {
    console.error('❌ Error al crear alerta:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

/**
 * @route POST /api/alerts/analyze
 * @desc Endpoint unificado para analizar mensajes (Webhook Botpress)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { studentName, studentUsername, mensaje, tipoViolencia, nivel = 'bajo', esUrgente = false } = req.body;

    if (!studentName) {
      return res.status(400).json({ success: false, message: 'studentName es requerido' });
    }

    const analisis = await invokeMotorVersaLambda({
      texto: mensaje || '',
      tipoViolencia: tipoViolencia || '',
      frecuencia: '',
      historial: []
    });

    const alertTypeMap = { 'bajo': 'Informativa', 'medio': 'Advertencia', 'alto': 'Critica' };
    const finalAlertType = analisis.es_emergencia ? 'Critica' : alertTypeMap[analisis.nivel_riesgo];
    const emoji = analisis.nivel_riesgo === 'alto' ? '🔴' : (analisis.nivel_riesgo === 'medio' ? '🟠' : '🟢');

    const now = new Date();
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

    const newAlert = await createAlert({
      studentName,
      studentUsername,
      alertType: finalAlertType,
      description,
      ticketNumber,
      alertDate: now.toISOString().split('T')[0],
      alertTime: now.toTimeString().slice(0, 5),
      status: (analisis.nivel_riesgo === 'alto' || esUrgente) ? 'Urgente' : 'Pendiente'
    });

    res.status(201).json({ success: true, alert: newAlert, score: analisis.score });
  } catch (error) {
    console.error('❌ Error en analyze:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

/**
 * @route POST /api/alerts/actions
 * @desc Registrar seguimiento (Actuaciones/Remisiones)
 */
router.post('/actions', verifyToken, async (req, res) => {
  try {
    const actionData = req.body;
    console.log('📝 Registrando acción profesional:', actionData.category);
    const actionId = await createCaseAction(actionData);

    // Triangulación: Notificar al Administrador de que el colaborador ha intervenido.
    try {
      const alertData = await getAlertById(actionData.alertId);
      if (alertData) {
        notificarAdmins({
          tipo: 'colaborador_accion',
          nivel: 'medio',
          prioridad: 'MEDIA',
          nombre: alertData.studentName,
          ticket: alertData.ticketNumber,
          descripcion: `Colaborador ${actionData.responsibleName || 'N/A'} registró actividad: ${actionData.actionType}.`,
          timestamp: new Date().toISOString()
        });
      }
    } catch(e) { console.error('Error enviando notificación SSE al admin:', e); }

    res.status(201).json({ success: true, message: 'Seguimiento registrado con éxito', actionId });
  } catch (error) {
    console.error('❌ Error detallado al registrar seguimiento:', error.message);
    res.status(500).json({ success: false, message: 'Error al registrar seguimiento', details: error.message });
  }
});

/**
 * @route GET /api/alerts/:id/actions
 * @desc Historial de seguimiento de un caso
 */
router.get('/:id/actions', async (req, res) => {
  try {
    const actions = await getActionsByAlertId(req.params.id);
    res.json({ success: true, actions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener historial' });
  }
});

/**
 * @route PUT /api/alerts/:id
 * @desc Actualizar una alerta (Asignación, Estado, etc.)
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedAlert = await updateAlert(id, body);
    
    if (!updatedAlert) {
      return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    }
    
    res.json({ success: true, message: 'Alerta actualizada', alert: updatedAlert });
  } catch (error) {
    console.error('❌ Error al actualizar alerta:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar alerta' });
  }
});

module.exports = router;
