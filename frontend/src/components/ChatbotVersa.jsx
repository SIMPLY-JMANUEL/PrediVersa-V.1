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
    await versa('Lamento que no estés del todo bien. 💙 Por favor, cuéntame con confianza qué está pasando, te escucho.', 700)
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
        await responderBajo()
      }
    } catch {
      setIsTyping(false)
      setNivelRiesgo('medio')
      await responderMedio()
    }
  }

  // ── RESPUESTAS ───────────────────────────────────────────────
  const responderBajo = async () => {
    setEstado('riesgo_bajo')
    await versa('Gracias por informarme. 💙 He tomado nota de lo que me dijiste. ¿Quieres que hablemos con el equipo de orientación?', 900)
    setOpciones([
      { label: '👩‍🏫 Sí, me gustaría', value: 'orientador' },
      { label: '🏠 No, está bien así', value: 'fin' },
    ])
    setInputDisabled(true)
  }

  const responderMedio = async () => {
    setEstado('riesgo_medio')
    await versa('Gracias por tu valentía al contarme esto. 💙 Ya he informado al equipo de bienestar del colegio para que podamos apoyarte de forma privada. No estás solo/a.', 1000)
    setOpciones([
      { label: '👩‍🏫 Contactar orientador ahora', value: 'orientador' },
      { label: '🏠 Volver', value: 'menu' },
    ])
    setInputDisabled(true)
  }

  const responderAlto = async () => {
    setEstado('riesgo_alto')
    await versa('🚨 He recibido tu mensaje y es muy importante. Ya activé una alerta prioritaria en el sistema para que recibas ayuda lo más pronto posible.', 1000)
    await delay(500)
    await versa('¿Estás en un lugar seguro en este momento?', 800)
    setOpciones([
      { label: '✅ Sí, estoy a salvo', value: 'escalar_seguro' },
      { label: '😰 No me siento seguro/a', value: 'escalar_urgente' },
    ])
    setInputDisabled(true)
  }

  const responderAltoContinuacion = async (seguro) => {
    setInputDisabled(true)
    if (!seguro) {
      await versa('Por favor, busca a un adulto de confianza o contacta a las líneas de emergencia (123). Un profesional del colegio ya está siendo notificado. 💙', 900)
    } else {
      await versa('Me alegra que estés seguro/a. Mantente así mientras el equipo revisa tu caso con prioridad máxima. 💙', 700)
    }
    await delay(300)
    await irAOrientador()
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
    if (estado === 'reporte_desc' || estado === 'urgente_descripcion' || estado.includes('_descripcion')) {
      datos.current.userMessage = txt;
      return analizarRiesgo(txt);
    }
    
    return detectarIntencion(txt);
  }

  const detectarIntencion = async (t) => {
    const txt = t.toLowerCase()
    
    // 1. PRIMERA CAPA: ¿Hay riesgo evidente en el mensaje inicial?
    if (txt.length > 15 || /pega|violen|amenaza|triste|muert|abus|toca|paila|casca/.test(txt)) {
      console.log("🔍 Análisis proactivo detectado por contenido del mensaje");
      return analizarRiesgo(t);
    }

    // 2. SEGUNDA CAPA: Detección de palabras clave para agrupar
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
    
    // Si no detecta nada claro, pasar al análisis profundo
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
