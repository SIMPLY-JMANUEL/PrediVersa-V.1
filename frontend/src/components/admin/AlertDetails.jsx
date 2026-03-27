import React, { useState } from 'react';
import { BASE_URL } from '../../utils/api';

const AlertDetails = ({ selectedAlert, onBack }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ nivel: '', razon: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!selectedAlert) return null;

  const isVersa = selectedAlert.ticketNumber.includes('CHT') || selectedAlert.ticketNumber.includes('CRIT');

  const handleCorrectIA = async () => {
    if (!feedback.nivel) return alert('Seleccione un nivel corregido');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/chatbot/corregir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje_original: selectedAlert.description,
          nivel_original: selectedAlert.alertType === 'Critica' ? 'alto' : (selectedAlert.alertType === 'Advertencia' ? 'medio' : 'bajo'),
          nivel_corregido: feedback.nivel,
          razon: feedback.razon,
          admin_id: 1 // TODO: Obtener del contexto de auth
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('✅ Retroalimentación guardada. El motor aprenderá de este caso.');
        setTimeout(() => setShowFeedback(false), 2000);
      }
    } catch (e) {
      console.error(e);
      setMsg('❌ Error al guardar feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert-details-view">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
        <h3 className="alerts-section-title" style={{color: '#2A4E5F', margin: 0}}>Información Principal del Caso</h3>
        <button className="action-btn-small" onClick={onBack}>← Volver al listado</button>
      </div>
      
      {isVersa && (
         <div className="dashboard-card" style={{background: '#EEF2FF', border: '2px solid #6366F1', marginBottom: '15px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{color: '#4338CA', margin: 0}}>🤖 Control de Calidad Versa (IA)</h4>
              <button className="action-btn-small" style={{background: '#6366F1', color: '#fff'}} onClick={() => setShowFeedback(!showFeedback)}>
                {showFeedback ? 'Cancelar' : 'Corregir Nivel IA'}
              </button>
            </div>
            {showFeedback && (
              <div style={{marginTop: '15px', padding: '15px', background: '#fff', borderRadius: '12px', border: '1px solid #C7D2FE'}}>
                <p style={{fontSize: '0.85rem', color: '#4338CA', marginBottom: '10px'}}>Si el motor se equivocó, indica el nivel correcto para re-entrenarlo:</p>
                <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                  <select 
                    style={{padding: '8px', borderRadius: '8px', border: '1px solid #DDD', flex: 1}}
                    value={feedback.nivel}
                    onChange={(e) => setFeedback({...feedback, nivel: e.target.value})}
                  >
                    <option value="">Nivel correcto...</option>
                    <option value="bajo">Riesgo Bajo (Preventivo)</option>
                    <option value="medio">Riesgo Medio (Advertencia)</option>
                    <option value="alto">Riesgo Alto (Crítico)</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="¿Por qué corrijo este caso?" 
                    style={{padding: '8px', borderRadius: '8px', border: '1px solid #DDD', flex: 2}}
                    value={feedback.razon}
                    onChange={(e) => setFeedback({...feedback, razon: e.target.value})}
                  />
                  <button 
                    className="action-btn-small" 
                    style={{background: '#10B981', color: '#fff'}}
                    onClick={handleCorrectIA}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Feedback'}
                  </button>
                </div>
                {msg && <p style={{fontSize: '0.85rem', color: msg.includes('✅') ? '#059669' : '#DC2626'}}>{msg}</p>}
              </div>
            )}
         </div>
      )}

      <div className="dashboard-card" style={{borderLeft: '4px solid #3A6F85', background: '#F8FBFD'}}>
        <h4 style={{borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', color: '#1e293b'}}>Identificación</h4>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '10px'}}>
          <div><strong>Ticket:</strong> {selectedAlert.ticketNumber}</div>
          <div><strong>Fecha y hora:</strong> {selectedAlert.alertDate} {selectedAlert.alertTime}</div>
          <div><strong>Nivel de riesgo Detectado:</strong> <span style={{color: '#dc2626', fontWeight: 'bold'}}>{selectedAlert.alertType}</span></div>
          <div><strong>Estado:</strong> {selectedAlert.status}</div>
        </div>
      </div>

      <div className="dashboard-card" style={{borderLeft: '4px solid #3A6F85', background: '#F8FBFD', marginTop: '15px'}}>
        <h4 style={{borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', color: '#1e293b'}}>Origen de la alerta</h4>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '10px'}}>
          <div><strong>Sistema:</strong> {isVersa ? 'Modelo Predictivo (Bot Versa)' : 'Registro Manual'}</div>
          <div><strong>Tipo de alerta:</strong> {selectedAlert.alertType}</div>
          <div><strong>Análisis de Contexto:</strong> {isVersa ? 'Estructura Híbrida (Reglas + IA)' : 'N/A'}</div>
        </div>
      </div>

      <div className="dashboard-card" style={{borderLeft: '4px solid #3A6F85', background: '#F8FBFD', marginTop: '15px'}}>
        <h4 style={{borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', color: '#1e293b'}}>Datos del usuario</h4>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '10px'}}>
          <div><strong>Nombre:</strong> {selectedAlert.studentName}</div>
          <div><strong>ID / Documento:</strong> {selectedAlert.studentDocumentId}</div>
          <div><strong>Correo:</strong> {selectedAlert.studentUsername || 'No registrado'}</div>
          <div><strong>Programa / Grado:</strong> {selectedAlert.studentGrade || 'No especificado'}</div>
        </div>
      </div>

      <div className="dashboard-card" style={{borderLeft: '4px solid #3A6F85', background: '#F8FBFD', marginTop: '15px'}}>
        <h4 style={{borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', color: '#1e293b'}}>Descripción del caso</h4>
        <div style={{marginTop: '10px'}}>
          <p><strong>Detalles:</strong></p>
          <div style={{background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', whiteSpace: 'pre-wrap'}}>
            {selectedAlert.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;
