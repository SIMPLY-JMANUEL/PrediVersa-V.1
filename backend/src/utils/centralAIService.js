const { ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { bedrockClient } = require("./awsConfig");
const aiCache = require('./aiCache');
const logger = require('./logger');
const { calculateCost } = require('./aiMetrics');
const { performance } = require('perf_hooks');
const crypto = require('crypto');
require('dotenv').config();

/**
 * 🏛️ MOTOR VERSA v3 - ENTERPRISE HYBRID ENGINE
 * Determinístico + Heurístico + Inteligencia Artificial
 */

const IMPACT_CATEGORIES = {
  CRITICO: ["suicidio", "matarme", "no quiero vivir", "morirme", "muerte", "violan", "abuso", "quitarme la vida", "ahorcarme"],
  MODERADO: ["acoso", "bullying", "pegan", "amenaza", "golpe", "insulto", "maltrato"],
  EMOCIONAL: ["solo", "triste", "ansiedad", "llorar", "paila", "desespero", "vacio"]
};

class CentralAIService {
  constructor() {
    this.client = bedrockClient;
    this.modelId = "us.anthropic.claude-3-5-haiku-20241022-v1:0"; 
  }

  // 🛡️ PARSER SEGURO CON VALIDACIÓN DE ESQUEMA
  safeParse(text) {
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (!parsed.riesgo || !parsed.identidad || !parsed.emocion) throw new Error("Schema Incompleto");
      return parsed;
    } catch (e) {
      logger.error('❌ Fallo de Parsing AI:', e.message);
      return null;
    }
  }

  // 🔑 CACHE KEY ROBUSTA (SHA-256)
  buildCacheKey(text) {
    return crypto.createHash('sha256').update(`v3|${text}`).digest('hex');
  }

  // 🧬 HEURÍSTICA DE GÉNERO (Pre-LLM)
  detectGenderHeuristic(text) {
    const t = text.toLowerCase();
    if (t.includes("soy mujer") || t.includes("cansada") || t.includes("lista")) 
      return { genero: "femenino", confianza: 0.75, fuente: 'heuristica' };
    if (t.includes("soy hombre") || t.includes("cansado") || t.includes("listo")) 
      return { genero: "masculino", confianza: 0.75, fuente: 'heuristica' };
    if (t.includes("soy no binarie") || t.includes("cansade"))
      return { genero: "no_binario", confianza: 0.8, fuente: 'heuristica' };
    return { genero: "indeterminado", confianza: 0.2, fuente: 'default' };
  }

  // 💰 DECISOR FINOPS: ¿Necesitamos realmente gastar en Bedrock?
  shouldUseLLM({ riesgo, generoHeur, text }) {
    if (riesgo.nivel === "ALTO") return true; // Seguridad ante todo
    if (generoHeur.confianza < 0.6) return true; // Necesitamos contexto lingüístico
    if (text.length > 50) return true; // Mensajes largos requieren razonamiento
    return false;
  }

  // 🧪 FUSIÓN INTELIGENTE DE CONTEXTO
  mergeContext(diccionario, heuristica, llm) {
    return {
      riesgo: llm?.riesgo || { nivel: diccionario.nivel, score: 50, requiere_intervencion: diccionario.nivel === 'ALTO' },
      identidad: llm?.identidad || heuristica,
      emocion: llm?.emocion || { clase: "neutro", intensidad: 30 },
      meta: {
        engine: llm ? "V3_HYBRID_LLM" : "V3_DETERMINISTIC",
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 📡 VERSA v3.1: MOTOR DE ANÁLISIS DE RIEGO ENTERPRISE (TITANIO)
   * Función: Determinar Riesgo, Alerta Institucional, Emoción y Auditoría.
   */
  async analizarContextoTotalV3(mensaje) {
    const cleanText = mensaje.toLowerCase().trim();
    const cacheKey = this.buildCacheKey(cleanText);
    const start = performance.now();

    // 🧊 1. CAPA CACHÉ CRIPTOGRÁFICA (SHA-256)
    const cached = await aiCache.get(cacheKey, 'v3_context');
    if (cached) return cached;

    // 🧩 2. CAPA DICCIONARIO CLÍNICO
    const riesgoDic = await this.categorizeMessage(cleanText);
    const generoHeur = this.detectGenderHeuristic(cleanText);

    // 💰 3. DECISOR FINOPS: ¿Llamamos a Bedrock?
    const useLLM = this.shouldUseLLM({ riesgo: riesgoDic, generoHeur, text: cleanText });

    let llmResult = null;
    if (useLLM) {
      const systemPrompt = `Actúa como VERSA v3.1: Alert Engine de PrediVersa (Sistema Certificado). 
        Analiza mensajes de menores con enfoque clínico y ético.
        ACTIVAR ALERTA SI: Intención de autolesión, suicidio, evidencia de abuso, amenazas graves o colapso emocional.
        REGLAS: Si hay duda entre MEDIO y ALTO -> elige ALTO. Prioriza seguridad sobre precisión.`;

      const userPrompt = `MENSAJE: "${mensaje}"
        SALIDA JSON ESTRICTO:
        {
          "riesgo": { "nivel": "BAJO|MEDIO|ALTO", "score": 0-100, "requiere_intervencion": boolean },
          "alerta": { 
            "activar": boolean, 
            "tipo": "SUICIDIO|ABUSO|VIOLENCIA|BULLYING|EMOCIONAL", 
            "urgencia": "INMEDIATA|ALTA|MEDIA|BAJA", 
            "justificacion": "string",
            "evidencia": []
          },
          "emocion": { "clase": "tristeza|ira|ansiedad|miedo|neutro", "intensidad": 0-100 },
          "auditoria": { "decision_confianza": 0-1.0, "requiere_revision_humana": boolean }
        }`;

      try {
        const command = new ConverseCommand({
          modelId: this.modelId,
          messages: [{ role: "user", content: [{ text: userPrompt }] }],
          system: [{ text: systemPrompt }],
          inferenceConfig: { maxTokens: 1000, temperature: 0 }
        });

        const response = await this.client.send(command);
        llmResult = this.safeParse(response.output.message.content[0].text);
        
        logger.info({
          ai_event: 'v3.1_inference_completed',
          latencyMs: Math.round(performance.now() - start),
          costUsd: calculateCost(this.modelId, response.usage),
          alert_status: llmResult?.alerta?.activar ? 'TRIGGERED' : 'QUIET'
        });
      } catch (err) { logger.error('⚠️ Bedrock v3.1 Fail:', err.message); }
    }

    // 5. FUSIÓN FINAL E IDIOMA DETERMINÍSTICO 🧪
    const finalContext = this.mergeContext(riesgoDic, generoHeur, llmResult);
    
    // Inyección de Hardening Determinístico post-fusión
    if (riesgoDic.nivel === 'ALTO') {
       finalContext.riesgo.nivel = 'ALTO';
       finalContext.alerta = finalContext.alerta || { activar: true, tipo: 'EMOCIONAL', urgencia: 'ALTA', justificacion: 'Detectado por diccionario clínico (ALTO)' };
       finalContext.alerta.activar = true;
    }

    await aiCache.set(cacheKey, finalContext, 'v3_context');
    return finalContext;
  }

  /**
   * 🎭 GENERADOR DE RESPUESTA v3.1 (IDENTIDAD ADAPTATIVA & PERSONALIZACIÓN)
   * Adapta el lenguaje (género y tono) según el ADN del mensaje.
   */
  async generarRespuestaV3(datos) {
    const { mensaje, contexto } = datos;
    const cleanText = mensaje.toLowerCase().trim();
    const cacheKey = this.buildCacheKey(`res|${cleanText}`);

    const cached = await aiCache.get(cacheKey, 'v3_res');
    if (cached) return cached;

    // 🕵️‍♂️ Lógica de Adaptación de Identidad (Género)
    const genero = contexto.identidad.genero;
    const esConfiable = contexto.identidad.confianza > 0.85;
    
    // Determinar tono basado en emoción y riesgo
    let tonoDescription = "neutral-amigable";
    if (contexto.riesgo.nivel === "ALTO") tonoDescription = "urgente, altamente empático, serio";
    else if (contexto.emocion.clase === "tristeza") tonoDescription = "cálido, cercano, apoyo incondicional";

    const systemPrompt = `Eres VERSA v3.1, orientador colombiano (Pana). 
      REGLA DE IDENTIDAD (CRÍTICA): 
      - Género detectado: ${genero} (Confianza: ${contexto.identidad.confianza}).
      - SI es confiable (${esConfiable}): Adapta TODA la gramática al género (ej: "amigo/parce" o "amiga/parcera").
      - SI NO es confiable: Usa lenguaje NEUTRO e inclusivo (ej: "parce", "estudiante", "te escucho").
      TONO: ${tonoDescription}. 
      Respuesta breve (2-4 líneas). No uses estereotipos.`;

    const userPrompt = `MENSAJE DEL ESTUDIANTE: "${mensaje}"`;

    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [{ role: "user", content: [{ text: userPrompt }] }],
        system: [{ text: systemPrompt }],
        inferenceConfig: { maxTokens: 300, temperature: 0.7 }
      });

      const response = await this.client.send(command);
      const finalRes = response.output.message.content[0].text.trim();
      
      await aiCache.set(cacheKey, finalRes, 'v3_res');
      return finalRes;
    } catch (error) {
      return "Acá estoy para escucharte, parce. Decime qué pasa.";
    }
  }

  async categorizeMessage(text) {
    const result = { nivel: "BAJO", detectadas: [] };
    for (const key in IMPACT_CATEGORIES) {
      for (const word of IMPACT_CATEGORIES[key]) {
        if (text.includes(word)) {
          result.nivel = key === 'CRITICO' ? "ALTO" : (key === 'MODERADO' ? "MEDIO" : "BAJO");
          result.detectadas.push(word);
        }
      }
    }
    return result;
  }
}

module.exports = new CentralAIService();
