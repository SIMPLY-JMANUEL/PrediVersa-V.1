// ═══════════════════════════════════════════════════════════════
// MOTOR VERSA — Sistema Predictivo de Violencia Escolar v2.6 MASTER
// PrediVersa © 2026 — 6 Capas de Análisis de Impacto Directo
// ═══════════════════════════════════════════════════════════════

// ─── CAPA 1: PALABRAS DE EMERGENCIA VITAL (v1.0 Restaurado) ─────
const EMERGENCIAS = [
  'suicidio','me quiero morir','quiero morir','quitarme la vida','hacerme daño',
  'ya no quiero vivir','no quiero estar aqui','mejor muerto','mejor muerta',
  'me voy a matar','me lastimo','me corto','me he cortado','pastillas para morirme',
  'arma','pistola','cuchillo','navaja','revolver','machete','me apuntaron',
  'me violaron','me abusaron','abuso sexual','me forzaron','me obligaron a',
  'me secuestraron','me apuñalaron','me quemaron','estoy sangrando','no tiene sentido vivir','grooming'
]

// ─── CAPA 2: EJES DE INTERVENCIÓN (NUEVO: Para remisión inmediata) ───
const EJES = {
  VITAL: ['ideacion_suicida', 'acoso_sexual', 'grooming_sexting', 'emergencia'],
  ESCOLAR: ['violencia_fisica', 'bullying_verbal', 'exclusion_social', 'ciberbullying'],
  FAMILIAR: ['violencia_familiar', 'negligencia', 'trabajo_infantil'],
  SOCIAL: ['pandillas_drogas', 'vulneracion_derechos', 'amenazas', 'violencia_pareja']
}

// ─── CAPA 3: DICCIONARIO SEMÁNTICO (Fusión Total de Jergas v1.0) ───
const DICCIONARIO = {
  violencia_fisica: {
    score: 25, label: 'Violencia Física',
    palabras: ['pegar','golpear','golpes','empujar','patear','puños','cachetadas','me cascaron','me levantaron','me dieron madera','me cascaron feo','sangre']
  },
  amenazas: {
    score: 30, label: 'Amenazas',
    palabras: ['amenaza','me amenazaron','me dijeron que cuidado','lo vamos a quebrar','ya sabe','atengase a las consecuencias','cuidese','no diga nada o paila']
  },
  bullying_verbal: {
    score: 18, label: 'Bullying Verbal',
    palabras: ['insultos','burlas','apodos','me ofenden','humillaron','me joden','me la tienen montada','me boletearon','me la tienen velada','me chiflan','me pitan']
  },
  exclusion_social: {
    score: 15, label: 'Exclusión Social',
    palabras: ['nadie me habla','me ignoran','me excluyen','me dejaron solo','no tengo amigos','rechazan','me siento invisible','como si no existiera']
  },
  acoso_sexual: {
    score: 35, label: 'Acoso Sexual',
    palabras: ['me tocaron','manoseo','fotos de mi cuerpo','foto desnuda','me presionan sexualmente','me besan sin querer','me piden fotos','me manosean']
  },
  violencia_familiar: {
    score: 30, label: 'Violencia Intrafamiliar',
    palabras: ['en mi casa me pegan','mi papa me pega','mis papas pelean','hay violencia en mi casa','me castigan mal','me encierran','no me dan de comer']
  },
  ideacion_suicida: {
    score: 50, label: 'Riesgo Vital',
    palabras: ['no quiero vivir', 'morirme', 'matarme', 'acabar con todo', 'irme para siempre', 'descansar en paz']
  },
  grooming_sexting: {
    score: 35, label: 'Grooming / Sexting',
    palabras: ['mandame una foto', 'pasa el pack', 'nuestro secreto', 'no le digas a nadie', 'te doy un regalo si', 'mostrame la camara', 'sexting']
  }
}

// ─── CAPA 4: INHIBIDORES (NUEVO: Evita falsas alarmas académicas) ─
const INHIBIDORES = ['ejemplo de', 'clase de', 'tarea sobre', 'libro de', 'cuento de', 'estamos estudiando', 'vimos una pelicula']

// ─── CAPA 5: PATRONES CONTEXTUALES ─────────────────────────────
const PATRONES = [
  { regex: /todos\s*los\s*d[ií]as|constantemente|siempre\s*me/i, bonus: 15, tipo: 'frecuencia_alta' },
  { regex: /nadie\s*me\s*(ayuda|cree|escucha)/i, bonus: 20, tipo: 'aislamiento_critico' },
  { regex: /me\s*pegan\s*con\s*(correa|cable|palo|manguera)/i, bonus: 30, tipo: 'castigo_fisico_severo' },
  { regex: /ya\s*no\s*(puedo|aguanto|soporto)/i, bonus: 18, tipo: 'urgencia' }
]

const norm = (str) => (str || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Pre-normalizar recursos
for (const config of Object.values(DICCIONARIO)) {
  config.palabrasNorm = config.palabras.map(p => norm(p))
}
const EMERGENCIAS_NORM = EMERGENCIAS.map(e => norm(e))
const INHIBIDORES_NORM = INHIBIDORES.map(i => norm(i))

/**
 * MOTOR VERSA v2.6 - MASTER MERGE
 */
function analyzeText(texto, tipoViolencia = '', frecuencia = '', historial = []) {
  if (!texto || texto.trim().length < 3) return { score: 0, nivel_riesgo: 'bajo' };

  const textoNorm = norm(texto);
  let score = 0;
  let esEmergencia = false;
  const keywords_detectadas = [];
  const tipos_violencia = [];
  const patronesDetectados = [];
  const ejesAfectados = new Set();

  // 1. CAPA DE ÉNFASIS (Gritos / Mayúsculas)
  const isCaps = texto.length > 5 && texto === texto.toUpperCase();
  const multipleExclamation = (texto.match(/!/g) || []).length > 2;
  if (isCaps) score += 12;
  if (multipleExclamation) score += 10;

  // 2. CAPA DE EMERGENCIAS (Detección Vital)
  for (const e of EMERGENCIAS_NORM) {
    if (textoNorm.includes(e)) {
      esEmergencia = true;
      ejesAfectados.add('VITAL');
      break;
    }
  }

  if (esEmergencia) {
    return {
      score: 100, nivel_riesgo: 'alto', es_emergencia: true,
      keywords_detectadas: ['DIAGNOSTICO_VITAL'], tipos_violencia: ['EMERGENCIA_CRITICA'],
      eje_principal: 'VITAL', accion_sugerida: 'Remitir Urgente a Psicología y Salud Mental.',
      resumen: '🚨 ALERTA CRÍTICA: Riesgo vital en el acto.', requiere_ia: false, sentimiento: -20
    };
  }

  // 3. CAPA SEMÁNTICA (Diccionario Restaurado)
  for (const [tipoKey, config] of Object.entries(DICCIONARIO)) {
    let matchEncontrado = false;
    for (let i = 0; i < config.palabrasNorm.length; i++) {
      if (textoNorm.includes(config.palabrasNorm[i])) {
        score += config.score;
        keywords_detectadas.push(config.palabras[i]);
        matchEncontrado = true;
        
        for (const [eje, tipos] of Object.entries(EJES)) {
          if (tipos.includes(tipoKey)) ejesAfectados.add(eje);
        }
        break;
      }
    }
    if (matchEncontrado) tipos_violencia.push(tipoKey);
  }

  // 4. CAPA DE INHIBIDORES (Filtro de Ruido Académico)
  for (const i of INHIBIDORES_NORM) {
    if (textoNorm.includes(i)) {
      score -= 35;
      patronesDetectados.push('contexto_academico');
      break;
    }
  }

  // 5. PATRONES CONTEXTUALES
  for (const patron of PATRONES) {
    if (patron.regex.test(texto)) {
      score += patron.bonus;
      patronesDetectados.push(patron.tipo);
    }
  }

  // Normalización Final
  score = Math.max(0, Math.min(Math.round(score), 100))
  let nivel_riesgo = 'bajo'
  if (score >= 67) nivel_riesgo = 'alto'
  else if (score >= 34) nivel_riesgo = 'medio'

  // Acciones de Remisión Sugeridas
  let intervension = 'Monitoreo estándar.';
  if (ejesAfectados.has('ESCOLAR')) intervension = 'Remisión a Comité de Convivencia y Coordinación.';
  if (ejesAfectados.has('FAMILIAR')) intervension = 'Remisión a Bienestar Familiar / Trabajo Social.';
  if (ejesAfectados.has('VITAL') || score > 80) intervension = 'REMISIÓN INMEDIATA A PSICOLOGÍA.';

  return {
    score, nivel_riesgo, es_emergencia: false,
    keywords_detectadas: [...new Set(keywords_detectadas)],
    tipos_violencia: [...new Set(tipos_violencia)],
    patrones: patronesDetectados,
    eje_principal: [...ejesAfectados][0] || 'GENERAL',
    accion_sugerida: intervension,
    requiere_ia: score >= 30 && score < 67, 
    resumen: `Nivel ${nivel_riesgo.toUpperCase()} (${score}/100) | Eje: ${([...ejesAfectados][0] || 'Gral')}`
  };
}

module.exports = { analyzeText, DICCIONARIO, PATRONES, EJES };
