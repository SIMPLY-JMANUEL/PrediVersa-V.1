import React from 'react';

const AlertList = ({ alerts, loadingAlerts, onSelectAlert }) => {
  return (
    <div className="alerts-list-full">
      <h3 className="alerts-section-title" style={{color: '#2A4E5F', marginBottom: '15px'}}>Listado de Casos</h3>
      {loadingAlerts ? (
        <p>Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <p className="empty-message">No hay alertas registradas</p>
      ) : (
        <div className="alerts-table-full">
          <div className="alerts-table-header" style={{background: '#E4F4FA', color: '#2A4E5F'}}>
            <span>Ticket</span>
            <span>Estudiante</span>
            <span>Tipo</span>
            <span>Prioridad</span>
            <span>Estado</span>
            <span>Fecha</span>
            <span>Acciones</span>
          </div>
          {alerts.map(alert => (
            <div key={alert.id} className="alerts-table-row">
              <span>{alert.ticketNumber}</span>
              <span>{alert.studentName}</span>
              <span>{alert.alertType}</span>
              <span style={{color: alert.alertType === 'Alta' ? '#dc2626' : '#d97706'}}>
                Pri: {alert.ticketNumber.includes('BOT') ? 'Alta' : 'Media'}
              </span>
              <span className={`status-${alert.status?.toLowerCase()}`}>{alert.status}</span>
              <span>{alert.alertDate}</span>
              <span>
                <button className="action-btn-small view" onClick={() => onSelectAlert(alert)} title="Ver detalles">👁️ Ver Caso</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertList;
