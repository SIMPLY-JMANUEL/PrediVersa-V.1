import React from 'react';
import { Send, User, Calendar, Info, CheckCircle } from 'lucide-react';

const RemisionForm = ({ form, setForm, handleSubmit, loading }) => {
  return (
    <div className="pro-form animate-fade-in" style={{ padding: '0px' }}>
      <div className="form-header" style={{ marginBottom: '1.5rem', background: '#f0f9ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
        <Info size={20} color="#0ea5e9" />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>Información de Remisión Profesional</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Especifique el área y responsable que recibirá el caso para su atención continua.</p>
        </div>
      </div>
      
      <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>ÁREA DE REMISIÓN</label>
          <select value={form.area} onChange={(e) => setForm({...form, area: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}>
            <option>Psicología</option>
            <option>Coordinación académica</option>
            <option>Bienestar Institucional</option>
            <option>Soporte Técnico</option>
            <option>Orientación Escolar</option>
            <option>Rectoría</option>
          </select>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>RESPONSABLE RECEPTOR</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="text" value={form.responsable} onChange={(e) => setForm({...form, responsable: e.target.value})} placeholder="Nombre completo" style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>FECHA DE EJECUCIÓN</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="date" value={form.fecha} onChange={(e) => setForm({...form, fecha: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>PRIORIDAD</label>
          <select value={form.urgencia} onChange={(e) => setForm({...form, urgencia: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}>
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
            <option>Urgente (Crítica)</option>
          </select>
        </div>
        <div className="pro-field full-width" style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>DESCRIPCIÓN DE LA REMISIÓN</label>
          <textarea value={form.motivo} onChange={(e) => setForm({...form, motivo: e.target.value})} placeholder="Escriba los motivos técnicos de la remisión..." rows="3" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}></textarea>
        </div>
      </div>
      <div className="form-actions-pro" style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button className="btn-save-pro" onClick={() => handleSubmit('remision', 'Remision')} disabled={loading} style={{ background: '#0ea5e9', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', float: 'right' }}>
          <CheckCircle size={18} /> Registrar Remisión Profesional
        </button>
      </div>
      <div style={{ clear: 'both' }}></div>
    </div>
  );
};

export default RemisionForm;
