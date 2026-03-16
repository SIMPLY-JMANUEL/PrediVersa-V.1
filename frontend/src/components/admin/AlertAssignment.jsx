import React, { useState, useEffect } from 'react';

const AlertAssignment = ({ selectedAlert, fetchAlerts, onBack }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({
    assignedTo: selectedAlert?.assignedTo || '',
    area: 'Psicología',
    deadline: selectedAlert?.deadline || '',
    notes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filtrar solo colaboradores o psicólogos
        const filtered = data.users.filter(u => u.role === 'Colaboradores' || u.role === 'Psicología');
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
    if (!assignment.assignedTo) {
      setMessage('Debe seleccionar un responsable');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/alerts/${selectedAlert.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          assignedTo: assignment.assignedTo,
          deadline: assignment.deadline,
          status: 'Remitida',
          description: selectedAlert.description + `\n\n[Asignación: Remitido a ${assignment.assignedTo} (${assignment.area}). Nota: ${assignment.notes}]`
        })
      });
      const data = await response.json();
      if (data.success) {
        // Registrar la acción de remisión en el historial automáticamente
        try {
          await fetch('http://localhost:5000/api/alerts/actions', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              alertId: selectedAlert.id,
              collaboratorId: collaborators.find(c => c.name === assignment.assignedTo)?.id || 0,
              category: 'Remision',
              actionType: `Remisión a ${assignment.area}`,
              responsibleName: assignment.assignedTo,
              description: assignment.notes || 'Asignación inicial del caso',
              area: assignment.area,
              urgency: 'Alta'
            })
          });
        } catch (e) { console.error('Error al registrar acción automática:', e); }

        setMessage('✅ Caso remitido al colaborador exitosamente');
        setTimeout(() => {
          fetchAlerts();
          onBack(); // Volver al listado
        }, 2000);
      }
    } catch (error) {
      setMessage('❌ Error al remitir el caso');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedAlert) return <div className="p-4 text-center">Seleccione una alerta primero</div>;

  return (
    <div className="alert-assignment-view">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h3 className="alerts-section-title" style={{color: '#2A4E5F', margin: 0}}>Remitir a Colaborador</h3>
        <button className="action-btn-small" onClick={onBack}>← Volver</button>
      </div>

      <div className="dashboard-card" style={{padding: '20px', background: '#F8FBFD'}}>
        <div className="user-form-grid" style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
          <div className="form-field">
            <label>Responsable receptor *</label>
            <select 
              name="assignedTo" 
              value={assignment.assignedTo} 
              onChange={handleInputChange}
              className="wireframe-input"
            >
              <option value="">Seleccione un colaborador...</option>
              {collaborators.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.role})</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Área o Dependencia</label>
            <select name="area" value={assignment.area} onChange={handleInputChange} className="wireframe-input">
              <option>Psicología</option>
              <option>Coordinación académica</option>
              <option>Bienestar</option>
              <option>Dirección</option>
            </select>
          </div>

          <div className="form-field">
            <label>Fecha Límite Atención</label>
            <input 
              type="date" 
              name="deadline" 
              value={assignment.deadline} 
              onChange={handleInputChange} 
              className="wireframe-input" 
            />
          </div>

          <div className="form-field full-width" style={{gridColumn: '1 / span 2'}}>
            <label>Instrucciones / Observaciones para el colaborador</label>
            <textarea 
              name="notes" 
              value={assignment.notes} 
              onChange={handleInputChange} 
              className="wireframe-textarea" 
              placeholder="Indique qué acciones debe priorizar el colaborador..."
              rows="4"
              style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0'}}
            ></textarea>
          </div>
        </div>

        {message && (
          <div style={{
            marginTop: '15px', 
            padding: '10px', 
            borderRadius: '6px', 
            backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
            color: message.includes('✅') ? '#16a34a' : '#dc2626',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
          <button 
            className="save-btn" 
            onClick={handleAssign}
            disabled={loading}
            style={{padding: '10px 30px'}}
          >
            {loading ? 'Remitiendo...' : 'Remitir Caso Ahora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertAssignment;
