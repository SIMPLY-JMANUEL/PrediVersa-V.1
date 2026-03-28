import React from 'react';
import { ClipboardCheck, Info, CheckCircle, Clock } from 'lucide-react';

const ActuacionForm = ({ form, setForm, handleSubmit, loading }) => {
  return (
    <div className="pro-form animate-fade-in" style={{ padding: '0px' }}>
      <div className="form-header" style={{ marginBottom: '1.5rem', background: '#f5f3ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
        <ClipboardCheck size={20} color="#8b5cf6" />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#5b21b6' }}>Registro de Actuaciones Realizadas</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Documente todas las intervenciones directas hechas sobre este caso en particular.</p>
        </div>
      </div>
      
      <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>TIPO DE INTERVENCIÓN</label>
          <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}>
            <option>Contacto telefónico con el usuario</option>
            <option>Correo electrónico enviado</option>
            <option>Mensaje por chatbot / sistema</option>
            <option>Reunión o cita programada</option>
            <option>Orientación o asesoría brindada</option>
            <option>Seguimiento del caso</option>
            <option>Escalamiento a otra área</option>
            <option>Cierre del caso</option>
          </select>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>RESULTADO INMEDIATO</label>
          <input type="text" value={form.resultado} onChange={(e) => setForm({...form, resultado: e.target.value})} placeholder="Ej: Citación aceptada / Sin respuesta" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>FECHA Y HORA</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <Clock size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="datetime-local" value={form.fechaHora} onChange={(e) => setForm({...form, fechaHora: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>RESPONSABLE REGISTRADO</label>
          <input type="text" value={form.responsable} readOnly style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
        </div>
        <div className="pro-field full-width" style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>DESCRIPCIÓN DE LA ACTUACIÓN</label>
          <textarea value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} placeholder="Resuma la intervención realizada y los acuerdos alcanzados..." rows="4" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}></textarea>
        </div>
      </div>
      <div className="form-actions-pro" style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button className="btn-save-pro accent" onClick={() => handleSubmit('actuaciones', 'Actuacion')} disabled={loading} style={{ background: '#7c3aed', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', float: 'right' }}>
          <CheckCircle size={18} /> Guardar Actuación en Folio Digital
        </button>
      </div>
      <div style={{ clear: 'both' }}></div>
    </div>
  );
};

export default ActuacionForm;
