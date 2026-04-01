require('dotenv').config();
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });

(async () => {
    const correosAdministrativos = [
        "ha.l@lanuevaamerica.edu.co",
        "h.salcedob@lanuevaamerica.edu.co",
        "jm.calvou@lanuevaamerica.edu.co"
    ];
    
    try {
        const emailParams = {
            Source: "ha.l@lanuevaamerica.edu.co", 
            Destination: { ToAddresses: correosAdministrativos }, 
            Message: {
                Subject: { Data: `🚨 IMPORTANTE: Alerta de Riesgo Alto - Ticket PRUEBA-555` },
                Body: {
                    Html: { Data: `
                        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ff4d4f; border-radius: 8px;">
                        <h2 style="color: #ff4d4f; margin-top: 0;">🚨 ALERTA DE SEGURIDAD ESCOLAR - RIESGO ALTO</h2>
                        <p>El Motor de Inteligencia Artificial (Versa) acaba de detectar una situación crítica en el chat.</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>🔖 Ticket:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">PRUEBA-555</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Estudiante:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">Simulador de Prueba</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>💬 Mensaje detectado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; background: #fff0f0;">"Esta es una prueba de fuego para validar el sistema de Email de PrediVersa."</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>⚠️ Nivel de Riesgo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd; color: #e11d48; font-weight: bold;">ALTO</td></tr>
                        </table>
                        <p style="margin-top: 20px;">Por favor, ingresa inmediatamente al Panel de Estudiante > <strong>Dashboard Administrativo</strong> para tomar acción.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
                        <small style="color: #666;">Este es un mensaje automático generado de forma confidencial por PrediVersa.</small>
                        </div>
                    ` }
                }
            }
        };

        await sesClient.send(new SendEmailCommand(emailParams));
        console.log('✅ Correo de prueba disparado con éxito a los 3 administradores.');
    } catch (error) {
        console.error('⚠️ Falló el envío. ¿Ya aceptaron el link de confirmación?:', error.message);
    }
})();
