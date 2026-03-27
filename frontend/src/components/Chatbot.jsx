import { useState, useEffect, useRef } from 'react'
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2"
import './Chatbot.css'

/**
 * PrediVersa Chatbot - Integrado en Dashboard
 * Conectado Nativamente a Amazon Lex V2
 */
function Chatbot({ isAuthenticated, user }) {
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente de PrediVersa. ¿Cómo puedo ayudarte hoy?', type: 'bot' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(`session-${Math.random().toString(36).substring(7)}`)
  
  const messagesEndRef = useRef(null)

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

  if (!isAuthenticated) return null

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
        text: "Hubo un problema de conexión con Amazon Lex. Verifica tus credenciales en el archivo .env.", 
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
    <div className="chatbot-container-integrated">
      <div className="chat-messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble-wrapper ${msg.type === 'user' ? 'user-align' : 'bot-align'}`}>
            <div className={`chat-bubble ${msg.type}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="chat-bubble bot typing">Predi está procesando...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-composer">
        <div className="composer-input-group">
          <button className="composer-btn" title="Subir archivo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 13v8"></path><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="m8 17 4-4 4 4"></path></svg>
          </button>

          <textarea 
            placeholder="Escribe tu mensaje aquí..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />

          <button className="composer-btn" title="Voz">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19v3"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><rect x="9" y="2" width="6" height="13" rx="3"></rect></svg>
          </button>

          <button 
            className="composer-btn send-active" 
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
          </button>
        </div>
        <div className="composer-footer">
          Asistente Inteligente de <span>PrediVersa</span>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
