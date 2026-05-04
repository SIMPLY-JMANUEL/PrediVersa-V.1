import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';
import { BASE_URL } from '../../utils/api';

const InternalChat = ({ alertId, token, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/alerts/${alertId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling cada 5s para "tiempo real"
    return () => clearInterval(interval);
  }, [alertId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/alerts/${alertId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: newMessage })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>Chat de Colaboración Profesional</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '40px' }}>
            No hay mensajes aún. Use este espacio para coordinar la atención del estudiante.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>{msg.senderName} ({msg.senderRole})</span>}
                  <Clock size={10} color="#94a3b8" />
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isMe ? '#0c4a6e' : '#f1f5f9',
                  color: isMe ? '#fff' : '#334155',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} style={{ padding: '12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escriba un mensaje interno..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.82rem' }}
        />
        <button 
          disabled={loading}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0c4a6e', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default InternalChat;
