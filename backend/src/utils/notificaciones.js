const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const logger = require("./logger");

const adminClients = new Set();

const snsClient = new SNSClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const sesClient = new SESClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * 📢 DISPARADOR OMNICANAL v5.0
 * Envía la alerta por SSE (Dashboard), SMS (Celulares) y Email.
 */
const notificarAdmins = async (evento) => {
  // 1. Notificación en Tiempo Real (Dashboard - SSE)
  enviarSSE(evento);

  // Filtro de Criticidad para canales externos (Evitar spam de informativas)
  const esPrioritario = 
    evento.nivel === 'alto' || 
    evento.tipo === 'Critica' || 
    evento.tipo === 'Advertencia' || 
    evento.esUrgente ||
    evento.tipo === 'colaborador_accion';

  if (esPrioritario) {
    console.log(`🚀 Iniciando despacho omnicanal para alerta: ${evento.ticket}`);
    
    // 2. Despacho SMS (AWS SNS)
    const telefonos = [process.env.NOTIF_PHONE_1, process.env.NOTIF_PHONE_2].filter(Boolean);
    for (const tel of telefonos) {
      enviarSMS(tel, `[PrediVersa] ALERTA: ${evento.nombre}. Ticket: ${evento.ticket}. Riesgo: ${evento.nivel || 'Detectado'}. Revise el dashboard.`);
    }

    // 3. Despacho Email (AWS SES)
    if (process.env.NOTIF_EMAILS) {
      enviarEmail(process.env.NOTIF_EMAILS, evento);
    }
  }
};

/* --- Helpers Internos --- */

const enviarSSE = (evento) => {
  if (adminClients.size === 0) return;
  const data = `data: ${JSON.stringify(evento)}\n\n`;
  adminClients.forEach((client) => {
    try { client.write(data); }
    catch (e) { adminClients.delete(client); }
  });
};

const enviarSMS = async (telefono, mensaje) => {
  try {
    const params = {
      Message: mensaje,
      PhoneNumber: telefono,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'PrediVersa' },
        'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' }
      }
    };
    await snsClient.send(new PublishCommand(params));
    console.log(`✅ SMS enviado a ${telefono}`);
  } catch (error) {
    logger.error(`❌ Error enviando SMS a ${telefono}: ${error.message}`);
  }
};

const enviarEmail = async (emailsStr, evento) => {
  try {
    const destinatarios = emailsStr.split(",").map(e => e.trim());
    const params = {
      Destination: { ToAddresses: destinatarios },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #dc2626;">🚨 Alerta de Seguridad PrediVersa</h2>
                <hr/>
                <p><strong>Estudiante:</strong> ${evento.nombre}</p>
                <p><strong>Ticket:</strong> ${evento.ticket}</p>
                <p><strong>Nivel de Riesgo:</strong> ${evento.nivel}</p>
                <p><strong>Descripción:</strong> ${evento.descripcion}</p>
                <p style="margin-top: 20px;">
                  <a href="https://prediversa.com/admin" style="background: #0c4a6e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al Dashboard</a>
                </p>
                <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 30px;">Este es un mensaje automático del sistema de protección PrediVersa.</p>
              </div>
            `
          }
        },
        Subject: { Charset: "UTF-8", Data: `[ALERTA] PrediVersa: ${evento.nombre} (${evento.nivel})` }
      },
      Source: "alertas@prediversa.com" // Debe estar verificado en AWS SES
    };
    await sesClient.send(new SendEmailCommand(params));
    console.log(`✅ Email enviado a ${destinatarios.length} destinatarios`);
  } catch (error) {
    logger.error(`❌ Error enviando Email: ${error.message}`);
  }
};

module.exports = { adminClients, notificarAdmins };
