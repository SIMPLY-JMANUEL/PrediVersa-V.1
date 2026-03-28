const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * SERVIDOR CENTRAL DE INTELIGENCIA ARTIFICIAL (Simulado)
 * Este servicio representa el núcleo centralizado de procesamiento.
 * En una fase avanzada, esto viviría en un servidor independiente.
 */

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
   * Analiza un mensaje para detectar niveles de riesgo de forma anónima.
   * REGRESA: { nivel_riesgo: 'bajo'|'medio'|'alto', score: 0-100, razon: string }
   */
  async analizarRiesgo(datosAnonimos) {
    if (!this.initialized && !this.init()) throw new Error('AI Service not initialized');

    const { mensaje, tipo_violencia, frecuencia, historial = [] } = datosAnonimos;

    // Validación de PII (Protección de Datos): No procesamos si detectamos posibles nombres propios o emails (simplificado)
    // En producción, aquí iría un filtro de anonimización robusto.

    const prompt = `
      SISTEMA DE ANÁLISIS PREDIVERSA v2
      Eres un motor de análisis de riesgo especializado en detección temprana de riesgos psicosociales, convivencia y bienestar escolar.
      
      OBJETIVO:
      1. Escuchar activamente al usuario (estudiante).
      2. Identificar señales de riesgo: ${mensaje}
      3. Clasificar el nivel de riesgo: BAJO, MEDIO, ALTO.
      
      SEÑALES CRÍTICAS A IDENTIFICAR:
      - Violencia, acoso, bullying ("me pegan", "me insultan", "la tienen montada").
      - Riesgo emocional: ansiedad, depresión, aislamiento ("me siento solo", "estoy triste", "nadie me ayuda").
      - Ideación autolesiva o riesgo de vida ("no quiero vivir", "morirme", "matarme").
      
      CONTEXTO ADICIONAL:
      - Tipo de situación: ${tipo_violencia || 'No definida'}
      - Frecuencia: ${frecuencia || 'No especificada'}
      - Historial: ${historial.length ? historial.join(' | ') : 'Sin historial'}
      
      REGLAS DE CLASIFICACIÓN:
      - ALTO: Ideación suicida, violencia física severa, armas, abuso, peligro de vida inminente.
      - MEDIO: Acoso recurrente, angustia emocional profunda, conflictos familiares graves.
      - BAJO: Quejas de convivencia menores, desahogo emocional sin riesgo de daño, dudas generales.

      RESPONDE ESTRICTAMENTE EN FORMATO JSON:
      {
        "nivel_riesgo": "bajo" | "medio" | "alto",
        "score": (0-100),
        "intencion_principal": "string",
        "emociones_detectadas": ["string"],
        "palabras_clave_criticas": ["string"],
        "razon": "Explicación breve basada en las reglas",
        "requiere_intervencion_humana": boolean
      }
    `;


    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.warn('⚠️ Central AI API fallo, usando lógica local de respaldo:', error.message);
      
      // Lógica de respaldo local basada en keywords si falla la API
      const msgLow = mensaje.toLowerCase();
      let nivel = 'bajo';
      let score = 10;
      let razon = "Análisis local (Offline)";

      if (msgLow.includes('matar') || msgLow.includes('suicidio') || msgLow.includes('morir') || msgLow.includes('arma')) {
        nivel = 'alto'; score = 95; razon = "Detección local de riesgo inminente";
      } else if (msgLow.includes('triste') || msgLow.includes('solo') || msgLow.includes('llorar') || msgLow.includes('pegan')) {
        nivel = 'medio'; score = 50; razon = "Detección local de angustia emocional";
      }

      return {
        nivel_riesgo: nivel,
        score: score,
        tipos_identificados: ["deteccion_local"],
        razon: razon,
        requiere_intervencion_humana: nivel === 'alto'
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
      // FIX M-3: Reutilizar this.model en lugar de crear nueva instancia chatModel
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
      return response.text().trim();
    } catch (error) {
      // FIX M-5: Intentar con modelo alternativo si el principal falla
      if (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('503')) {
        try {
          console.warn('⚠️ gemini-2.0-flash inaccesible, intentando con gemini-1.5-flash...');
          const fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
          const result = await fallbackModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: `Eres Versa, orientador empático de PrediVersa. El estudiante dice: "${mensaje}". Responde de forma corta, empática y en español colombiano. RIESGO: ${nivelRiesgo.toUpperCase()}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
          });
          return result.response.text().trim();
        } catch(e2) {
          console.error('❌ Ambos modelos Gemini fallaron:', e2.message);
        }
      } else {
        console.error('❌ Error API Gemini:', error.message);
      }
      
      // Si la IA falla, retornamos null para que el sistema de fallback (Amazon Lex) tome el control de forma natural.
      return null;
    }
  }
}

module.exports = new CentralAIService();
