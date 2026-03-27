import React from 'react';
import { AlertCircle, Info, CheckCircle, X } from 'lucide-react';

const VersaNotifications = ({ notifVisible, notifVersa, setNotifVersa, setNotifVisible, setActiveTab }) => {
  if (!notifVisible || notifVersa.length === 0) return null;

  const removeNotif = (index) => {
    setNotifVersa(prev => prev.filter((_, idx) => idx !== index));
    if (notifVersa.length <= 1) setNotifVisible(false);
  };

  return (
    <div className="versa-notif-container">
      {notifVersa.slice(0, 4).map((n, i) => {
        const isColaborador = n.tipo === 'colaborador_accion';
        const isCritica = n.nivel === 'alto';
        const cardColorClass = isColaborador ? 'status-colab' : `status-${n.nivel || 'medio'}`;
        
        return (
          <div key={`${n.ticket}-${i}`} className={`v-premium-notif ${cardColorClass} animate-slide-in`}>
            <div className="v-notif-glass-bg"></div>
            
            <div className="v-notif-icon">
              {isCritica ? <AlertCircle size={24} className="pulse-icon" /> : 
               isColaborador ? <CheckCircle size={24} /> : <Info size={24} />}
            </div>

            <div className="v-notif-content">
              <div className="v-notif-header-pro">
                <span className="v-notif-badge">
                  {isCritica ? '🚨 CRÍTICO' : isColaborador ? '📝 RESOLUCIÓN' : '⚠️ ADVERTENCIA'}
                </span>
                <span className="v-notif-time">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              <h4 className="v-notif-title">{n.nombre}</h4>
              <p className="v-notif-desc">
                {isColaborador ? n.descripcion : `${n.tipo_violencia || 'Caso detectado'} — Ticket: ${n.ticket}`}
              </p>

              <div className="v-notif-actions">
                <button className="v-btn-view" onClick={() => { setActiveTab('alertas'); setNotifVisible(false); }}>
                  {isColaborador ? 'Ver Seguimiento' : 'Intervenir Ahora'}
                </button>
                <button className="v-btn-dismiss" onClick={() => removeNotif(i)}>
                  Ignorar
                </button>
              </div>
            </div>

            <button className="v-close-icon" onClick={() => removeNotif(i)}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default VersaNotifications;
