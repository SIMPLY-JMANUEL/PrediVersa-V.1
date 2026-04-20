const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const snsClient = new SNSClient({});
const sesClient = new SESClient({});

/**
 * LAMBDA ALERT HANDLER
 * Se activa por la cola SQS (EventBridge -> SQS -> Lambda)
 */
exports.handler = async (event) => {
  console.log('📨 Procesando lote de alertas:', event.Records.length);

  for (const record of event.Records) {
    try {
      const riskEvent = JSON.parse(record.body).detail;
      console.log(`🔍 Analizando Evento ${riskEvent.event_id} - Nivel: ${riskEvent.risk_level}`);

      // Solo disparamos notificaciones externas para casos graves
      if (riskEvent.risk_level === 'CRITICAL' || riskEvent.risk_level === 'HIGH') {
        await dispatchNotifications(riskEvent);
      }
      
      // Aquí podrías agregar lógica de persistencia adicional en RDS si fuera necesario
      
    } catch (error) {
      console.error('❌ Error procesando registro de alerta:', error.message);
      // Lanzamos error para que SQS reintente (Retry Policy automática)
      throw error;
    }
  }
};

async function dispatchNotifications(data) {
  const message = `🚨 ALERTA PREDIVERSA (${data.risk_level})\nEstudiante: ${data.user_id}\nMensaje: ${data.message}\nConfianza: ${data.confidence}`;

  // 1. Envío de SMS via SNS (Multi-número)
  try {
    const adminPhones = (process.env.ADMIN_PHONES || "").split(',').filter(p => p.trim() !== "");
    for (const phone of adminPhones) {
      await snsClient.send(new PublishCommand({
        PhoneNumber: phone.trim().startsWith('+') ? phone.trim() : `+57${phone.trim()}`,
        Message: message
      }));
      console.log(`✅ SMS enviado a: ${phone}`);
    }
  } catch (e) { console.error('Falló SNS:', e.message); }

  // 2. Envío de Email via SES (Multi-email)
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').filter(e => e.trim() !== "");
    const emailSource = process.env.SES_SOURCE_EMAIL;

    if (emailSource && adminEmails.length > 0) {
      for (const email of adminEmails) {
        await sesClient.send(new SendEmailCommand({
          Source: emailSource,
          Destination: { ToAddresses: [email.trim()] },
          Message: {
            Subject: { Data: `🚨 ALERTA CRÍTICA: ${data.risk_level}` },
            Body: { Text: { Data: message } }
          }
        }));
        console.log(`✅ Email enviado a: ${email}`);
      }
    }
  } catch (e) { console.error('Falló SES:', e.message); }
}
