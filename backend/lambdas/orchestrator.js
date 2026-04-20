const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { v4: uuidv4 } = require('uuid');

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const ddbDoc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
const evb = new EventBridgeClient({ region: "us-east-1" });

exports.handler = async (event) => {
    const body = JSON.parse(event.body || "{}");
    const { message, sessionId = "guest" } = body;

    // 1. Recuperar Memoria Corta (DynamoDB)
    const session = await ddbDoc.send(new GetCommand({
        TableName: "PrediVersa-Sessions",
        Key: { sessionId }
    }));
    const history = session.Item?.history || [];

    // 2. Análisis de Riesgo Rápido (Simplificado para Lambda)
    const isCritical = /muerte|suicidio|matar|morir/i.test(message);
    if (isCritical) {
      await evb.send(new PutEventsCommand({
        Entries: [{
          Source: 'prediversa.chatbot',
          DetailType: 'RiskAnalysisResult',
          Detail: JSON.stringify({ message, risk_level: 'CRITICAL', user_id: sessionId }),
          EventBusName: 'PrediVersa-Events'
        }]
      }));
    }

    // 2. Invocación a Bedrock (Claude 3.5 Haiku - Deep Analysis Mode)
    const systemPrompt = `Eres VERSA, una IA avanzada de PrediVersa para apoyo estudiantil. 
    TU RESPUESTA DEBE SER UN JSON ESTRICTO con esta estructura:
    {
      "internal_analysis": {
        "inferred_profile": { "gender": "unknown|male|female", "confidence": 0.0-1.0, "emotion": "string", "intent": "string" },
        "risk_analysis": { "level": "LOW|MEDIUM|HIGH|CRITICAL", "confidence": 0.0-1.0, "signals": [] },
        "response_strategy": { "tone": "empathetic|neutral|urgent", "requires_alert": boolean }
      },
      "final_response": "Tu respuesta empática para el estudiante aquí"
    }
    REGLA: Usa lenguaje neutro si la confianza en el género es < 0.8. No afirmes el género como verdad.`;

    const userMessages = history.concat([{ role: "user", content: [{ text: message }] }]);

    const bedrockRes = await bedrock.send(new ConverseCommand({
        modelId: "anthropic.claude-3-5-haiku-20241022-v1:0",
        messages: userMessages,
        system: [{ text: systemPrompt }],
        inferenceConfig: { maxTokens: 1000, temperature: 0.5 }
    }));

    const rawOutput = bedrockRes.output.message.content[0].text;
    const analysis = JSON.parse(rawOutput.replace(/```json|```/g, '').trim());

    // 3. Gestión de Alertas Desacopladas (EventBridge)
    if (analysis.internal_analysis.response_strategy.requires_alert || analysis.internal_analysis.risk_analysis.level !== 'LOW') {
      await evb.send(new PutEventsCommand({
        Entries: [{
          Source: 'prediversa.chatbot',
          DetailType: 'RiskAnalysisResult',
          Detail: JSON.stringify({ 
            event_id: uuidv4(),
            message, 
            risk_level: analysis.internal_analysis.risk_analysis.level,
            confidence: analysis.internal_analysis.risk_analysis.confidence,
            user_id: sessionId 
          }),
          EventBusName: 'PrediVersa-Events'
        }]
      }));
    }

    const responseText = analysis.final_response;

    // 4. Actualizar Memoria Corta
    const newHistory = userMessages.concat([{ role: "assistant", content: [{ text: responseText }] }]).slice(-10);
    await ddbDoc.send(new PutCommand({
        TableName: "PrediVersa-Sessions",
        Item: { sessionId, history: newHistory, updatedAt: new Date().toISOString() }
    }));

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ reply: responseText, riskDetected: isCritical })
    };
};
