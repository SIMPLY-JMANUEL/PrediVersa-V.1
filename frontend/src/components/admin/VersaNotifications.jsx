import React from 'react';

const VersaNotifications = ({ notifVisible, notifVersa, setNotifVersa, setNotifVisible, setActiveTab }) => {
  if (!notifVisible || notifVersa.length === 0) return null;

  return (
    <div className="versa-notif-panel">
      {notifVersa.slice(0, 3).map((n, i) => {
        let isColaborador = n.tipo === 'colaborador_accion';
        let alertBadge = isColaborador ? '📝 SEGUIMIENTO' : (n.nivel === 'alto' ? '🚨 ALERTA CRÍTICA' : '⚠️ ALERTA MEDIA');
        let cardColor = isColaborador ? 'medio' : n.nivel;

        return (
          <div key={i} className={`v-notif ${cardColor}`}>
            <div className="v-notif-header">
              <span>{alertBadge}</span>
              <button onClick={() => setNotifVersa(prev => prev.filter((_, idx) => idx !== i))}>×</button>
            </div>
            <div className="v-notif-body">
              <strong>{n.nombre}</strong>
              <p>{isColaborador ? n.descripcion : `${n.tipo_violencia} - Tkt: ${n.ticket}`}</p>
              <button className="v-action-btn" onClick={() => { setActiveTab('alertas'); setNotifVisible(false); }}>
                {isColaborador ? 'Revisar Folio' : 'Atender'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VersaNotifications;
