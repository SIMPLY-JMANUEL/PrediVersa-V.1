const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { region } = require("./awsConfig");
const { v4: uuidv4 } = require('uuid');

const client = new EventBridgeClient({ region });

/**
 * SERVICIO DE EVENTOS PREDIVERSA
 * Encargado de desacoplar el chatbot de los efectos secundarios (Alertas, Logs, Analytics).
 */
class EventBridgeService {
  /**
   * Publica un evento de riesgo detectado en la plataforma.
   */
  async emitRiskEvent(riskData) {
    const event = {
      Entries: [
        {
          Source: 'prediversa.chatbot',
          DetailType: 'RiskAnalysisResult',
          Detail: JSON.stringify({
            event_id: uuidv4(),
            timestamp: new Date().toISOString(),
            ...riskData
          }),
          EventBusName: 'PrediVersa-Events' // Debe ser configurado en AWS Console/Terraform
        }
      ]
    };

    try {
      const command = new PutEventsCommand(event);
      const response = await client.send(command);
      console.log('📡 Evento de riesgo emitido a EventBridge:', response.Entries[0].EventId);
      return response;
    } catch (error) {
      console.error('❌ Error emitiendo evento a EventBridge:', error.message);
      // No lanzamos el error para no bloquear la conversación del usuario
      return null;
    }
  }
}

module.exports = new EventBridgeService();
