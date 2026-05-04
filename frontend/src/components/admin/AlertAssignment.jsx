import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/api';
import { UserPlus, ShieldAlert, Send } from 'lucide-react';

const AlertAssignment = ({ selectedAlert, fetchAlerts, onBack, user, token }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({
    toUserId: '',
    notes: ''
  });
  const [message, setMessage] = useState('');

  const currentRole = user?.role || 'Colaboradores';

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Matriz de visibilidad RBAC v4.5
        const visibleRoles = {
          'Administrador': ['Psicologo', 'Coordinador', 'Docente', 'Colaboradores'],
          'Coordinador': ['Psicologo', 'Coordinador', 'Docente', 'Colaboradores'],
          'Psicologo': ['Psicologo', 'Coordinador'],
          'Docente': ['Coordinador'],
          'Colaboradores': ['Coordinador']
        };

        const allowedRoles = visibleRoles[currentRole] || ['Coordinador'];
        const filtered = data.users.filter(u => allowedRoles.includes(u.role) && u.id !== user.id);
        setCollaborators(filtered);
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
      setMessage('⚠️ Debe seleccionar un profesional receptor.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/alerts/${selectedAlert.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          toUserId: assignment.toUserId,
          reason: assignment.notes 
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Caso reasignado a ${data.new_assigned} exitosamente.`);
        
        // Registrar mensaje de contexto en el chat automáticamente
        if (assignment.notes) {
          await fetch(`${BASE_URL}/api/alerts/${selectedAlert.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ message: `[REASIGNACIÓN] Contexto: ${assignment.notes}` })
          });
        }

        setTimeout(() => {
          fetchAlerts();
          onBack();
        }, 2000);
      } else {
        setMessage('❌ ' + (data.message || 'Error al reasignar'));
      }
    } catch (error) {
      setMessage('❌ Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert-assignment-view">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '8px' }}>
            <ShieldAlert size={18} />
            <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Protocolo de Autonomía v4.5</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#0c4a6e', lineHeight: '1.5' }}>
            Como <strong>{currentRole}</strong>, usted puede gestionar este caso y derivarlo a otros profesionales según la red de mando establecida.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px', display: 'block' }}>PROFESIONAL RECEPTOR</label>
              <select 
                name="toUserId" 
                value={assignment.toUserId} 
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }}
              >
                <option value="">Seleccione un profesional de la red...</option>
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px', display: 'block' }}>NOTAS DE ENTREGA / CONTEXTO</label>
              <textarea 
                name="notes" 
                value={assignment.notes} 
                onChange={handleInputChange}
                placeholder="Explique al receptor por qué se le deriva este caso..."
                rows="4"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            {message && (
              <div style={{ padding: '12px', borderRadius: '8px', background: message.includes('✅') ? '#f0fdf4' : '#fef2f2', color: message.includes('✅') ? '#16a34a' : '#dc2626', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button 
                onClick={handleAssign}
                disabled={loading || !assignment.toUserId}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', background: '#0c4a6e', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Procesando...' : <><UserPlus size={16} /> Reasignar y Notificar</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertAssignment;
