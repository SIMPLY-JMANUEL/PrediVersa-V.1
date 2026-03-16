import { useState, useEffect, useRef, useCallback } from 'react'
import './ChatbotVersa.css'

const API = 'http://localhost:5000/api/chatbot'
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// ── OPCIONES (máx 4 por pantalla) ───────────────
const MENU_INICIAL = [
  { label: '😊 Estoy bien', value: 'bien' },
  { label: '😔 No estoy muy bien', value: 'no_bien' },
  { label: '🆘 Necesito ayuda ahora', value: 'urgente' },
]

const MENU_TEMAS = [
  { label: '🤝 Problema con un compañero/a', value: 'problema_compañero' },
  { label: '🚨 Quiero reportar violencia', value: 'violencia' },
  { label: '🏠 Algo difícil en mi casa', value: 'violencia_familiar' },
  { label: '📱 Me acosan por redes', value: 'ciberbullying' },
  { label: '💔 Problemas con mi pareja', value: 'violencia_pareja' },
  { label: '🚬 Drogas o pandillas', value: 'pandillas' },
  { label: '👩‍🏫 Hablar con orientador/a', value: 'orientador' },
  { label: '💬 Solo quiero desahogarme', value: 'desahogo' },
]

const TIPOS_VIOLENCIA = [
  { label: '👊 Agresión física', value: 'agresion_fisica' },
  { label: '🗣️ Insultos o burlas', value: 'bullying' },
  { label: '🚫 Me excluyen', value: 'exclusion' },
  { label: '⚠️ Amenazas', value: 'amenazas' },
  { label: '🔒 Acoso sexual', value: 'acoso_sexual' },
  { label: '❓ No sé qué tipo es', value: 'otro' },
]

const FRECUENCIAS = [
  { label: 'Una sola vez', value: 'una_vez' },
  { label: 'Varias veces', value: 'varias_veces' },
  { label: 'Todos los días', value: 'todos_los_dias' },
]

export default function ChatbotVersa({ user }) {
  const [messages, setMessages] = useState([])
  const [estado, setEstado] = useState('inicio')
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [opciones, setOpciones] = useState([])
  const [inputDisabled, setInputDisabled] = useState(true)
  const [nivelRiesgo, setNivelRiesgo] = useState(null)
  const [scoreActual, setScoreActual] = useState(null)

  const datos = useRef({
    userMessage: '', tipoViolencia: '', frecuencia: '',
    keywords: [], tiposDetectados: [], nombre: '', fecha: '',
    nivelPendiente: null,  // nivel detectado, esperando fin de conversación
    alertaEnviada: false,  // evitar doble envío
  })
  const initialized = useRef(false)
  const endRef = useRef(null)
  const textareaRef = useRef(null)

  const primerNombre = user?.name ? user.name.split(' ')[0] : null

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    iniciar()
  }, []) // eslint-disable-line

  // ── HELPERS ──────────────────────────────────────────────────
  const addBot = useCallback((text) => {
    setMessages((p) => [...p, { id: Date.now() + Math.random(), type: 'bot', text, time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }])
  }, [])

  const addUser = useCallback((text) => {
    setMessages((p) => [...p, { id: Date.now() + Math.random(), type: 'user', text, time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }])
  }, [])

  const versa = useCallback(async (text, ms = 900) => {
    setIsTyping(true)
    await delay(ms)
    setIsTyping(false)
    addBot(text)
  }, [addBot])

  // ── INICIO ───────────────────────────────────────────────────
  const iniciar = async () => {
    setInputDisabled(true)
    const saludo = primerNombre
      ? `👋 Hola, <b>${primerNombre}</b>. Soy <b>Versa</b>. Cuéntame, ¿cómo te sientes hoy o hay algo que te preocupe? ✍️`
      : '👋 Hola. Soy <b>Versa</b>, tu asistente de PrediVersa. Cuéntame, ¿cómo estás o hay algo que te preocupe? ✍️'
    await versa(saludo, 1200)
    setEstado('menu_principal') // Estado abierto para recibir cualquier texto
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  // ── FLUJOS ───────────────────────────────────────────────────
  const handleBien = async () => {
    setInputDisabled(true)
    await versa('¡Me alegra muchísimo saberlo! 😊 Recuerda que aquí estaré si en algún momento necesitas desahogarte o contarme algo.', 800)
    setEstado('inicio_abierto')
    setInputDisabled(false)
  }

  const handleNoMuyBien = async () => {
    setInputDisabled(true)
    await versa('Lamento leer eso... 💙 A veces hay días pesados y es normal no sentirse del todo bien.', 800)
    await delay(500)
    await versa('Si te sientes cómodo/a, me gustaría escucharte. ¿Pasó algo en particular hoy o es algo que vienes sintiendo hace días?', 1000)
    setEstado('indagacion_inicial')
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const despuesIndagacionInicial = async (txt) => {
    setInputDisabled(true)
    await versa('Entiendo. Gracias por tener la confianza de compartirlo conmigo. A veces poner las cosas en palabras ayuda a aliviar un poco la carga. 🫂', 800)
    await delay(500)
    await versa('Para poder entenderte mejor, cuéntame un poco más de los detalles de lo que está sucediendo. Aquí nadie te juzgará.', 1000)
    setEstado('reporte_desc')
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const handleUrgente = async () => {
    setInputDisabled(true)
    await versa('Entiendo que es urgente. Por favor, escribe aquí mismo lo que sucede para poder ayudarte lo más rápido posible. 🚨', 500)
    setEstado('urgente_descripcion')
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const irAReporte = async () => {
    setInputDisabled(true)
    await versa('¿Qué tipo de situación es la que te preocupa?', 700)
    setOpciones(TIPOS_VIOLENCIA)
    setEstado('reporte_tipo')
  }

  const handleTipoViolencia = async (opcion) => {
    datos.current.tipoViolencia = opcion.value
    addUser(opcion.label)
    setInputDisabled(true)
    await versa('¿Cada cuánto está pasando esto?', 600)
    setOpciones(FRECUENCIAS)
    setEstado('reporte_frecuencia')
  }

  const handleFrecuencia = async (opcion) => {
    datos.current.frecuencia = opcion.value
    addUser(opcion.label)
    setInputDisabled(true)
    await versa('Entiendo. Cuéntame los detalles de lo que está sucediendo. ✍️', 600)
    setEstado('reporte_desc')
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const irAContexto = async (tipo, prompt) => {
    datos.current.tipoViolencia = tipo
    setInputDisabled(true)
    await versa(prompt, 800)
    setEstado(`${tipo}_descripcion`)
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const irAOrientador = async () => {
    setInputDisabled(true)
    await versa('¿Quieres ver los datos de contacto o prefieres agendar una cita?', 700)
    setOpciones([
      { label: '📞 Ver contacto', value: 'contacto' },
      { label: '📅 Solicitar cita', value: 'reunion' },
      { label: '🏠 Menú principal', value: 'menu' },
    ])
    setEstado('escalar')
    setInputDisabled(true)
  }

  const mostrarContacto = async () => {
    setInputDisabled(true)
    await versa('📧 orientacion@prediversa.edu\n📱 +57 300 000 0000\n🕐 Lun–Vie 8am–4pm\n📍 Oficina de Orientación', 900)
    setOpciones([{ label: '📅 Solicitar cita', value: 'reunion' }, { label: '🏠 Volver', value: 'menu' }])
    setInputDisabled(true)
  }

  const irAReunion = async () => {
    setInputDisabled(true)
    await versa('¿Cómo te llamas completo?', 700)
    setEstado('reunion_nombre')
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const handleNombreReunion = async (nombre) => {
    datos.current.nombre = nombre
    await versa('¿Para qué día y hora te gustaría la cita?', 700)
    setEstado('reunion_fecha')
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const handleFechaReunion = async (fecha) => {
    datos.current.fecha = fecha
    try {
      await fetch(`${API}/reunion`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estudiante_id: user?.documentId || user?.id || 'anonimo', nombre: datos.current.nombre, fecha, motivo: 'Solicitud desde Versa' }) })
    } catch (e) { /* silent */ }
    await versa(`✅ Cita solicitada para: ${fecha}.\nEl orientador te confirmará pronto. 📅`, 1000)
    setOpciones([{ label: '🏠 Volver', value: 'menu' }])
    setInputDisabled(true)
  }

  const irAInformacion = async () => {
    setInputDisabled(true)
    await versa('📚 Recuerda: Tienes derecho a ser protegido contra toda forma de violencia. El colegio es un espacio seguro para ti.', 1000)
    setOpciones([{ label: '🚨 Reportar algo', value: 'violencia' }, { label: '🏠 Menú', value: 'menu' }])
    setEstado('informacion')
    setInputDisabled(true)
  }

  const mostrarMenu = async () => {
    setNivelRiesgo(null)
    setScoreActual(null)
    datos.current = { userMessage: '', tipoViolencia: '', frecuencia: '', keywords: [], tiposDetectados: [], nombre: '', fecha: '' }
    await versa('¿En qué más te puedo ayudar?', 500)
    setOpciones(MENU_TEMAS)
    setEstado('menu_principal')
    setInputDisabled(false)
  }

  const terminar = async () => {
    setEstado('fin')
    setOpciones([])
    setInputDisabled(true)
    await versa(`Ha sido un gusto hablar contigo, ${primerNombre || ''}. Recuerda que no estás solo/a. 💙`, 800)
  }

  // ── MOTOR IA ─────────────────────────────────────────────────
  const analizarRiesgo = async (mensaje) => {
    setInputDisabled(true)
    setOpciones([])
    setEstado('analizando')
    setIsTyping(true)

    try {
      const res = await fetch(`${API}/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, tipo_violencia: datos.current.tipoViolencia, frecuencia: datos.current.frecuencia, estudiante_id: user?.documentId || user?.id || 'anonimo' }),
      })
      const data = await res.json()
      setIsTyping(false)

      const nivel = data?.data?.nivel_riesgo || 'medio'
      const keywords = data?.data?.keywords_encontradas || []
      const score = data?.data?.score || 0

      datos.current.keywords = keywords
      datos.current.tiposDetectados = data?.data?.tipos_violencia || []
      datos.current.userMessage = mensaje
      setNivelRiesgo(nivel)
      setScoreActual(score)

      // ALERTA AUTOMÁTICA E INMEDIATA (Sin confirmación)
      if (nivel === 'alto' || nivel === 'medio') {
        const payload = {
          estudiante_id: user?.documentId || user?.id || 'anonimo',
          nombre: user?.name || 'Anónimo',
          descripcion: mensaje,
          tipo_violencia: datos.current.tipoViolencia,
          frecuencia: datos.current.frecuencia,
          nivel_riesgo: nivel,
          keywords: keywords,
          keywords_criticas: { keywords_encontradas: keywords },
          prioridad: nivel === 'alto' ? 'URGENTE' : 'NORMAL',
          resumen_patron: `Tipos: ${data?.data?.tipos_violencia?.join(', ')}`,
        }

        const endpoint = nivel === 'alto' ? '/alerta' : '/reporte'
        await fetch(`${API}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        console.log(`📡 Alerta automática [${nivel.toUpperCase()}] enviada al admin inmediatamente`)
        
        if (nivel === 'alto') await responderAlto()
        else await responderMedio()
      } else {
        // Conversación dinámica IA para riego bajo o charla natural
        await responderConversacional(mensaje, nivel)
      }
    } catch {
      setIsTyping(false)
      setNivelRiesgo('medio')
      await responderConversacional(mensaje, 'medio')
    }
  }

  // ── RESPUESTAS ───────────────────────────────────────────────
  const responderConversacional = async (mensaje, nivel) => {
    setIsTyping(true)
    try {
      // Tomamos últimos 6 mensajes del historial
      const historialReciente = messages.slice(-6).map(m => ({ text: m.text, type: m.type }));
      
      const res = await fetch(`${API}/chat-ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, nivelRiesgo: nivel, historial: historialReciente }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.success && data.respuesta) {
        await versa(data.respuesta, 500);
      } else {
        // Fallback natural
        await versa('Entiendo perfectamente cómo te sientes. 💙 A veces las cosas diarias nos frustran. Aquí cuentas conmigo.', 900);
      }
      
      // Mantenemos el input abierto para que siga conversando libremente
      setEstado('inicio_abierto');
      setInputDisabled(false);
      textareaRef.current?.focus();
    } catch(e) {
      setIsTyping(false);
      await versa('Te entiendo, a veces es difícil poner esto en palabras. Aquí estaré para cuando quieras hablar. 💙', 900);
      setEstado('inicio_abierto');
      setInputDisabled(false);
    }
  }


  const responderMedio = async () => {
    setEstado('medio_indagacion_1')
    await versa('Gracias por tu valentía al contarme esto. 💙 Escucharlo me hace pensar en lo difícil que debe ser para ti afrontar esto en el colegio.', 1000)
    await delay(600)
    await versa('¿Hay alguien más en el colegio (un amigo o profesor) que sepa de esto o soy la primera persona a la que le cuentas?', 900)
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const medioIndagacion2 = async () => {
    setEstado('medio_indagacion_2')
    setInputDisabled(true)
    await versa('Comprendo totalmente. Es normal sentirse así de abrumado/a y tener miedo o recelo de hablarlo con otros. 🫂', 1000)
    await delay(500)
    await versa('Quería preguntarte... ¿cómo te ha estado afectando esto en tu sueño, tu apetito o en tus clases estos últimos días?', 1000)
    setInputDisabled(false)
    textareaRef.current?.focus()
  }

  const medioCierre = async () => {
    setEstado('riesgo_medio')
    setInputDisabled(true)
    await versa('Te escucho y de verdad quiero ayudarte. Nadie debería tener que cargar con ese peso en soledad. 💙', 900)
    await delay(500)
    await versa('He guardado esto de forma confidencial. Para poder darte un apoyo real y ayudarte a que la situación mejore, me gustaría muchísimo que conectaras con nuestro equipo de orientación. Son súper comprensivos. ¿Te animarías?', 1200)
    setOpciones([
      { label: '👩‍🏫 Sí, quiero hablar con ellos', value: 'orientador' },
      { label: '🤔 Aún no estoy seguro/a', value: 'duda_orientador' },
      { label: '🏠 Prefiero no hacerlo hoy', value: 'fin' }
    ])
  }

  const dudaOrientador = async () => {
    setInputDisabled(true)
    await versa('Es súper válido tener dudas. 💙 Te prometo que hablar con ellos no te meterá en problemas, su único trabajo es escucharte y buscar formas de que te sientas seguro/a y tranquilo/a en el colegio.', 1200)
    await delay(400)
    await versa('¿Te animas a ver sus datos de contacto por si decides escribirles luego una vez te sientas listo/a, o prefieres que agendemos una cita directamente?', 1000)
    setOpciones([
      { label: '📞 Ver contacto', value: 'contacto' },
      { label: '📅 Solicitar cita', value: 'reunion' },
      { label: '🏠 Mejor en otro momento', value: 'fin' }
    ])
  }

  const responderAlto = async () => {
    setEstado('alto_indagacion')
    await versa('Lo que me cuentas es muy doloroso e importante. Siento mucho de corazón que estés pasando por una situación tan difícil. 💙 No estás solo/a en esto.', 1000)
    await delay(500)
    await versa('Quiero asegurarme de que estás a salvo en este instante. ¿Estás en un lugar seguro ahora mismo?', 800)
    setOpciones([
      { label: '✅ Sí, estoy a salvo', value: 'escalar_seguro' },
      { label: '😰 No me siento seguro/a', value: 'escalar_urgente' },
    ])
    setInputDisabled(true)
  }

  const responderAltoContinuacion = async (seguro) => {
    setInputDisabled(true)
    if (!seguro) {
      await versa('Por favor, busca a un adulto de confianza inmediatamente o contacta a las líneas de emergencia (123). Tu seguridad es lo más importante en este instante. 💙', 1000)
    } else {
      await versa('Me da mucha tranquilidad saber que estás en un sitio seguro temporalmente. 💙', 700)
      await delay(500)
      await versa('Debido a la situación que me cuentas, he activado una alerta silenciosa y prioritaria en el colegio para poder intervenir a tiempo y protegerte. ¿Podrías decirme si alguien más corre peligro en este momento?', 1000)
      setEstado('alto_indagacion_2')
      setInputDisabled(false)
      textareaRef.current?.focus()
      return;
    }
    await delay(300)
    await altoCierre()
  }

  const altoCierre = async () => {
    setEstado('riesgo_alto')
    setInputDisabled(true)
    await versa('Gracias por decírmelo. Eres tremendamente valiente. 🫂', 800)
    await delay(500)
    await versa('El equipo de bienestar psicosocial ya está al tanto de tu reporte con prioridad máxima. Mientras ellos actúan, me gustaría dejarte los números de contacto para hablar directamente con nuestra psicóloga. Tu bienestar es nuestra única prioridad. 💙', 1200)
    setOpciones([
      { label: '📅 Solicitar Cita Urgente', value: 'reunion' },
      { label: '📞 Ver Contacto Directo', value: 'contacto' }
    ])
  }

  // ── DISPATCHER ───────────────────────────────────────────────
  const handleOpcion = async (opcion) => {
    setOpciones([])
    addUser(opcion.label)
    if (estado === 'reporte_tipo') return handleTipoViolencia(opcion)
    if (estado === 'reporte_frecuencia') return handleFrecuencia(opcion)
    setInputDisabled(true)

    switch (opcion.value) {
      case 'bien':              return handleBien()
      case 'no_bien':           return handleNoMuyBien()
      case 'urgente':           return handleUrgente()
      case 'menu_temas':        return handleNoMuyBien()
      case 'problema_compañero':return irAContexto('problema', 'Cuéntame qué está pasando con tu compañero/a. ✍️')
      case 'violencia':         return irAReporte()
      case 'violencia_familiar':return irAContexto('violencia_familiar', '¿Qué sucede en tu casa? Recuerda que es confidencial. ✍️')
      case 'ciberbullying':     return irAContexto('ciberbullying', '¿Por qué red social te están molestando y qué dicen? ✍️')
      case 'violencia_pareja':  return irAContexto('violencia_pareja', '¿Cómo te sientes en tu relación? Cuéntame qué ha pasado. ✍️')
      case 'pandillas':         return irAContexto('pandillas', '¿Te sientes presionado/a por alguien? Cuéntame los detalles. ✍️')
      case 'desahogo':          return irAContexto('desahogo', 'Suéltalo todo, aquí nadie te juzga. ✍️')
      case 'orientador':        return irAOrientador()
      case 'informacion':       return irAInformacion()
      case 'contacto':          return mostrarContacto()
      case 'reunion':           return irAReunion()
      case 'menu':              return mostrarMenu()
      case 'fin':               return terminar()
      case 'duda_orientador':   return dudaOrientador()
      case 'escalar_seguro':    return responderAltoContinuacion(true)
      case 'escalar_urgente':   return responderAltoContinuacion(false)
      default: break
    }
  }

  // ── MANEJO DE TEXTO ──────────────────────────────────────────
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const txt = inputValue.trim();
    addUser(txt);
    setInputValue('');
    setInputDisabled(true);

    if (estado === 'reunion_nombre') return handleNombreReunion(txt);
    if (estado === 'reunion_fecha') return handleFechaReunion(txt);
    
    if (estado === 'indagacion_inicial') return despuesIndagacionInicial(txt);
    if (estado === 'medio_indagacion_1') return medioIndagacion2();
    if (estado === 'medio_indagacion_2') return medioCierre();
    if (estado === 'alto_indagacion_2') return altoCierre();

    if (estado === 'reporte_desc' || estado === 'urgente_descripcion' || estado.includes('_descripcion')) {
      datos.current.userMessage = txt;
      return analizarRiesgo(txt);
    }
    
    return detectarIntencion(txt);
  }

  const detectarIntencion = async (t) => {
    const txt = t.toLowerCase()
    
    // 1. PRIMERA CAPA: Filtro de emergencia absoluta y rápida
    if (txt.length > 15 || /pega|violen|amenaza|triste|muert|abus|toca|paila|casca/.test(txt)) {
      console.log("🔍 Análisis proactivo detectado por contenido del mensaje");
      return analizarRiesgo(t); // Delega la carga pesada a la API predictiva
    }

    // 2. SEGUNDA CAPA: Navegación simple y fluida sin sobrecargar motor IA
    if (/bien|feliz|genial|chévere|contento|buen/.test(txt)) return handleBien()
    if (/urgente|emergencia|peligro|ayuda|ahora|auxilio/.test(txt)) return handleUrgente()
    if (/casa|familia|papá|mamá|padrastro|madrastra|tío|tía|primo|prima/.test(txt)) return irAContexto('violencia_familiar', '¿Qué sucede en tu hogar? Puedes contarme con total confianza. ✍️')
    if (/redes|instagram|tiktok|whatsapp|internet|foto|video|mensaje/.test(txt)) return irAContexto('ciberbullying', '¿Cómo te están molestando por internet? Es importante saber qué redes usan. ✍️')
    if (/novio|novia|pareja|ex/.test(txt)) return irAContexto('violencia_pareja', '¿Cómo es tu relación? ¿Sientes que te respetan? ✍️')
    if (/pandilla|droga|banda|parche|sustancia|vicio/.test(txt)) return irAContexto('pandillas', '¿Te sientes presionado/a por algún grupo? Cuéntame los detalles. ✍️')
    if (/violencia|golpe|amenaza|bullying|pegan|empujan|insultos|burlas/.test(txt)) return irAReporte()
    if (/orientador|orientadora|psicologo|psicologa|cita|hablar con/.test(txt)) return irAOrientador()
    if (/derechos|no me dejan|discriminacion|raza|genero|orientacion/.test(txt)) return irAContexto('derechos', '¿Sientes que no están respetando tus derechos o quién eres? Cuéntame más. ✍️')
    if (/comida|hambre|solo|sola|no me cuidan|negligencia/.test(txt)) return irAContexto('negligencia', '¿Sientes que te falta apoyo o cuidado en casa o en el colegio? ✍️')
    if (/triste|lloro|ganas de morir|solo|ayuda|mal/.test(txt)) return irAContexto('emocional', 'Lamento que te sientas así. 💙 Por favor, dime qué te tiene así de triste. ✍️')
    
    // 3. CAPA FINAL: Si es texto conversacional pero no encaja arriba, se fuerza el pase por el Motor Predictivo
    // para capturar sentimientos sutiles o lenguaje coloquial con historial.
    datos.current.userMessage = t;
    return analizarRiesgo(t);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const getBadge = () => {
    if (nivelRiesgo === 'alto') return { cls: 'badge-alto', ico: '🚨', label: 'Riesgo Alto' }
    if (nivelRiesgo === 'medio') return { cls: 'badge-medio', ico: '⚠️', label: 'Riesgo Medio' }
    if (nivelRiesgo === 'bajo') return { cls: 'badge-bajo', ico: '✅', label: 'Riesgo Bajo' }
    return null
  }
  const badge = getBadge()

  return (
    <div className="versa-wrapper">

      {/* ── HEADER ── */}
      <div className="versa-header">
        <div className="versa-header-left">
          <div className="versa-avatar"><span>V</span></div>
          <div>
            <div className="versa-name">Versa <span className="versa-tag">PrediVersa</span></div>
            <div className="versa-status">
              <span className="v-dot" />
              {isTyping ? 'Escribiendo...' : 'En línea · Confidencial'}
            </div>
          </div>
        </div>
        {badge && (
          <div className={`versa-badge ${badge.cls}`}>
            {badge.ico} {badge.label}
            {scoreActual !== null && <span className="v-score">{scoreActual}/100</span>}
          </div>
        )}
      </div>

      {/* ── MENSAJES ── */}
      <div className="versa-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`v-row ${msg.type}`}>
            {msg.type === 'bot' && <div className="v-av"><span>V</span></div>}
            <div className={`v-bubble ${msg.type}`}>
              <div className="v-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
              <span className="v-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="v-row bot">
            <div className="v-av"><span>V</span></div>
            <div className="v-bubble bot v-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── OPCIONES ── */}
      {opciones.length > 0 && (
        <div className="versa-options">
          {opciones.map((op, i) => (
            <button key={i} id={`v-op-${i}`} className="v-btn" onClick={() => handleOpcion(op)} disabled={isTyping}>
              {op.label}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT ── */}
      <div className="versa-input-row">
        <textarea
          ref={textareaRef}
          id="versa-input"
          className="v-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputDisabled ? 'Elige una opción...' : `Escribe aquí...`}
          disabled={inputDisabled}
          rows={1}
        />
        <button id="v-send" className="v-send" onClick={handleSend} disabled={inputDisabled || !inputValue.trim() || isTyping}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="v-foot">🔒 Todo lo que compartes es confidencial</div>
    </div>
  )
}
