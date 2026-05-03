const { LexRuntimeV2Client } = require("@aws-sdk/client-lex-runtime-v2");
const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");
const { SNSClient } = require("@aws-sdk/client-sns");
const { SESClient } = require("@aws-sdk/client-ses");
require('dotenv').config();

/**
 * CONFIGURACIÓN CENTRALIZADA DE AWS (v1.0)
 * Centraliza las instancias de los clientes para optimizar memoria y configuración.
 */

const region = process.env.AWS_REGION || "us-east-1";

// Hardening: Configuramos el cliente base. 
// Solo inyectamos credenciales manuales si existen en el entorno (ej. Desarrollo Local).
// En producción (App Runner/ECS), esto permite que el SDK asuma el IAM Role nativo de forma segura.
const clientConfig = { region };

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

// Cliente para Amazon Lex V2 (Chatbot)
const lexClient = new LexRuntimeV2Client(clientConfig);

// Cliente para Amazon Bedrock (IA Central - Claude)
const bedrockClient = new BedrockRuntimeClient(clientConfig);

// Cliente para Amazon SNS (Alertas SMS)
const snsClient = new SNSClient(clientConfig);

// Cliente para Amazon SES (Alertas Email)
const sesClient = new SESClient(clientConfig);

console.log('🛡️ Configuración centralizada de AWS Versa cargada correctamente.');

module.exports = {
  lexClient,
  bedrockClient,
  snsClient,
  sesClient,
  region
};
