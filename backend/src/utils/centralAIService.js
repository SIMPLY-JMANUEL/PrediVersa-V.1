const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
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
   * Analiza un mensaje para detectar niveles de riesgo de forma anónima.
   */
  async analizarRiesgo(datosAnonimos) {
    const { mensaje, historial = [] } = datosAnonimos;
    
    // 1. Detección Directa (Filtro Rojo/Naranja/Amarillo)
    const categoria = await this.categorizeMessage(mensaje);
    let nivel_riesgo = categoria.nivel;

    // 2. Validación y Contexto con Bedrock (IA Superior)
    const systemPrompt = `Eres un motor de detección de riesgos psicosociales para PrediVersa. 
    Analiza el mensaje y devuelve un JSON estricto. 
    Si el mensaje es una broma clara, saludo o no tiene riesgo real, clasifícalo como BAJO aunque use palabras ruidosas.`;
    
    const userPrompt = `
      MENSAJE DEL ESTUDIANTE: "${mensaje}"
      DETECCIÓN PALABRAS CLAVE: ${categoria.detectadas.join(', ') || 'Ninguna'}
      NIVEL BASE DETECTADO: ${nivel_riesgo}
      HISTORIAL RECIENTE: ${historial.length ? historial.map(h => h.text).slice(-3).join(' | ') : 'N/A'}

      RESPONDE ÚNICAMENTE CON ESTE FORMATO JSON:
      {
        "nivel_riesgo": "BAJO" | "MEDIO" | "ALTO",
        "score": (0-100 calculo interno),
        "intencion_principal": "string",
        "emociones_detectadas": ["string"],
        "palabras_clave_criticas": ["string"],
        "razon": "Explicación breve de por qué se asignó este nivel",
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
      const resText = response.output.message.content[0].text;
      const aiResult = JSON.parse(resText.replace(/```json|```/g, '').trim());

      // REGLA DE SEGURIDAD CRÍTICA - ZERO TOLERANCE: 
      // Si el diccionario detectó un Riesgo ALTO (Palabra Crítica), se mantiene ALTO sin importar el análisis de la IA.
      if (nivel_riesgo === "ALTO") {
        aiResult.nivel_riesgo = "ALTO"; 
        aiResult.score = Math.max(aiResult.score, 99); 
        aiResult.requiere_intervencion_humana = true;
      }

      return aiResult;
    } catch (error) {
      console.warn('⚠️ Bedrock falló, usando Detección Directa:', error.message);
      return {
        nivel_riesgo,
        score: nivel_riesgo === 'ALTO' ? 90 : (nivel_riesgo === 'MEDIO' ? 50 : 10),
        razon: "Fallo de conexión API - Usando Diccionario de Impacto",
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
