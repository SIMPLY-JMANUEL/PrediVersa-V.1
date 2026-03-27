import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { apiFetch } from '../utils/api'
import './AmazonLexChat.css'

function AmazonLexChat({ user }) {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hola ${user?.name || 'Estudiante'}, soy tu Asistente Versa. ¿En qué puedo apoyarte hoy?`, sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const data = await apiFetch('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ 
          text: input,
          sessionId: user?.id || 'anonimo'
        })
      })
      
      if (data.success) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: data.botResponse || 'Recibí tu mensaje, estoy analizando la situación.', 
          sender: 'bot' 
        }])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error Lex/Versa:', error)
      const errorMsg = error.message.includes('Fetch') 
        ? 'Error de conexión con el servidor. Por favor, verifica tu conexión o intenta más tarde. 🌐'
        : 'Sistemas en actualización. El Asistente Versa está optimizando su Motor de Riesgo. Intenta en un momento. 🛡️';
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 2, 
        text: errorMsg, 
        sender: 'bot' 
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="lex-chat-container">
      <div className="lex-chat-header">
        <Bot size={24} />
        <div>
          <h4 style={{ margin: 0 }}>PrediVersa Assistant</h4>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Apoyo Pedagógico y Bienestar IA</span>
        </div>
      </div>

      <div className="lex-chat-messages" ref={messagesContainerRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`lex-message ${msg.sender}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {msg.sender === 'bot' ? 'PrediVersa Assistant' : 'Tú'}
              </span>
            </div>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="lex-typing">
            <Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: '5px' }} />
            Versa está analizando tu mensaje...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="lex-chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          className="lex-input" 
          placeholder="Escribe aquí tu consulta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={scrollToBottom}
          disabled={isTyping}
        />
        <button type="submit" className="lex-send-btn" disabled={isTyping}>
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default AmazonLexChat
