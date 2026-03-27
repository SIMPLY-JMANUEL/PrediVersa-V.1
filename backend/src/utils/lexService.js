const { LexRuntimeV2Client, RecognizeTextCommand } = require("@aws-sdk/client-lex-runtime-v2");
require('dotenv').config();

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
};

const lexClient = new LexRuntimeV2Client(config);

/**
 * Amazon Lex V2 - Enviar mensaje al bot PrediVersa_RiskBot_V1
 */
async function sendToLex(userId, text, sessionState = {}) {
  try {
    const params = {
      botId: process.env.LEX_BOT_ID || 'DERGWSU1C8',
      botAliasId: process.env.LEX_BOT_ALIAS_ID || 'XVK50SN8KY',
      localeId: process.env.LEX_LOCALE_ID || 'es_US',
      sessionId: String(userId).substring(0, 100), 
      text: text,
      sessionState: sessionState
    };

    console.log(`🤖 Enviando a Lex -> Bot: ${params.botId}, Alias: ${params.botAliasId}, User: ${params.sessionId}`);

    const command = new RecognizeTextCommand(params);
    const response = await lexClient.send(command);

    return {
      messages: response.messages || [],
      sessionState: response.sessionState,
      intent: response.sessionState?.intent?.name || 'Unknown',
      interpretation: response.interpretations?.[0]
    };

  } catch (error) {
    console.error('❌ Error comunicando con Amazon Lex:', error.message);
    throw error;
  }
}

module.exports = { sendToLex };
