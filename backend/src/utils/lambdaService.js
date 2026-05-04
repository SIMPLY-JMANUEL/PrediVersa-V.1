const { InvokeCommand } = require("@aws-sdk/client-lambda");
const { lambdaClient: client } = require("./awsConfig");
const { analyzeText: localAnalyzeText } = require("./motorVersa");

/**
 * Invoca el Motor Versa 2.0 en AWS Lambda
 * Si falla, retorna al análisis local para asegurar que el sistema siga funcionando.
 */
async function invokeMotorVersaLambda(params) {
  // Flag para usar Lambda (puedes desactivarlo en .env)
  const useLambda = process.env.USE_LAMBDA_MOTOR === 'true';

  if (!useLambda) {
    console.log('ℹ️ Usando Motor Versa LOCAL (Lambda desactivado en .env)');
    return localAnalyzeText(params.texto, params.tipoViolencia, params.frecuencia, params.historial);
  }

  const functionName = process.env.LAMBDA_MOTOR_VERSA_NAME || "MotorVersaEngine";
  
  try {
    console.log(`🚀 Invocando Motor Versa en Lambda: ${functionName}`);
    
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify({
        texto: params.texto,
        tipoViolencia: params.tipoViolencia,
        frecuencia: params.frecuencia,
        historial: params.historial
      }),
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    // Si la Lambda retorna el formato de API Gateway responde con body
    if (result.body) {
      return JSON.parse(result.body);
    }
    
    return result;
  } catch (error) {
    console.error('⚠️ Falló la invocación de Lambda Motor Versa. Usando FALLBACK local:', error.message);
    // Fallback de seguridad para no romper la experiencia del estudiante
    return localAnalyzeText(params.texto, params.tipoViolencia, params.frecuencia, params.historial);
  }
}

module.exports = { invokeMotorVersaLambda };
