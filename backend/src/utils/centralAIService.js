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
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40,
      },
      // Configuración de seguridad para evitar bloqueos en temas sensibles del colegio
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
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
      Eres el motor de análisis de riesgo psicopedagógico de PrediVersa Central, experto en convivencia escolar en Colombia.
      Tu misión es evaluar el nivel de riesgo de un mensaje enviado por un estudiante de primaria o secundaria.
      
      CONTEXTO DEL ESTUDIANTE:
      - Tipo de situación auto-reportada: ${tipo_violencia || 'No definida'}
      - Frecuencia declarada: ${frecuencia || 'No especificada'}
      - Historial de mensajes recientes (para detectar escalación): ${historial.length ? historial.join(' | ') : 'Sin historial previo'}
      
      MENSAJE ACTUAL A ANALIZAR:
      "${mensaje}"
      
      REGLAS DE ORO:
      1. ANALIZA LA JERGA: Identifica términos colombianos como "paila", "casca", "boletear", "la tiene montada", "me levantaron", "gonorrea" (como insulto o énfasis), "banda", "parche", etc.
      2. DETECTA INTENCIÓN: Diferencia entre una queja normal y una amenaza real, acoso persistente o ideación suicida.
      3. EVALUACIÓN DE RIESGO:
         - ALTO: Violencia física severa, armas, abuso sexual, ideación suicida, amenazas de muerte, negligencia grave.
         - MEDIO: Bullying persistente, exclusión social, ciberacoso moderado, problemas familiares conflictivos.
         - BAJO: Desahogo emocional simple, conflictos menores entre pares, dudas generales.
      
      RESPONDE ESTRICTAMENTE EN FORMATO JSON (sin texto adicional):
      {
        "nivel_riesgo": "bajo" | "medio" | "alto",
        "score": (número entre 0 y 100),
        "tipos_identificados": ["bullying", "violencia_fisica", "riesgo_emocional", etc],
        "razon": "Explicación breve en español sobre el nivel asignado",
        "requiere_intervencion_humana": boolean,
        "sugerencia_accion": "Qué debería hacer el orientador inmediatamente"
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
       return "Hola, soy Versa. Estoy aquí para escucharte. ¿Cómo te sientes hoy? 💙";
    }

    const { mensaje, nivelRiesgo, historial = [] } = datos;

    try {
      const chatModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      let chatHistory = historial.map(m => `${m.type === 'user' ? 'Estudiante' : 'Versa'}: ${m.text}`).join('\n');

      const prompt = `
        Eres Versa, un orientador virtual joven, empático y cercano de la plataforma "PrediVersa".
        Tu personalidad es la de un mentor o hermano mayor: comprensivo, que no juzga y habla con cercanía pero respeto.
        
        TONO Y ESTILO:
        - Usa jerga colombiana juvenil de forma natural (ej: "parce", "tranqui", "todo bien", "contame").
        - Tu objetivo es que el estudiante se sienta escuchado y VALIDADO.
        - Si el riesgo es ALTO, mantén la calma pero sé muy protector y motiva a buscar ayuda real sin asustarlos.
        - Si el riesgo es BAJO o MEDIO, sé animador y empático.
        
        RIESGO DETECTADO: ${nivelRiesgo.toUpperCase()}
        HISTORIAL DE CHARLA:
        ${chatHistory}
        
        ESTUDIANTE DICE: "${mensaje}"
        VERSA RESPONDE:
      `;


      const result = await chatModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      });
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Error API Gemini:', error.message);
      
      // Respuestas locales variadas según riesgo
      const msgLow = mensaje.toLowerCase();
      
      if (nivelRiesgo === 'alto') {
          return "Oye, lo que me cuentas suena muy difícil. No estás solo en esto. ¿Has pensado en hablar con un adulto de confianza o un orientador? Estoy aquí para apoyarte. 💙";
      }
      
      if (msgLow.includes('triste')) {
          return "Entiendo que te sientas así. A veces las cosas se ponen pesadas, pero hablarlo es el primer paso para estar mejor. ¿Quieres contarme más de qué te tiene así? 🫂";
      }

      if (msgLow.includes('hola') || msgLow.includes('buenos dias')) {
          return "¡Hola! Soy Versa, tu compañero de PrediVersa. ¿En qué te puedo ayudar hoy? ¡Todo bien! 😊";
      }

      const respuestasGenericas = [
        "Te escucho con atención. Lo que compartes es importante y estoy aquí para acompañarte en este proceso. 💙",
        "Entiendo lo que me dices. A veces es difícil expresar lo que sentimos, pero aquí puedes hacerlo con confianza. 🫂",
        "Gracias por compartir eso conmigo. Me interesa mucho cómo te sientes hoy. Cuéntame más si quieres. 😊",
        "Aquí estoy para ti. Tu bienestar es nuestra prioridad en PrediVersa. ¿Quieres profundizar un poco más en eso? 💙"
      ];
      
      const randomMsg = respuestasGenericas[Math.floor(Math.random() * respuestasGenericas.length)];
      return randomMsg;
    }
  }
}

module.exports = new CentralAIService();
