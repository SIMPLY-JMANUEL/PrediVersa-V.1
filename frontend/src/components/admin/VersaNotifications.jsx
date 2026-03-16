import React from 'react';

const VersaNotifications = ({ notifVisible, notifVersa, setNotifVersa, setNotifVisible, setActiveTab }) => {
  if (!notifVisible || notifVersa.length === 0) return null;

  return (
    <div className="versa-notif-panel">
      {notifVersa.slice(0, 3).map((n, i) => (
        <div key={i} className={`v-notif ${n.nivel}`}>
          <div className="v-notif-header">
            <span>{n.nivel === 'alto' ? '🚨 ALERTA CRÍTICA' : '⚠️ ALERTA MEDIA'}</span>
            <button onClick={() => setNotifVersa(prev => prev.filter((_, idx) => idx !== i))}>×</button>
          </div>
          <div className="v-notif-body">
            <strong>{n.nombre}</strong>
            <p>{n.tipo_violencia} - Tkt: {n.ticket}</p>
            <button className="v-action-btn" onClick={() => { setActiveTab('alertas'); setNotifVisible(false); }}>Atender</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VersaNotifications;
