// ═══════════════════════════════════════════════════════════════
// MOTOR VERSA — Sistema Predictivo de Violencia Escolar
// PrediVersa © 2026 — 5 Capas de Análisis
// ═══════════════════════════════════════════════════════════════

// ─── CAPA 1: PALABRAS DE EMERGENCIA ABSOLUTA ──────────────────
// Si aparece cualquiera → nivel ALTO inmediato sin más análisis
const EMERGENCIAS = [
  // Suicidio / Autolesión
  'suicidio','me quiero morir','quiero morir','quitarme la vida',
  'hacerme daño','ya no quiero vivir','no quiero estar aqui',
  'mejor muerto','mejor muerta','me voy a matar','me lastimo',
  'me corto','me he cortado','pastillas para morirme',
  // Armas
  'arma','pistola','cuchillo','navaja','revolver','machete',
  'me apuntaron','me mostraron un arma','trajeron un arma',
  // Abuso sexual
  'me violaron','me abusaron','abuso sexual','me forzaron',
  'me obligaron a','me quitaron la ropa','toco mis partes',
  'tocaron mis partes','abuso','me hicieron cosas',
  // Amenaza de muerte
  'me van a matar','me amenazaron de muerte','me va a matar',
  'van a matarme','me dijo que me iba a matar',
  // Secuestro / Desaparición
  'me secuestraron','me llevaron','me tienen encerrada','me tienen encerrado',
  'me apuñalaron','me quemaron','estoy sangrando','me hicieron cosas malas','grooming',
  'no tiene sentido vivir','voy a hacerlo','me lastime a mi mismo'
]

// ─── CAPA 2: DICCIONARIO SEMÁNTICO ──────────────────────────────
// Cada categoría tiene palabras y un puntaje de riesgo
const DICCIONARIO = {

  violencia_fisica: {
    score: 25, label: 'Violencia Física',
    palabras: [
      'pegar','pegan','pegaron','golpear','golpes','golpearon','me dieron',
      'empujar','empujan','empujaron','jalar','jalaron','patear','patadas',
      'puños','cachetadas','cachetear','pellizcos','lastimar','lastiman',
      'lastimaron','herida','moretones','raspones','me tiraron','me jalaron',
      'morado','morada','sangre','me hicieron sangrar','me rompieron',
      // Jerga Colombiana
      'me cascaron','darme en la cara','me levantaron','me dieron madera',
      'me dieron una tunda','me sonaron'
    ]
  },

  amenazas: {
    score: 30, label: 'Amenazas',
    palabras: [
      'amenaza','amenazar','amenazaron','me amenazaron','amenazas continuas',
      'me dijeron que cuidado','si hablo me hacen algo','van a hacerme algo',
      'mejor que no hable','me advirtieron','me van a buscar','me van a encontrar',
      'mejor cuide su espalda','cuidese','te vamos a esperar','te vamos a buscar',
      // Jerga / Contexto
      'ya sabe','atengase a las consecuencias','lo vamos a quebrar','le va a ir mal',
      'sabemos donde vive','no diga nada o paila'
    ]
  },

  bullying_verbal: {
    score: 18, label: 'Bullying Verbal',
    palabras: [
      'insultos','insultan','insultaron','burlas','se burlan','se burlaron',
      'apodos','me dicen cosas','me ofenden','groserías','me humillan',
      'humillaron','se meten conmigo','me hacen quedar mal','se ríen de mí',
      'me dicen gordo','me dicen flaco','me dicen feo','me dicen tonto',
      'me llaman marica','me llaman llorona','me ponen apodos','me molestan',
      'me fastidian','me joden','me chiflan','me pitan','me gritan cosas',
      // Jerga
      'me la tienen montada','se la pasan montandomela','me la montan','me la velan'
    ]
  },

  exclusion_social: {
    score: 15, label: 'Exclusión Social',
    palabras: [
      'nadie me habla','me ignoran','ignoraron','me excluyen','me dejaron solo',
      'me dejaron sola','no tengo amigos','no tengo amigas','todos se alejan',
      'me rechazan','no me invitan','me sacaron del grupo','me bloquearon',
      'ya no me hablan','me dejaron de hablar','nadie quiere estar conmigo',
      'siempre estoy sol','me siento invisible','como si no existiera',
    ]
  },

  ciberbullying: {
    score: 22, label: 'Ciberbullying',
    palabras: [
      'redes sociales','instagram','tiktok','facebook','whatsapp','telegram',
      'mensajes feos','me hackearon','fotos mías sin permiso','publicaron fotos',
      'stories mías','me etiquetan','memes de mí','capturas de pantalla',
      'me mandan cosas feas','por internet me acosan','en chats me dicen',
      'grupos de whatsapp me molestan','comentarios ofensivos en mis fotos',
      'me stalkean','me acosan online','me amenazan por chat',
    ]
  },

  acoso_sexual: {
    score: 35, label: 'Acoso Sexual',
    palabras: [
      'me tocaron','me manosean','manoseo','me rozan a propósito',
      'comentarios de mi cuerpo','me dicen cosas de mi cuerpo',
      'me miran el cuerpo','me incomodan con miradas','me mandan fotos de',
      'me piden fotos','foto en ropa interior','foto desnuda','foto desnudo',
      'me propusieron','me invitaron a hacer cosas','me presionan sexualmente',
      'me besan sin querer','me abrazan sin querer','me aprietan',
    ]
  },

  violencia_familiar: {
    score: 30, label: 'Violencia Intrafamiliar',
    palabras: [
      'en mi casa me pegan','mi papá me pega','mi mamá me pega',
      'mis papás pelean mucho','hay violencia en mi casa','me agreden en casa',
      'me gritan en casa','me amenazan en casa','mi padrastro me',
      'mi madrastra me','me castigan mal','me encierran','no me dan de comer',
      'me dejan sin comer','no tengo que comer','me dejan solo en casa',
      'mis papás toman mucho','llegan borrachos','hay mucha pelea en casa',
      'siento miedo en mi casa','no quiero llegar a mi casa',
    ]
  },

  violencia_pareja: {
    score: 25, label: 'Violencia de Pareja',
    palabras: [
      'mi novio me controla','mi novia me controla','mi pareja me cela',
      'me revisa el celular','no me deja salir','no me deja tener amigos',
      'me dice que soy feo','me dice que nadie me quiere','me manipula',
      'me presiona para','me amenaza si no','me dice que me va a dejar',
      'me chantajea','me insulta pero dice que me quiere',
      'me golpeó mi novio','me golpeó mi novia','mi pareja me pegó',
    ]
  },

  emocional_psicologico: {
    score: 15, label: 'Violencia Psicológica',
    palabras: [
      'mucho miedo','terror','pánico','ansiedad','no puedo dormir',
      'pesadillas','lloro solo','lloro sola','muy triste','tristeza profunda',
      'deprimido','deprimida','angustia','no me siento bien','me duele todo',
      'me duele el estómago de nervios','me da náuseas','no tengo ganas',
      'ya nada me da alegría','me siento muy mal','me afecta mucho',
      'soy un fracaso','soy lo peor','no sirvo para nada'
    ]
  },

  pandillas_drogas: {
    score: 28, label: 'Pandillas / Drogas',
    palabras: [
      'pandilla','banda','parche peligroso','me ofrecen drogas','me dan drogas',
      'marihuana','cocaína','bazuco','pepas','me invitan a consumir',
      'grupo peligroso','me obligan a','si no consigo plata me hacen algo',
      'me mandan a robar','me piden que robe','me reclutan','me quieren meter',
      'por mi barrio hay peligro','en mi cuadra me amenazan',
    ]
  },

  trabajo_infantil: {
    score: 20, label: 'Trabajo Infantil / Negligencia',
    palabras: [
      'me toca trabajar','no me dejan estudiar','tengo que trabajar',
      'me sacan del colegio','me ponen a vender','me mandan a pedir',
      'no tengo útiles','no tengo uniforme','no tengo comida para el colegio',
      'mis papás no están nunca','estoy solo siempre','estoy sola siempre',
      'me cuido solo','me cuido sola','nadie me ayuda con las tareas',
      'nadie me paga el colegio','no tengo dinero para el bus',
    ]
  },
  vulneracion_derechos: {
    score: 25, label: 'Vulneración de Derechos',
    palabras: ['discriminacion','por mi raza','no me dejan ser','vulneran mis derechos']
  },
  negligencia: {
    score: 28, label: 'Negligencia / Abandono',
    palabras: ['estoy solo','nadie me cuida','no tengo comida','sin ropa limpia','me dejan solo','me dejan sola','mis papas no vuelven']
  },
  ideacion_suicida: {
    score: 50, label: 'Riesgo Vital',
    palabras: ['no quiero vivir', 'morirme', 'matarme', 'acabar con todo', 'irme para siempre', 'descansar en paz']
  }
}


// --- OPTIMIZACIÓN: Pre-normalizar diccionario ---
const norm = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

for (const config of Object.values(DICCIONARIO)) {
  config.palabrasNorm = config.palabras.map(p => norm(p))
}

const EMERGENCIAS_NORM = EMERGENCIAS.map(e => norm(e))


// ─── CAPA 3: PATRONES CONTEXTUALES ──────────────────────────────
const PATRONES = [
  // Frecuencia alta
  { regex: /todos\s*los\s*d[ií]as|a\s*diario|siempre\s*me|cada\s*d[ií]a|constantemente|sin\s*parar/i, bonus: 15, tipo: 'frecuencia_alta' },
  // Desamparo / Falta de apoyo
  { regex: /nadie\s*hace\s*nada|profes\s*no\s*miran|les\s*da\s*igual|he\s*dicho\s*y\s*nada/i, bonus: 20, tipo: 'desamparo_institucional' },
  // Deseo de Huida
  { regex: /no\s*quiero\s*volver|quiero\s*irme\s*de\s*aqu[ií]|me\s*quiero\s*escapar/i, bonus: 15, tipo: 'deseo_huida' },
  // Crianza Violenta severa
  { regex: /me\s*pegan\s*con\s*(correa|cable|palo|manguera)|me\s*dejan\s*marcas/i, bonus: 25, tipo: 'castigo_fisico_severo' },
  // Frecuencia media  
  { regex: /varias\s*veces|muchas\s*veces|frecuentemente|seguido|a\s*cada\s*rato/i, bonus: 8, tipo: 'frecuencia_media' },
  // Duración larga
  { regex: /hace\s*(semanas?|mes(es)?|a[ño]os?|mucho\s*tiempo|rato|bastante)/i, bonus: 12, tipo: 'duracion_larga' },
  // Aislamiento
  { regex: /nadie\s*me\s*(cree|sabe|ayuda|escucha|apoya|hace\s*caso)/i, bonus: 18, tipo: 'aislamiento' },
  { regex: /no\s*tengo\s*(a\s*qui[eé]n|nadie|a\s*nadie)/i, bonus: 15, tipo: 'aislamiento' },
  { regex: /me\s*siento\s*(sol[oa]|abandonad[oa]|invisible)/i, bonus: 12, tipo: 'aislamiento' },
  // Evitación escolar
  { regex: /no\s*quiero\s*ir\s*al\s*(colegio|escuela)|miedo\s*(de|al)\s*(colegio|ir)/i, bonus: 20, tipo: 'evitacion_escolar' },
  // Urgencia / Desesperanza
  { regex: /ya\s*no\s*(puedo|aguanto|soporto)|no\s*aguanto\s*m[aá]s|estoy\s*cansad[oa]\s*de/i, bonus: 18, tipo: 'urgencia' },
  { regex: /no\s*s[eé]\s*qu[eé]\s*hacer|no\s*tengo\s*salida|no\s*hay\s*solución/i, bonus: 12, tipo: 'desesperanza' },
  // Silencio forzado
  { regex: /me\s*dijeron\s*(que\s*)?(no\s*)?(hable|diga|cuente)|si\s*hablo\s*(me|van|algo)/i, bonus: 22, tipo: 'silencio_forzado' },
  // Miedo específico
  { regex: /tengo\s*miedo\s*(de\s*)?(que|ir|él|ella|que\s*me)/i, bonus: 14, tipo: 'miedo_especifico' },
  // Testigo
  { regex: /vi\s*que|presenci[eé]|me\s*toc[oó]\s*ver|vi\s*cuando/i, bonus: 5, tipo: 'testigo' },
  // Reincidencia en el mensaje
  { regex: /otra\s*vez|de\s*nuevo|siguen|sigue\s*pasando|no\s*para/i, bonus: 10, tipo: 'reincidencia' },
]

// ─── CAPA EXTRA: SENTIMIENTOS NEGATIVOS ────────────────────────
const SENTIMIENTOS = {
  tristeza: ['triste','llorar','lloro','deprimido','deprimida','solo','sola','vacio','vacía','sin ganas','desanimado','soledad','angustia'],
  ira: ['odio','rabia','enojo','maldito','maldita','venganza','desquite','harto','harta','no aguanto','pelea','violencia'],
  miedo: ['miedo','terror','panico','sustos','asustado','asustada','tiemblo','nervios','no puedo dormir','pesadilla']
}

// ─── FUNCIÓN PRINCIPAL: analyzeText ─────────────────────────────
/**
 * @param {string} texto - Mensaje actual
 * @param {string} tipoViolencia - Selección manual (opcional)
 * @param {string} frecuencia - Selección manual (opcional)
 * @param {Array} historial - Mensajes previos del mismo estudiante (últimos 5)
 */
function analyzeText(texto, tipoViolencia = '', frecuencia = '', historial = []) {
  if (!texto || texto.trim().length < 3) {
    return { score: 0, nivel_riesgo: 'bajo', es_emergencia: false, keywords_detectadas: [], tipos_violencia: [], patrones: [], requiere_gemini: false, resumen: 'Texto insuficiente', sentimiento: 0 }
  }

  // Normalizar
  // Normalizar usando la función global definida al inicio del módulo
  const textoNorm = norm(texto)

  let score = 0
  let esEmergencia = false
  const keywordsDetectadas = []
  const tiposViolenciaDetectados = []
  const patronesDetectados = []
  
  // --- Análisis de Sentimiento ---
  let sentimentScore = 0
  for (const [sent, palabras] of Object.entries(SENTIMIENTOS)) {
    palabras.forEach(p => {
      if (textoNorm.includes(p)) sentimentScore -= 5
    })
  }

  // ── CAPA 1: Emergencias absolutas ────────────────────
  for (let i = 0; i < EMERGENCIAS_NORM.length; i++) {
    if (textoNorm.includes(EMERGENCIAS_NORM[i])) {
      esEmergencia = true
      keywordsDetectadas.push(EMERGENCIAS[i])
    }
  }

  if (esEmergencia) {
    return {
      score: 100, nivel_riesgo: 'alto', es_emergencia: true,
      keywords_detectadas: keywordsDetectadas, tipos_violencia: ['EMERGENCIA_CRITICA'],
      patrones: ['emergencia'], requiere_gemini: false,
      resumen: '🚨 EMERGENCIA: Riesgo inmediato detectado.', sentimiento: sentimentScore
    }
  }

  // ── CAPA 2: Diccionario Semántico ─────────────────────
  for (const [tipoKey, config] of Object.entries(DICCIONARIO)) {
    let tipoEncontrado = false
    const palabrasNorm = config.palabrasNorm

    for (let i = 0; i < palabrasNorm.length; i++) {
      if (textoNorm.includes(palabrasNorm[i])) {
        score += config.score
        keywordsDetectadas.push(config.palabras[i])
        tipoEncontrado = true
        break 
      }
    }

    if (tipoEncontrado) {
      let count = 0
      for (let i = 0; i < palabrasNorm.length; i++) {
        if (textoNorm.includes(palabrasNorm[i])) {
          count++
          if (count > 1) score += Math.floor(config.score * 0.3)
          if (!keywordsDetectadas.includes(config.palabras[i])) keywordsDetectadas.push(config.palabras[i])
        }
      }
      tiposViolenciaDetectados.push(tipoKey)
    }
  }

  // ── CAPA 3: Patrones contextuales ─────────────────────
  for (const patron of PATRONES) {
    if (patron.regex.test(texto)) {
      score += patron.bonus
      patronesDetectados.push(patron.tipo)
    }
  }

  // ── CAPA 4: MEMORIA DE CORTO PLAZO (Escalación) ───────
  const numReportes = historial.length
  if (numReportes > 0) {
    // 1. Bonus por reincidencia
    score += (numReportes * 10) 
    
    // 2. Detección de escalación emocional (Sentimiento persistente)
    const sentimentHistorial = historial.reduce((acc, h) => {
        let hScore = 0
        Object.values(SENTIMIENTOS).flat().forEach(p => { if(norm(h).includes(p)) hScore -= 5 })
        return acc + hScore
    }, 0) / numReportes

    if (sentimentHistorial < -10) {
        score += 15
        patronesDetectados.push('tristeza_persistente')
    }

    // 3. Acoso Gradual (Mismo mensaje o keywords repetidas)
    historial.forEach(h => {
        if (norm(h) === textoNorm) score += 20 // Repititividad exacta
    })
  }

  // ── Bonus por frecuencia/tipo declarado ──────────
  if (frecuencia === 'todos_los_dias') score += 20
  const tiposAltoRiesgo = ['amenazas', 'agresion_fisica', 'acoso_sexual', 'violencia_familiar']
  if (tiposAltoRiesgo.includes(tipoViolencia)) score += 15

  // Normalizar
  score = Math.min(Math.round(score), 100)

  // Nivel de riesgo
  let nivel_riesgo = 'bajo'
  if (score >= 67) nivel_riesgo = 'alto'
  else if (score >= 34) nivel_riesgo = 'medio'

  return {
    score, nivel_riesgo, es_emergencia: false,
    keywords_detectadas: [...new Set(keywordsDetectadas)].slice(0, 10),
    tipos_violencia: [...new Set(tiposViolenciaDetectados)],
    patrones: patronesDetectados,
    requiere_gemini: score >= 30 && score < 67, // FIX M-2: era <= 68; evitamos llamar Gemini para niveles 'alto' ya confirmados
    resumen: `Score: ${score}/100 | Contexto: ${numReportes} msgs | Nivel: ${nivel_riesgo.toUpperCase()}`,
    sentimiento: sentimentScore
  }
}

// ─────────────────────────────────────────────────────────────

module.exports = { analyzeText, DICCIONARIO, PATRONES }
