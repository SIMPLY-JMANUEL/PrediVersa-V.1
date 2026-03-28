const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config();

const WEIGHTS = {
  "suicidio": 10, "matarme": 10, "no quiero vivir": 10, "morirme": 10, "muerte": 10,
  "me pegan": 8, "me violan": 10, "acoso": 7, "bullying": 6, "amenaza": 7,
  "solo": 3, "triste": 4, "ansiedad": 5, "llorar": 3, "paila": 3, "insulto": 4
};

/**
 * SERVICIO CENTRAL DE IA (BEDROCK EDITION)
 * Migrado de Gemini a Amazon Bedrock (Claude 3 Sonnet) para alta disponibilidad.
 */
class CentralAIService {
  constructor() {
    this.client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
    this.modelId = "us.anthropic.claude-3-5-haiku-20241022-v1:0"; // Claude 3.5 Haiku (US Profile)
    this.initialized = true;
  }

  /**
   * 🧼 PRE-PROCESAMIENTO: Normaliza input
   */
  preprocess(text) {
    if (!text) return "";
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * 🧠 RISK INDEX ENGINE v2: Scoring avanzado y tendencia temporal
   */
  async computeAdvancedRiskScore(text, history = []) {
    let score = 0;
    const cleanText = this.preprocess(text);

    for (const [word, weight] of Object.entries(WEIGHTS)) {
      if (cleanText.includes(word)) score += weight;
    }

    if (cleanText.includes("muy") || cleanText.includes("demasiado") || cleanText.includes("bastante")) {
      score += 2;
    }

    if (history.length > 0) {
      if (history.some(h => cleanText.includes(h.text?.toLowerCase() || ""))) score += 3;
      if (history.length >= 3) score += 2;
    }

    return Math.min(score, 100);
  }

  /**
   * Analiza un mensaje para detectar niveles de riesgo de forma anónima.
   */
  async analizarRiesgo(datosAnonimos) {
    const { mensaje, historial = [] } = datosAnonimos;
    const cleanText = this.preprocess(mensaje);
    
    // 1. Scoring Engine Cuantificable
    const score = await this.computeAdvancedRiskScore(cleanText, historial);
    let nivel_riesgo = "BAJO";
    if (score >= 15) nivel_riesgo = "ALTO";
    else if (score >= 7) nivel_riesgo = "MEDIO";

    // 2. Validación con Bedrock (Claude 3)
    const systemPrompt = `Eres un motor de detección de riesgos psicosociales. Analiza el mensaje del estudiante y devuelve un JSON estricto.`;
    const userPrompt = `
      MENSAJE: "${cleanText}"
      SCORING LOCAL: ${score}
      HISTORIAL: ${historial.length ? historial.map(h => h.text).join(' | ') : 'N/A'}

      RESPONDE SOLO CON ESTE JSON:
      {
        "nivel_riesgo": "BAJO" | "MEDIO" | "ALTO",
        "score": (0-100),
        "intencion_principal": "string",
        "emociones_detectadas": ["string"],
        "palabras_clave_criticas": ["string"],
        "razon": "string",
        "requiere_intervencion_humana": boolean
      }
    `;

    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [{ role: "user", content: [{ text: userPrompt }] }],
        system: [{ text: systemPrompt }],
        inferenceConfig: { maxTokens: 512, temperature: 0 }
      });

      const response = await this.client.send(command);
      const text = response.output.message.content[0].text;
      const aiResult = JSON.parse(text.replace(/```json|```/g, '').trim());

      // Fusión de riesgo
      if (nivel_riesgo === "ALTO" && aiResult.nivel_riesgo !== "ALTO") {
        aiResult.nivel_riesgo = "ALTO";
        aiResult.score = Math.max(score, aiResult.score);
      }

      return aiResult;
    } catch (error) {
      console.warn('⚠️ Bedrock falló, usando Risk Index local:', error.message);
      return {
        nivel_riesgo,
        score,
        razon: "Fallo de conexión API - Risk Index local activo",
        requiere_intervencion_humana: nivel_riesgo === 'ALTO'
      };
    }
  }

  /**
   * Genera respuestas empáticas (VERSA Persona).
   */
  async generarRespuesta(datos) {
    const { mensaje, nivelRiesgo, historial = [] } = datos;
    let chatHistory = historial.map(m => `${m.type === 'user' ? 'Estudiante' : 'Versa'}: ${m.text}`).join('\n');

    const systemPrompt = `
      Eres VERSA, orientador colombiano empático. Tu estilo es el de un "pana que sabe escuchar".
      Usa expresiones como "parce", "tranqui", "te entiendo". 
      REGLAS: Máximo 3-4 líneas, sin diagnósticos, fluidez total.
      RIESGO ACTUAL: ${nivelRiesgo.toUpperCase()}
      ${nivelRiesgo.toUpperCase() === 'ALTO' ? 'REGLA CRÍTICA: Asegura que el usuario sepa que no está solo.' : ''}
    `;

    const userPrompt = `
      HISTORIAL:
      ${chatHistory}
      
      ESTUDIANTE DICE: "${mensaje}"
      VERSA RESPONDE:
    `;

    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [{ role: "user", content: [{ text: userPrompt }] }],
        system: [{ text: systemPrompt }],
        inferenceConfig: { maxTokens: 300, temperature: 0.7 }
      });

      const response = await this.client.send(command);
      let finalResponse = response.output.message.content[0].text.trim();

      // Post-procesamiento de seguridad
      if (nivelRiesgo.toUpperCase() === "ALTO") {
        const lowerRes = finalResponse.toLowerCase();
        if (!lowerRes.includes("no estás solo") && !lowerRes.includes("hablar con alguien")) {
           finalResponse += "\n\nNo estás solo, parce. Sería bueno hablar con alguien de confianza (como un orientador) para no cargar con esto solo, ¿sí?";
        }
      }

      return finalResponse;
    } catch (error) {
      console.error('❌ Error Bedrock:', error.message);
      return null;
    }
  }
}

module.exports = new CentralAIService();
