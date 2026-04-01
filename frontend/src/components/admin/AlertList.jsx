import React, { useState } from 'react';
import { AlertCircle, Clock, Shield, Search, Filter, MessageSquare, Tag, Eye } from 'lucide-react';

const AlertList = ({ alerts, loadingAlerts, onSelectAlert }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const esChatbot = (alert) =>
    alert.ticketNumber?.startsWith('CHT-') ||
    alert.description?.includes('[CHATBOT');

  const filtered = alerts.filter(a => {
    const isBot = esChatbot(a);
    const matchesFilter = 
      filter === 'all' ? true : 
      filter === 'chatbot' ? isBot : 
      !isBot;
    
    const matchesSearch = 
      a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  const getRiskColor = (type) => {
    if (type?.toLowerCase().includes('critica')) return 'bg-red-50 text-red-700 border-red-200';
    if (type?.toLowerCase().includes('advertencia')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const parseChatbotData = (desc) => {
    if (!desc || !desc.includes('[CHATBOT')) return null;
    const keywordsMatch = desc.match(/Keywords: (.*)/);
    const patternMatch = desc.match(/Patrón detectado: (.*)/);
    const tipoMatch = desc.match(/Tipo: (.*) \|/);
    
    return {
      keywords: keywordsMatch ? keywordsMatch[1].split(',').slice(0, 3) : [],
      pattern: patternMatch ? patternMatch[1] : null,
      tipo: tipoMatch ? tipoMatch[1] : 'No especificado'
    };
  };

  if (loadingAlerts) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="dot-online"></div>
      <p className="text-slate-400 font-bold animate-pulse">Sincronizando con Motor Versa...</p>
    </div>
  );

  const totalCriticas = alerts.filter(a => a.alertType === 'Critica').length;
  const totalChatbot = alerts.filter(esChatbot).length;

  return (
    <div className="alert-list-beast" style={{ padding: '1rem' }}>
      
      {/* ── Dashboard Stats Row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
        <div style={{ flex: 1, background: '#fee2e2', padding: '1.2rem', borderRadius: '16px', border: '1px solid #fecaca' }}>
          <div style={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px' }}>CASOS CRÍTICOS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#991b1b' }}>{totalCriticas}</div>
        </div>
        <div style={{ flex: 1, background: '#e0f2fe', padding: '1.2rem', borderRadius: '16px', border: '1px solid #bae6fd' }}>
          <div style={{ color: '#0369a1', fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px' }}>ALERTAS IA (CHATBOT)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0c4a6e' }}>{totalChatbot}</div>
        </div>
        <div style={{ flex: 1, background: '#f1f5f9', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px' }}>TOTAL ALERTAS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>{alerts.length}</div>
        </div>
      </div>

      <div className="alert-list-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-group" style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Buscar por estudiante o ticket..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
        
        <div className="filter-group" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button 
            onClick={() => setFilter('all')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', background: filter === 'all' ? '#fff' : 'transparent', color: filter === 'all' ? '#0ea5e9' : '#64748b', boxShadow: filter === 'all' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >Todos</button>
          <button 
            onClick={() => setFilter('chatbot')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', background: filter === 'chatbot' ? '#fff' : 'transparent', color: filter === 'chatbot' ? '#0ea5e9' : '#64748b', boxShadow: filter === 'chatbot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >🤖 Chatbot</button>
          <button 
            onClick={() => setFilter('manual')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', background: filter === 'manual' ? '#fff' : 'transparent', color: filter === 'manual' ? '#0ea5e9' : '#64748b', boxShadow: filter === 'manual' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >Manuales</button>
        </div>
      </div>

      <div className="alert-grid-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '20px', color: '#94a3b8' }}>
            <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No se encontraron alertas pendientes.</p>
          </div>
        ) : (
          filtered.map(alert => {
            const botData = parseChatbotData(alert.description);
            const isBot = !!botData;

            return (
              <div key={alert.id} 
                   className={`alert-card-beast ${alert.alertType.toLowerCase()}`}
                   style={{ 
                     background: '#fff', 
                     border: '1px solid #e2e8f0', 
                     borderRadius: '20px', 
                     padding: '20px', 
                     display: 'flex', 
                     flexDirection: 'column', 
                     gap: '15px',
                     boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                     transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                     position: 'relative',
                     borderLeft: `6px solid ${alert.alertType === 'Critica' ? '#ef4444' : alert.alertType === 'Advertencia' ? '#f59e0b' : '#10b981'}`
                   }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`alert-type-badge ${getRiskColor(alert.alertType)}`} style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.05em', border: '1px solid transparent' }}>
                      {alert.alertType?.toUpperCase()}
                    </span>
                    {isBot && (
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={10} /> FUENTE: VERSA AI
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>#{alert.ticketNumber}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{alert.studentName}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {isBot ? alert.description.split('Mensaje del estudiante:\n')[1]?.slice(0, 200) || alert.description.slice(0, 150) : alert.description.slice(0, 200)}
                  </p>
                </div>

                {isBot && botData.keywords.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Tag size={12} color="#94a3b8" />
                    {botData.keywords.map((k, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', fontWeight: '700', color: '#334155', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{k.trim()}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>
                    <Clock size={12} />
                    <span>{alert.alertDate} — {alert.alertTime}</span>
                  </div>
                  <button 
                    onClick={() => onSelectAlert(alert)}
                    style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> Atender
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertList;
