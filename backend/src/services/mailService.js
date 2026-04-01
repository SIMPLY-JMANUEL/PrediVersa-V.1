const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
require('dotenv').config();

const sesClient = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });
const SOURCE_EMAIL = process.env.EMAIL_SOURCE || "noreply@prediversa.edu.co";
const ADMIN_EMAILS = (process.env.ADMIN_NOTIFY_EMAILS || "").split(",").filter(e => e);

/**
 * Servicio de mensajería para PrediVersa
 * Encapsula la lógica de envío de correos vía AWS SES
 */
class MailService {
  /**
   * Envía un correo de recuperación de contraseña
   */
  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const params = {
      Source: SOURCE_EMAIL,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "🔑 Recuperación de Contraseña - PrediVersa" },
        Body: {
          Html: {
            Data: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #60a5fa; margin: 0; font-size: 24px;">PrediVersa</h1>
                </div>
                <div style="padding: 40px 30px; background-color: white;">
                  <h2 style="color: #1e293b; margin-top: 0;">Hola, ${name}</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en PrediVersa. Si no realizaste esta solicitud, puedes ignorar este correo con seguridad.
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                    Para establecer una nueva contraseña, haz clic en el siguiente botón:
                  </p>
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);">
                      Restablecer Contraseña
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    Este enlace expirará en 30 minutos por motivos de seguridad.
                  </p>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <small style="color: #94a3b8;">© 2026 PrediVersa | Sistema de Inteligencia Predictiva Escolar</small>
                </div>
              </div>
            `
          }
        }
      }
    };

    try {
      await sesClient.send(new SendEmailCommand(params));
      return true;
    } catch (error) {
      console.error("❌ Fallo al enviar email de recuperación:", error);
      return false;
    }
  }

  /**
   * Notifica a los administradores sobre una nueva solicitud de registro
   */
  async notifyAdminNewRequest(requestData) {
    if (ADMIN_EMAILS.length === 0) return false;

    const params = {
      Source: SOURCE_EMAIL,
      Destination: { ToAddresses: ADMIN_EMAILS },
      Message: {
        Subject: { Data: "🆕 Nueva Solicitud de Acceso - PrediVersa" },
        Body: {
          Html: {
            Data: `
              <div style="font-family: sans-serif; color: #333; padding: 20px;">
                <h2>Nueva solicitud de registro pendiente</h2>
                <p>Un nuevo usuario ha solicitado acceso a la plataforma:</p>
                <ul>
                  <li><strong>Nombre:</strong> ${requestData.name}</li>
                  <li><strong>Email:</strong> ${requestData.email}</li>
                  <li><strong>Teléfono:</strong> ${requestData.phone || 'N/A'}</li>
                  <li><strong>Rol solicitado:</strong> ${requestData.role}</li>
                </ul>
                <p>Por favor, ingresa al panel administrativo para aprobar o rechazar esta solicitud.</p>
              </div>
            `
          }
        }
      }
    };

    try {
      await sesClient.send(new SendEmailCommand(params));
      return true;
    } catch (error) {
      console.error("❌ Fallo al notificar admins:", error);
      return false;
    }
  }

  /**
   * Notifica al usuario que su cuenta ha sido aprobada
   */
  async sendApprovalEmail(email, name) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
    const params = {
      Source: SOURCE_EMAIL,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "⭐ Cuenta Aprobada - Bienvenido a PrediVersa" },
        Body: {
          Html: {
            Data: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
                <h2 style="color: #10b981;">¡Tu cuenta ha sido activada!</h2>
                <p>Hola ${name}, te informamos que tu solicitud de acceso a PrediVersa ha sido aprobada por un administrador.</p>
                <p>Ya puedes iniciar sesión en la plataforma con tus credenciales.</p>
                <div style="margin: 30px 0;">
                  <a href="${loginUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Ir al Login
                  </a>
                </div>
              </div>
            `
          }
        }
      }
    };

    try {
      await sesClient.send(new SendEmailCommand(params));
      return true;
    } catch (error) {
      console.error("❌ Fallo al enviar email de aprobación:", error);
      return false;
    }
  }
}

module.exports = new MailService();
