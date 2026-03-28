const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * SERVIDOR CENTRAL DE INTELIGENCIA ARTIFICIAL (Simulado)
 * Este servicio representa el núcleo centralizado de procesamiento.
 * En una fase avanzada, esto viviría en un servidor independiente.
 */

const WEIGHTS = {
  "suicidio": 10, "matarme": 10, "no quiero vivir": 10, "morirme": 10, "muerte": 10,
  "me pegan": 8, "me violan": 10, "acoso": 7, "bullying": 6, "amenaza": 7,
  "solo": 3, "triste": 4, "ansiedad": 5, "llorar": 3, "paila": 3, "insulto": 4
};

class CentralAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }

  init() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ Error: GEMINI_API_KEY no configurada');
      return false;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40,
      },
      // FIX M-4: Safety settings ajustados - BLOCK_NONE solo para contenido relevante al contexto escolar
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ]
    });
    this.initialized = true;

    return true;
  }

  /**
   * 🧼 PRE-PROCESAMIENTO: Normaliza input para evitar ruido
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

    // 1. Reglas duras (Factores del score)
    for (const [word, weight] of Object.entries(WEIGHTS)) {
      if (cleanText.includes(word)) score += weight;
    }

    // 2. Intensidad emocional
    if (cleanText.includes("muy") || cleanText.includes("demasiado") || cleanText.includes("bastante")) {
      score += 2;
    }

    // 3. Repetición/Tendencia en el historial
    if (history.length > 0) {
      if (history.some(h => cleanText.includes(h.text.toLowerCase()))) score += 3;
      if (history.length >= 3) score += 2;
    }

    return Math.min(score, 100);
  }

  /**
   * Analiza un mensaje para detectar niveles de riesgo de forma anónima.
   * REGRESA: { nivel_riesgo: 'BAJO'|'MEDIO'|'ALTO', score: 0-100, razon: string }
   */
  async analizarRiesgo(datosAnonimos) {
    if (!this.initialized && !this.init()) throw new Error('AI Service not initialized');

    const { mensaje, historial = [] } = datosAnonimos;
    const cleanText = this.preprocess(mensaje);
    
    // 🧠 1. Scoring Engine Cuantificable
    const score = await this.computeAdvancedRiskScore(cleanText, historial);
    let nivel_riesgo = "BAJO";
    if (score >= 15) nivel_riesgo = "ALTO";
    else if (score >= 7) nivel_riesgo = "MEDIO";

    // 🧠 2. Validación y Contexto con LLM (Gemini)
    const prompt = `
      SISTEMA DE ANÁLISIS PREDIVERSA v2 - MOTOR DE RIESGO
      Eres el motor de análisis especializado en detección de riesgos psicosociales.
      
      DATOS ACTUALES:
      - Mensaje del Estudiante: "${cleanText}"
      - Scoring Local: ${score} (Nivel sugerido: ${nivel_riesgo})
      - Historial Reciente: ${historial.length ? historial.map(h => h.text).join(' | ') : 'Sin historial'}
      
      TU MISIÓN:
      Analizar la intención emocional y confirmar el nivel de riesgo.
      Si detectas ironía, jerga colombiana específica o escalamiento sutil, ajusta el nivel.

      RESPONDE ESTRICTAMENTE EN FORMATO JSON:
      {
        "nivel_riesgo": "BAJO" | "MEDIO" | "ALTO",
        "score": (Ajustado por ti, 0-100),
        "intencion_principal": "string",
        "emociones_detectadas": ["string"],
        "palabras_clave_criticas": ["string"],
        "razon": "Explicación breve de tu decisión",
        "requiere_intervencion_humana": boolean
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const aiResult = JSON.parse(text);
      
      // Fusión de riesgo: Priorizamos el score manual si es más alto
      if (nivel_riesgo === "ALTO" && aiResult.nivel_riesgo !== "ALTO") {
        aiResult.nivel_riesgo = "ALTO";
        aiResult.score = Math.max(score, aiResult.score);
      }

      return aiResult;
    } catch (error) {
      console.warn('⚠️ AI API falló, usando Risk Index local:', error.message);
      return {
        nivel_riesgo,
        score,
        razon: "Análisis basado en Risk Index v2 (Offline)",
        requiere_intervencion_humana: nivel_riesgo === 'ALTO'
      };
    }
  }

  /**
   * Genera respuestas empáticas y humanizadas.
   */
  async generarRespuesta(datos) {
    if (!this.initialized && !this.init()) {
       console.warn("⚠️ Advertencia: No hay GEMINI_API_KEY. Devolviendo null para forzar cascada a Amazon Lex.");
       return null;
    }

    const { mensaje, nivelRiesgo, historial = [] } = datos;

    try {
      let chatHistory = historial.map(m => `${m.type === 'user' ? 'Estudiante' : 'Versa'}: ${m.text}`).join('\n');

      const prompt = `
        ━━━━━━━━━━━━━━━━━━━
        🎯 ROL DE ORIENTADOR (VERSA)
        ━━━━━━━━━━━━━━━━━━━
        Eres VERSA, un orientador conversacional colombiano, cercano, empático y confiable.
        Tu estilo es el de un “pana que sabe escuchar”, no un sistema ni una autoridad.
        Hablas en español colombiano natural (sin exagerar jerga).

        ━━━━━━━━━━━━━━━━━━━
        🎯 OBJETIVO
        ━━━━━━━━━━━━━━━━━━━
        Acompañar al usuario, comprender su situación y detectar señales de riesgo psicosocial de forma implícita.
        Nunca haces diagnósticos. Nunca generas alarma innecesaria. Tu prioridad no es resolver el problema, sino que el usuario se sienta escuchado y continúe la conversación.

        ━━━━━━━━━━━━━━━━━━━
        🗣️ TONO Y PERSONALIDAD
        ━━━━━━━━━━━━━━━━━━━
        - Cercano, humano, sin rigidez (evita sonar institucional).
        - Empático sin exageración.
        - Natural: usa expresiones como “parce”, “tranqui”, “te entiendo”, solo cuando encajen.
        - Evita sonar infantil o forzado. No uses lenguaje clínico ni técnico.

        ━━━━━━━━━━━━━━━━━━━
        ⚙️ REGLAS DE INTERACCIÓN
        ━━━━━━━━━━━━━━━━━━━
        - NO repitas preguntas ya respondidas. NO hagas interrogatorios.
        - Alterna entre validar, acompañar y preguntar (solo cuando aporte valor).
        - A veces NO preguntes nada, solo acompaña.
        - Respuestas: Claras, máximo 3-4 líneas, una sola idea principal.

        ━━━━━━━━━━━━━━━━━━━
        🚦 MANEJO SEGÚN RIESGO: ${nivelRiesgo.toUpperCase()}
        ━━━━━━━━━━━━━━━━━━━
        🟢 SI ES BAJO: Escucha activa y validación ligera. Conversación fluida.
        🟡 SI ES MEDIO: Más empatía, profundizar suavemente, reflejar emociones.
        🔴 SI ES ALTO: Prioriza contención emocional. No minimices ni entres en pánico. 
           Sugiere apoyo externo con naturalidad (ej: “No tenés que pasar esto solo”, “Sería bueno hablar con alguien de confianza”).

        ━━━━━━━━━━━━━━━━━━━
        HISTORIAL Y CONTEXTO
        ━━━━━━━━━━━━━━━━━━━
        ${chatHistory}
        
        MENSAJE DEL ESTUDIANTE: "${mensaje}"
        VERSA RESPONDE (Mantén el formato natural: 1. Validación -> 2. Acompañamiento -> 3. Opcional pregunta):
      `;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      });
      const response = await result.response;
      let finalResponse = response.text().trim();

      // 🧼 POST-PROCESAMIENTO DE SEGURIDAD (HARD-CODED)
      if (nivelRiesgo.toUpperCase() === "ALTO") {
        const lowerRes = finalResponse.toLowerCase();
        if (!lowerRes.includes("no estás solo") && !lowerRes.includes("hablar con alguien")) {
           finalResponse += "\n\nNo estás solo, parce. Sería bueno hablar con alguien de confianza (como un orientador de tu colegio) para no cargar con esto solo, ¿sí?";
        }
      }

      return finalResponse;
    } catch (error) {
      console.error('❌ Error AI Gemini:', error.message);
      return null;
    }
  }
}

module.exports = new CentralAIService();
