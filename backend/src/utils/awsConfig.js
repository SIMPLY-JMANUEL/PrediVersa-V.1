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
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};

// Cliente para Amazon Lex V2 (Chatbot)
const lexClient = new LexRuntimeV2Client({ region, credentials });

// Cliente para Amazon Bedrock (IA Central - Claude)
const bedrockClient = new BedrockRuntimeClient({ region, credentials });

// Cliente para Amazon SNS (Alertas SMS)
const snsClient = new SNSClient({ region, credentials });

// Cliente para Amazon SES (Alertas Email)
const sesClient = new SESClient({ region, credentials });

console.log('🛡️ Configuración centralizada de AWS Versa cargada correctamente.');

module.exports = {
  lexClient,
  bedrockClient,
  snsClient,
  sesClient,
  region
};
