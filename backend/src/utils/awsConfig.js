const { LexRuntimeV2Client } = require("@aws-sdk/client-lex-runtime-v2");
const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");
const { SNSClient } = require("@aws-sdk/client-sns");
const { SESClient } = require("@aws-sdk/client-ses");
const { LambdaClient } = require("@aws-sdk/client-lambda");
const { EventBridgeClient } = require("@aws-sdk/client-eventbridge");
require('dotenv').config();

/**
 * CONFIGURACIÓN CENTRALIZADA DE AWS (v1.1)
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

// Clientes AWS
const lexClient = new LexRuntimeV2Client(clientConfig);
const bedrockClient = new BedrockRuntimeClient(clientConfig);
const snsClient = new SNSClient(clientConfig);
const sesClient = new SESClient(clientConfig);
const lambdaClient = new LambdaClient(clientConfig);
const eventBridgeClient = new EventBridgeClient(clientConfig);

console.log('🛡️ Configuración centralizada de AWS Versa (v1.1) cargada correctamente.');

module.exports = {
  lexClient,
  bedrockClient,
  snsClient,
  sesClient,
  lambdaClient,
  eventBridgeClient,
  region
};
