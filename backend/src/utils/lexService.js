const { LexRuntimeV2Client, RecognizeTextCommand } = require("@aws-sdk/client-lex-runtime-v2");
require('dotenv').config();

let lexClient = null;

function getLexClient() {
  if (!lexClient) {
    lexClient = new LexRuntimeV2Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    });
  }
  return lexClient;
}

/**
 * Amazon Lex V2 - Enviar mensaje al bot PrediVersa_RiskBot_V1
 */
async function sendToLex(userId, text, sessionState = {}) {
  const client = getLexClient();
  try {
    const params = {
      botId: process.env.LEX_BOT_ID || 'DERGWSU1C8',
      // Alias de Producción: PrediVersaAlias (Versión 1) ID: XVK50SN8KY
      botAliasId: process.env.LEX_BOT_ALIAS_ID || 'XVK50SN8KY',
      // ⚠️ Lex V2: locale es_419 = Spanish (Latin American) — NO usar es_US ni es-US
      localeId: process.env.LEX_LOCALE_ID || 'es_419',
      // Lex V2 sessionId pattern: [a-zA-Z0-9._-]+ 
      sessionId: String(userId).replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100), 
      text: text,
      sessionState: sessionState
    };

    console.log(`🤖 Enviando a Lex -> Bot: ${params.botId}, Alias: ${params.botAliasId}, User: ${params.sessionId}`);

    const command = new RecognizeTextCommand(params);
    const response = await client.send(command);

    return {
      messages: response.messages || [],
      sessionState: response.sessionState,
      intent: response.sessionState?.intent?.name || 'Unknown',
      interpretation: response.interpretations?.[0]
    };

  } catch (error) {
    console.error('❌ Error comunicando con Amazon Lex:', {
      mensaje: error.message,
      codigo: error.name || error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });
    throw error;
  }
}

module.exports = { sendToLex };
