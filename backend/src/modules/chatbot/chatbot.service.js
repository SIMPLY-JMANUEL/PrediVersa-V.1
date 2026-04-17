const chatbotRepository = require('./chatbot.repository');
const centralAI = require('../../utils/centralAIService');
const { sendToLex } = require('../../utils/lexService');
const { PublishCommand } = require("@aws-sdk/client-sns");
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { snsClient, sesClient } = require('../../utils/awsConfig');
const { adminClients, notificarAdmins } = require('../../utils/notificaciones');
const alertRepository = require('../alerts/alerts.repository');
const logger = require('../../utils/logger');

/**
 * CAPA DE SERVICIO (BUSINESS LOGIC) - DOMINIO CHATBOT
 */

const processMessage = async (text, user, sessionId, historial = []) => {
  // 1. Análisis de Contexto VERSA v3 (Riesgo + Género + Emoción)
  let context = { 
    riesgo: { nivel: 'BAJO', score: 0 }, 
    identidad: { genero: 'indeterminado', confianza: 0 }, 
    emocion: { clase: 'neutro', intensidad: 0 } 
  };

  try {
    context = await centralAI.analizarContextoTotalV3(text);
  } catch (e) { 
    console.error('⚠️ Error en sensor VERSA v3:', e.message);
    if (text.toLowerCase().includes('morir')) context.riesgo.nivel = 'ALTO';
  }

  // 2. Generación de Respuesta Empatizada v3
  let finalResponse = "He recibido tu mensaje.";
  try {
    // Sincronización Lex (Opcional, se mantiene por compatibilidad)
    await sendToLex(user.id || sessionId || 'anonimo', text).catch(() => {});
    
    const respuestaV3 = await centralAI.generarRespuestaV3({
      mensaje: text,
      contexto: context
    });
    if (respuestaV3) finalResponse = respuestaV3;
  } catch (error) { console.error('❌ Error en Generador v3:', error.message); }

  // 🧼 Post-procesamiento de seguridad ALTO RIESGO
  if (context.riesgo.nivel === "ALTO") {
    const lowerRes = finalResponse.toLowerCase();
    if (!lowerRes.includes("no estás solo")) {
      finalResponse += "\n\nNo estás solo, parce. Sería bueno hablar con alguien de confianza para no cargar con esto solo.";
    }
  }

  // 3. Persistencia de Interacción v3
  await chatbotRepository.saveInteraction({
    sessionId: user.id || sessionId || 'anonimo',
    userInput: text,
    response: finalResponse,
    risk: context.riesgo.nivel,
    riskScore: context.riesgo.score,
    metadata: {
      emotion: context.emocion.clase,
      gender: context.identidad.genero,
      engine: context.meta?.engine || 'V3_HYBRID'
    }
  });

  // 4. Gestión de Alerta y Escalamiento Enterprise v3.1 (Multicanal)
  await dispatchAlertEnterprise(text, user, context, sessionId || 'system-trace');

  return { 
    finalResponse, 
    riskResult: {
      nivel_riesgo: context.riesgo.nivel,
      score: context.riesgo.score,
      alerta: context.alerta?.activar || false,
      tipo_alerta: context.alerta?.tipo || 'N/A',
      urgencia: context.alerta?.urgencia || 'BAJA',
      razon: context.alerta?.justificacion || 'Analizado por VERSA v3.1 Titanium'
    },
    metadata: {
      emotion: context.emocion.clase,
      gender: context.identidad.genero,
      confidence: context.auditoria?.decision_confianza || 0,
      engine: 'VERSA_v3.1_TITANIUM'
    }
  };
};

/**
 * 🔴 MOTOR DE DECISIÓN HARDENING (ANTI-FALLO LLM)
 * Reglas determinísticas para asegurar la protección del menor.
 */
const shouldTriggerAlert = (context) => {
  if (!context) return false;
  
  // Regla 1: Explícito del modelo 🤖
  if (context.alerta?.activar) return true;
  
  // Regla 2: Fallback defensivo crítico (Riesgo ALTO siempre alerta) 🆘
  if (context.riesgo?.nivel === "ALTO") return true;
  
  // Regla 3: Score de riesgo extremo 📈
  if (context.riesgo?.score >= 85) return true;
  
  return false;
};

/**
 * 🛰️ MOTOR DE PRIORIDAD MULTICANAL
 */
const resolveChannels = (context) => {
  const urgency = context.alerta?.urgencia;
  if (urgency === "INMEDIATA") return ["PLATFORM", "SMS", "EMAIL"];
  if (urgency === "ALTA") return ["PLATFORM", "EMAIL"];
  if (urgency === "MEDIA") return ["PLATFORM"];
  return [];
};

/**
 * 📡 DISPATCH ENTERPRISE (CON TRAZABILIDAD)
 */
const dispatchAlertEnterprise = async (text, user, context, requestId) => {
  if (!shouldTriggerAlert(context)) return;

  const payload = {
    requestId,
    studentName: user.name || 'Estudiante Lex',
    studentEmail: user.email || 'N/A',
    riskLevel: context.riesgo.nivel,
    alertType: context.alerta?.tipo || 'EMOCIONAL',
    urgency: context.alerta?.urgencia || 'MEDIA',
    message: context.alerta?.justificacion || 'Detección automática de riesgo.',
    evidence: context.alerta?.evidencia || [text],
    timestamp: new Date().toISOString()
  };

  const channels = resolveChannels(context);

  // 1. Audit Log (CloudWatch Ready) 🕵️‍♂️📈
  logger.warn({ event: "CRITICAL_ALERT_TRIGGERED", requestId, payload });

  // 2. Multicast en Paralelo 🏎️💨
  const dispatchPromises = [
    // Persistencia en DB
    alertRepository.create({
      studentName: payload.studentName,
      studentUsername: payload.studentEmail,
      alertType: payload.alertType,
      description: `[VERSA v3.1] ${payload.message}\nEvidencia: ${payload.evidence.join(', ')}`,
      ticketNumber: `VERSA-${Date.now()}`,
      status: payload.urgency === 'INMEDIATA' ? 'Urgente' : 'Pendiente'
    }),
    
    // TIEMPO REAL: Platform/SSE
    channels.includes("PLATFORM") && notificarAdmins({
      tipo: 'alerta_versa',
      nivel: payload.riskLevel,
      estudiante: payload.studentName,
      mensaje: payload.message,
      urgencia: payload.urgency
    })
  ];

  // SMS: AWS SNS 📲
  if (channels.includes("SMS")) {
    const adminPhones = (process.env.ADMIN_PHONES || "").split(',').filter(p => p.trim() !== "");
    adminPhones.forEach(phone => {
      dispatchPromises.push(snsClient.send(new PublishCommand({
        Message: `🚨 [ALERTA CRÍTICA PREDIVERSA]\nTipo: ${payload.alertType}\nEstudiante: ${payload.studentName}\nUrgencia: ${payload.urgency}`,
        PhoneNumber: phone.trim(),
        MessageAttributes: { 'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' } }
      })));
    });
  }

  // EMAIL: AWS SES 📧
  if (channels.includes("EMAIL")) {
    const emailSource = process.env.SES_SOURCE_EMAIL;
    const emailDestinations = (process.env.ADMIN_EMAILS || "").split(',').filter(e => e.trim() !== "");

    if (emailSource && emailDestinations.length > 0) {
      const emailBody = `
        <h2>🚨 ALERTA CRÍTICA - PREDIVERSA v3.1</h2>
        <p><b>Estudiante:</b> ${payload.studentName}</p>
        <p><b>Nivel de Riesgo:</b> ${payload.riskLevel}</p>
        <p><b>Tipo de Alerta:</b> ${payload.alertType}</p>
        <p><b>Urgencia:</b> ${payload.urgency}</p>
        <hr/>
        <p><b>Detalle:</b> ${payload.message}</p>
        <p><b>Evidencia Detectada:</b> ${payload.evidence.join(", ")}</p>
        <br/>
        <p><i>Acción requerida: Intervención inmediata del equipo institucional.</i></p>
      `;
      
      dispatchPromises.push(sesClient.send(new SendEmailCommand({
        Source: emailSource,
        Destination: { ToAddresses: emailDestinations },
        Message: {
          Subject: { Data: `🚨 Alerta Crítica [${payload.alertType}] - ${payload.studentName}` },
          Body: { Html: { Data: emailBody } }
        }
      })));
    }
  }

  await Promise.allSettled(dispatchPromises);
};

const getStats = async () => {
  return await chatbotRepository.getStats();
};

module.exports = {
  processMessage,
  getStats
};
