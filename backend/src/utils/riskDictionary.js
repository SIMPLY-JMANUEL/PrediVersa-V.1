/**
 * ============================================================
 * MOTOR DE DETECCIÓN DE RIESGO — PrediVersa
 * ============================================================
 * Diccionario de palabras clave para detección de alertas
 * en contexto escolar colombiano.
 *
 * Niveles de riesgo:
 *   3 → CRÍTICO  (riesgo de vida, abuso grave)
 *   2 → ALTO     (violencia física, bullying severo)
 *   1 → MEDIO    (malestar emocional, acoso leve)
 *   0 → BAJO     (sin riesgo aparente)
 * ============================================================
 */

const DICCIONARIO_RIESGO = {

  // ────────────────────────────────────────────
  // NIVEL 3 — CRÍTICO (riesgo de vida inmediato)
  // ────────────────────────────────────────────
  CRITICO: {
    nivel: 3,
    alertType: 'Crítica',
    prioridad: 'URGENTE',
    emoji: '🔴',
    categorias: {
      riesgo_suicida: [
        'me quiero matar', 'quiero matarme', 'no quiero vivir',
        'quitarme la vida', 'hacerme daño', 'me voy a hacer daño',
        'ya no quiero estar aquí', 'prefiero morirme', 'quiero morir',
        'suicidio', 'suicidarme', 'acabar con mi vida',
        'no tiene sentido vivir', 'mejor me muero', 'tengo ganas de morir',
        'voy a hacerlo', 'me corté', 'me hice daño', 'me lastimé a mí mismo'
      ],
      abuso_sexual: [
        'me violaron', 'me abusaron', 'me tocaron', 'abuso sexual',
        'me hicieron cosas malas', 'tocaron mi cuerpo sin permiso',
        'me forzaron', 'me obligaron a hacer cosas',
        'me mostraron cosas feas', 'me mandaron fotos', 'grooming'
      ],
      violencia_extrema: [
        'me apuñalaron', 'me cortaron', 'me quemaron', 'me golpearon muy duro',
        'me dejaron morado', 'me rompieron un hueso', 'estoy sangrando',
        'tengo miedo de que me maten', 'me amenazaron con un arma',
        'tienen un cuchillo', 'tienen un arma'
      ]
    }
  },

  // ────────────────────────────────────────────
  // NIVEL 2 — ALTO (violencia física / bullying severo)
  // ────────────────────────────────────────────
  ALTO: {
    nivel: 2,
    alertType: 'Alta',
    prioridad: 'ALTA',
    emoji: '🟠',
    categorias: {
      violencia_fisica: [
        'me pegan', 'me golpean', 'me empujan', 'me jalan el cabello',
        'me dan patadas', 'me dan puños', 'me lastiman', 'me hacen daño',
        'me tiraron al piso', 'me escupen', 'me jalonean',
        'siempre me pegan', 'todos los días me golpean'
      ],
      bullying_severo: [
        'me hacen bullying', 'bullying', 'me acosan todos los días',
        'me tienen amenazado', 'me dicen que me van a pegar',
        'me roban mis cosas', 'me esconden mis cosas',
        'me botan los útiles', 'me rompen las cosas',
        'me excluyen siempre', 'nadie me deja hablar',
        'me tienen aislado', 'me señalan', 'me graban para burlarse'
      ],
      violencia_familiar: [
        'mi papá me pega', 'mi mamá me pega', 'me pegan en la casa',
        'me maltratan en casa', 'me castigan muy duro',
        'no me dan comida', 'me dejan sin comer',
        'me encierran', 'me amarran', 'tengo miedo en mi casa',
        'me grita mucho', 'mi padrastro me pega', 'mi madrastra me pega'
      ],
      ciberbullying: [
        'me amenazan por whatsapp', 'me mandan mensajes feos',
        'me hacen memes para burlarse', 'publicaron fotos mías sin permiso',
        'me hackeron la cuenta', 'me acosan en instagram',
        'me mandan cosas feas por internet', 'me dicen cosas feas en redes'
      ]
    }
  },

  // ────────────────────────────────────────────
  // NIVEL 1 — MEDIO (malestar emocional / acoso leve)
  // ────────────────────────────────────────────
  MEDIO: {
    nivel: 1,
    alertType: 'Informativa',
    prioridad: 'MEDIA',
    emoji: '🟡',
    categorias: {
      malestar_emocional: [
        'me siento muy mal', 'estoy muy triste', 'lloro mucho',
        'no me siento bien', 'estoy deprimido', 'me siento solo',
        'nadie me quiere', 'nadie me entiende', 'soy un fracaso',
        'soy lo peor', 'no sirvo para nada', 'me siento invisible',
        'no tengo amigos', 'me siento rechazado', 'todo está mal',
        'tengo mucha ansiedad', 'no puedo dormir de la preocupación'
      ],
      conflicto_leve: [
        'me molestan', 'me fastidian', 'me cargan', 'me joden',
        'me hacen quedar mal', 'se burlan de mí', 'se ríen de mí',
        'me dicen apodos', 'me ponen sobrenombres', 'me molestan por mi forma de ser',
        'me molestan por cómo me visto', 'me molestan por mi cuerpo'
      ],
      rechazo_escolar: [
        'no quiero ir al colegio', 'odio el colegio', 'el colegio me da miedo',
        'prefiero no ir a clases', 'me da miedo llegar al colegio',
        'no me gustan mis compañeros', 'mis compañeros son malos conmigo'
      ],
      problemas_familia: [
        'hay problemas en mi casa', 'mis papás pelean mucho',
        'estoy cansado de los problemas', 'no hay paz en mi casa',
        'en mi familia hay violencia', 'mi familia me estresa mucho'
      ]
    }
  }

};

/**
 * Normaliza el texto para comparación:
 * - Convierte a minúsculas
 * - Elimina tildes
 * - Elimina caracteres especiales
 */
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina tildes
    .replace(/[^\w\s]/g, ' ')        // elimina signos de puntuación
    .replace(/\s+/g, ' ')            // normaliza espacios
    .trim();
};

/**
 * Analiza un texto y retorna el nivel de riesgo detectado.
 *
 * @param {string} texto - Mensaje del estudiante
 * @param {string} nivelBotpress - Nivel que ya envió Botpress ('crítica'|'Alta'|'medio'|'bajo')
 * @returns {Object} Resultado con nivel, alertType, palabrasDetectadas, categoria
 */
const analizarRiesgo = (texto = '', nivelBotpress = 'bajo') => {
  const textoNorm = normalizarTexto(texto);
  
  let nivelMaxDetectado = 0;
  const hallazgos = [];

  // Recorrer todos los niveles del diccionario
  for (const [nombreNivel, datos] of Object.entries(DICCIONARIO_RIESGO)) {
    for (const [categoria, palabras] of Object.entries(datos.categorias)) {
      for (const frase of palabras) {
        const fraseNorm = normalizarTexto(frase);
        if (textoNorm.includes(fraseNorm)) {
          hallazgos.push({
            nivel: datos.nivel,
            categoria,
            frase,
            alertType: datos.alertType,
            emoji: datos.emoji,
            prioridad: datos.prioridad
          });
          if (datos.nivel > nivelMaxDetectado) {
            nivelMaxDetectado = datos.nivel;
          }
        }
      }
    }
  }

  // Mapear el nivel de Botpress a número para comparar
  const nivelBotpressNum = {
    'critica': 3, 'crítica': 3,
    'alta': 2, 'Alta': 2,
    'medio': 1,
    'bajo': 0
  }[nivelBotpress] || 0;

  // Siempre usar el nivel MÁS ALTO entre Botpress y el diccionario propio
  const nivelFinal = Math.max(nivelMaxDetectado, nivelBotpressNum);

  // Mapear nivel numérico a objeto de resultado
  const resultadoMap = {
    3: { alertType: 'Crítica',     emoji: '🔴', prioridad: 'URGENTE', esUrgente: true  },
    2: { alertType: 'Alta',        emoji: '🟠', prioridad: 'ALTA',    esUrgente: true  },
    1: { alertType: 'Informativa', emoji: '🟡', prioridad: 'MEDIA',   esUrgente: false },
    0: { alertType: 'Informativa', emoji: '🟢', prioridad: 'BAJA',    esUrgente: false }
  };

  const resultado = resultadoMap[nivelFinal] || resultadoMap[0];

  return {
    ...resultado,
    nivelNumerico: nivelFinal,
    palabrasDetectadas: hallazgos,
    fueElevado: nivelFinal > nivelBotpressNum, // true si el motor subió el nivel
    categorias: [...new Set(hallazgos.map(h => h.categoria))]
  };
};

module.exports = { analizarRiesgo, DICCIONARIO_RIESGO };
