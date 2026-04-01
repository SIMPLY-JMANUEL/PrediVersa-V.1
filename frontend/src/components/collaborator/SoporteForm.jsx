import React from 'react';
import { Paperclip, FileText, CheckCircle, Calendar, User } from 'lucide-react';

const SoporteForm = ({ form, setForm, handleSubmit, loading, userName }) => {
  return (
    <div className="pro-form animate-fade-in" style={{ padding: '0px' }}>
      <div className="form-header" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #475569' }}>
        <Paperclip size={20} color="#475569" />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Evidencias y Soportes Documentales</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Adjunte referencias o registre evidencias que respalden las actuaciones realizadas en este caso.</p>
        </div>
      </div>
      
      <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>TIPO DE SOPORTE</label>
          <select value={form.tipo} onChange={(e) => setForm({...form, soporte: {...form.soporte, tipo: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}>
            <option>Registro de llamada</option>
            <option>Captura de pantalla</option>
            <option>Documento PDF</option>
            <option>Correo electrónico</option>
            <option>Acta de reunión</option>
            <option>Informe del caso</option>
            <option>Archivo adjunto</option>
          </select>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>FECHA DE CARGA</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="date" value={form.fechaCarga} onChange={(e) => setForm({...form, soporte: {...form.soporte, fechaCarga: e.target.value}})} style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>NOMBRE DEL ARCHIVO O REFERENCIA</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <FileText size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="text" value={form.nombreArchivo} onChange={(e) => setForm({...form, soporte: {...form.soporte, nombreArchivo: e.target.value}})} placeholder="Ej: acta_001.pdf" style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>RESPONSABLE DEL REGISTRO</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="text" value={userName} readOnly style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
          </div>
        </div>
        <div className="pro-field full-width" style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>DESCRIPCIÓN DEL SOPORTE</label>
          <textarea value={form.descripcion} onChange={(e) => setForm({...form, soporte: {...form.soporte, descripcion: e.target.value}})} placeholder="Añada contexto sobre la relevancia de este soporte para el seguimiento del caso..." rows="3" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}></textarea>
        </div>
      </div>
      <div className="form-actions-pro" style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button className="btn-save-pro" onClick={() => handleSubmit('soporte', 'Soporte')} disabled={loading} style={{ background: '#334155', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', float: 'right' }}>
          <CheckCircle size={18} /> Registrar Evidencia de Soporte
        </button>
      </div>
      <div style={{ clear: 'both' }}></div>
    </div>
  );
};

export default SoporteForm;
