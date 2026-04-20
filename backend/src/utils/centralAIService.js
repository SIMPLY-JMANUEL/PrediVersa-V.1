const { ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { bedrockClient, region } = require("./awsConfig");
require('dotenv').config();

const IMPACT_CATEGORIES = {
  CRITICO: ["suicidio", "matarme", "no quiero vivir", "morirme", "muerte", "violan", "abuso", "quitarme la vida", "ahorcarme"],
  MODERADO: ["acoso", "bullying", "pegan", "amenaza", "golpe", "insulto", "maltrato"],
  EMOCIONAL: ["solo", "triste", "ansiedad", "llorar", "paila", "desespero", "vacio"]
};

/**
 * SERVICIO CENTRAL DE IA (BEDROCK EDITION)
 * Migrado de Gemini a Amazon Bedrock (Claude 3 Sonnet) para alta disponibilidad.
 */
class CentralAIService {
  constructor() {
    this.client = bedrockClient; // Usando cliente centralizado Versa v2.6
    this.modelId = "us.anthropic.claude-3-5-haiku-20241022-v1:0"; 
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
   * 🧠 CATEGORIZACIÓN DIRECTA: Identifica el nivel base por palabras clave
   */
  async categorizeMessage(text) {
    const cleanText = this.preprocess(text);
    const result = { nivel: "BAJO", detectadas: [] };

    // 1. Prioridad Máxima: Crítico
    for (const word of IMPACT_CATEGORIES.CRITICO) {
      if (cleanText.includes(word)) {
        result.nivel = "ALTO";
        result.detectadas.push(word);
      }
    }
    if (result.nivel === "ALTO") return result;

    // 2. Prioridad Media: Moderado
    for (const word of IMPACT_CATEGORIES.MODERADO) {
      if (cleanText.includes(word)) {
        result.nivel = "MEDIO";
        result.detectadas.push(word);
      }
    }
    if (result.nivel === "MEDIO") return result;

    // 3. Prioridad Baja: Emocional
    for (const word of IMPACT_CATEGORIES.EMOCIONAL) {
      if (cleanText.includes(word)) {
        result.detectadas.push(word);
      }
    }

    return result;
  }

  /**
   * 🧠 MOTOR DE CONTEXTO TOTAL VERSA v3.1 (Arquetipo Titanium)
   * Analiza Riesgo, Emoción e Identidad en un solo flujo optimizado.
   */
  async analizarContextoTotalV3(datos) {
    const text = typeof datos === 'string' ? datos : datos.mensaje;
    
    // --- CAPA 1: FAST FILTER (Regex) ---
    const categoria = await this.categorizeMessage(text);
    
    // --- CAPA 2: SEMANTIC ANALYSIS (Bedrock) ---
    const systemPrompt = `Eres VERSA Engine. Analiza el mensaje para PrediVersa.
    Devuelve JSON: { "nivel": "BAJO"|"MEDIO"|"ALTO", "score": 0-100, "emocion": "string", "razon": "string" }`;
    
    let aiResult = { nivel: categoria.nivel, score: categoria.nivel === 'ALTO' ? 90 : 10, razon: 'Análisis base' };
    
    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [{ role: "user", content: [{ text: `Mensaje: "${text}"` }] }],
        system: [{ text: systemPrompt }],
        inferenceConfig: { maxTokens: 300, temperature: 0 }
      });
      const response = await this.client.send(command);
      aiResult = JSON.parse(response.output.message.content[0].text.replace(/```json|```/g, '').trim());
    } catch (e) { console.warn('⚠️ Fallback Capa 2:', e.message); }

    // --- CAPA 3: SCORING & EVENT BRIDGE ---
    const finalLevel = (categoria.nivel === 'ALTO' || aiResult.nivel === 'ALTO') ? 'ALTO' : aiResult.nivel;
    const finalScore = finalLevel === 'ALTO' ? Math.max(aiResult.score, 90) : aiResult.score;

    const context = {
      riesgo: { nivel: finalLevel, score: finalScore },
      emocion: { clase: aiResult.emocion || 'neutral' },
      alerta: { activar: finalLevel === 'ALTO', justificacion: aiResult.razon }
    };

    // 📡 DESACOPLAMIENTO: Emitir a EventBridge si riesgo es ALTO
    if (context.alerta.activar) {
      const eventBridge = require('./eventBridgeService');
      eventBridge.emitRiskEvent({
        message: text,
        risk_level: 'CRITICAL',
        confidence: finalScore / 100,
        source: 'versa-engine-v3.1'
      });
    }

    return context;
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
      ${nivelRiesgo.toUpperCase() === 'ALTO' ? 'REGLA CRÍTICA: Guía al usuario sutilmente pero con firmeza a buscar ayuda inmediata con un adulto de confianza o el orientador presencial del colegio al finalizar tu respuesta.' : ''}
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
           const emergencyTips = [
             "\n\nNo estás solo, parce. De verdad sería bueno hablar con un orientador presencial o alguien de tu total confianza ahora mismo, ¿sí?",
             "\n\nHey, recuerda que hay personas que te quieren apoyar. ¿Te sentirías cómodo hablando con algún familiar o con el orientador del colegio hoy?"
           ];
           finalResponse += emergencyTips[Math.floor(Math.random() * emergencyTips.length)];
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
