import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/api';
import { UserPlus, ShieldAlert, Clock, Layout } from 'lucide-react';

const AlertAssignment = ({ selectedAlert, fetchAlerts, onBack, user, token }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({
    toUserId: '',
    area: 'Psicología',
    deadline: '',
    reason: ''
  });
  const [message, setMessage] = useState('');

  const currentRole = user?.role || 'Colaboradores';

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/collaborators`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Backend ya filtra solo roles operativos (Psicologo, Coordinador, Docente, Colaboradores)
        // y usuarios activos.
        setCollaborators(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignment({ ...assignment, [name]: value });
  };

  const handleAssign = async () => {
    if (!assignment.toUserId) {
      setMessage('⚠️ Debe seleccionar un responsable receptor.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/alerts/${selectedAlert.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(assignment)
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Caso remitido exitosamente.`);
        setTimeout(() => {
          fetchAlerts();
          onBack();
        }, 2000);
      } else {
        setMessage('❌ ' + (data.message || 'Error al remitir'));
      }
    } catch (error) {
      setMessage('❌ Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert-assignment-view animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0c4a6e', margin: 0 }}>Remitir a Colaborador</h3>
        <button 
          onClick={onBack} 
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
        >
          ← Volver
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>RESPONSABLE RECEPTOR *</label>
            <div style={{ position: 'relative' }}>
              <select 
                name="toUserId" 
                value={assignment.toUserId} 
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', outline: 'none', appearance: 'none' }}
              >
                <option value="">Seleccione un colaborador...</option>
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>ÁREA O DEPENDENCIA</label>
            <select 
              name="area" 
              value={assignment.area} 
              onChange={handleInputChange} 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', outline: 'none' }}
            >
              <option>Psicología</option>
              <option>Coordinación académica</option>
              <option>Bienestar</option>
              <option>Dirección</option>
              <option>Orientación Escolar</option>
            </select>
          </div>

          <div className="form-field">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>FECHA LÍMITE ATENCIÓN</label>
            <input 
              type="date" 
              name="deadline" 
              value={assignment.deadline} 
              onChange={handleInputChange} 
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / span 2' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>INSTRUCCIONES / OBSERVACIONES PARA EL COLABORADOR</label>
            <textarea 
              name="reason" 
              value={assignment.reason} 
              onChange={handleInputChange} 
              placeholder="Indique qué acciones debe priorizar el colaborador..."
              rows="4"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {message && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', background: message.includes('✅') ? '#f0fdf4' : '#fef2f2', color: message.includes('✅') ? '#16a34a' : '#dc2626', fontWeight: '700', fontSize: '0.85rem', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleAssign}
            disabled={loading || !assignment.toUserId}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              padding: '14px 32px', borderRadius: '12px', 
              background: '#0c4a6e', color: '#fff', border: 'none', 
              fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 6px -1px rgba(12, 74, 110, 0.2)'
            }}
          >
            {loading ? 'Remitiendo...' : <><UserPlus size={18} /> Remitir Caso Ahora</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertAssignment;
