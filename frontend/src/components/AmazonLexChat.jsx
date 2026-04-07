import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Mic, MicOff, Smile, HeartHandshake } from 'lucide-react'
import { apiFetch } from '../utils/api'
import '../styles/components/AmazonLexChat.css'

function AmazonLexChat({ user }) {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hola ${user?.name || 'Estudiante'}, soy tu Asistente Virtual Versa. ¿Cómo estás hoy?`, sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [botEmotion, setBotEmotion] = useState('smile') // smile, thinking, empathetic
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const toggleListening = () => {
    if (!recognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Intenta usar Google Chrome.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = 'es-CO';
      recognition.interimResults = false;
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

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

  // Mantener el cursor siempre en el input cuando no esté cargando
  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      setBotEmotion('thinking');

      const historialReducido = messages.slice(-6).map(m => ({
        text: m.text, type: m.sender
      }));

      const data = await apiFetch('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          text: input,
          sessionId: user?.id || 'anonimo',
          historial: historialReducido
        })
      })

      if (data.success) {
        setBotEmotion(['alto', 'medio'].includes(data.risk?.level) ? 'empathetic' : 'smile');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="bot-avatar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderRadius: '50%', padding: '8px', transition: 'all 0.3s' }}>
            {botEmotion === 'thinking' ? <Loader2 size={24} color="#3b82f6" className="animate-spin" /> :
              botEmotion === 'empathetic' ? <HeartHandshake size={24} color="#ec4899" /> :
                <Smile size={24} color="#10b981" />}
          </div>
          <div>
            <h4 style={{ margin: 0 }}>Versa Asistente Virtual</h4>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Apoyo Pedagógico y Bienestar IA</span>
          </div>
        </div>
      </div>

      <div className="lex-chat-messages" ref={messagesContainerRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`lex-message ${msg.sender}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {msg.sender === 'bot' ? 'Versa Asistente Virtual' : 'Tú'}
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
        <button
          type="button"
          className={`lex-mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title="Dictar mensaje por voz"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', outline: 'none' }}
        >
          {isListening ? <MicOff size={20} color="#ef4444" className="animate-pulse" /> : <Mic size={20} color="#64748b" />}
        </button>
        <input
          ref={inputRef}
          type="text"
          className="lex-input"
          placeholder="Escribe o dicta tu consulta..."
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
