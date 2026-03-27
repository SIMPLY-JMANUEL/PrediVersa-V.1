import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2"
import './Chatbot.css'

/**
 * PrediVersa Chatbot - Diseño "Composer" (Inspirado en el diseño solicitado)
 * Conectado Nativamente a Amazon Lex V2 bajo el Bot ID: DERGWSU1C8
 */
function Chatbot({ isAuthenticated, isLoginOpen, user }) {
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente de PrediVersa. ¿Cómo puedo ayudarte hoy?', type: 'bot' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(`session-${Math.random().toString(36).substring(7)}`)
  
  const messagesEndRef = useRef(null)
  const location = useLocation()

  // Configuración de AWS Lex
  const client = new LexRuntimeV2Client({
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Lógica de visibilidad exclusiva para el Dashboard del Estudiante
  const isStudentRoute = location.pathname === '/student'
  if (!isStudentRoute || !isAuthenticated || isLoginOpen) return null

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || loading) return

    const userText = inputValue
    setMessages(prev => [...prev, { id: Date.now(), text: userText, type: 'user' }])
    setInputValue('')
    setLoading(true)

    try {
      const command = new RecognizeTextCommand({
        botId: import.meta.env.VITE_LEX_BOT_ID,
        botAliasId: import.meta.env.VITE_LEX_BOT_ALIAS_ID,
        localeId: import.meta.env.VITE_LEX_LOCALE_ID || "es_419",
        sessionId: sessionId,
        text: userText,
      })

      const response = await client.send(command)
      
      if (response.messages && response.messages.length > 0) {
        response.messages.forEach((msg, index) => {
          setMessages(prev => [...prev, { 
            id: Date.now() + index + 1, 
            text: msg.content, 
            type: 'bot' 
          }])
        })
      }
    } catch (error) {
      console.error("Error conectando con Lex:", error)
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Hubo un problema de conexión. Inténtalo de nuevo.", 
        type: 'bot' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot-wrapper bpContainer">
      {/* Cabecera del Bot Container */}
      <div className="flex flex-col items-center gap-4 !mb-4 _container_1juhe_2">
        <span className="text-xl font-bold mt-4" style={{ color: '#3b82f6' }}>Mi Amigo Predi</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message bot italic">Predi está respondiendo...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-composer-container">
        <div className="chat-input-wrapper">
          {/* Botón de subida (Icono de clip de tu código) */}
          <button className="icon-button" title="Subir archivo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload">
              <path d="M12 13v8"></path>
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
              <path d="m8 17 4-4 4 4"></path>
            </svg>
          </button>

          <textarea 
            placeholder="Escribe tu mensaje aquí..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />

          {/* Botón de micrófono de tu código */}
          <button className="icon-button" title="Mensaje de voz">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic">
              <path d="M12 19v3"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <rect x="9" y="2" width="6" height="13" rx="3"></rect>
            </svg>
          </button>

          {/* Botón de enviar flecha arriba de tu código */}
          <button 
            className="icon-button send-button" 
            onClick={handleSend}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up">
              <path d="m5 12 7-7 7 7"></path>
              <path d="M12 19V5"></path>
            </svg>
          </button>
        </div>
        <p className="powered-by">Chat Interactivo con Inteligencia Artificial de <span>PrediVersa</span></p>
      </div>
    </div>
  )
}

export default Chatbot
