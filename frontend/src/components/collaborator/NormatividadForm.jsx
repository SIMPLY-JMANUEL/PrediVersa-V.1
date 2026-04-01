import React from 'react';
import { Scale, Info, CheckCircle, Book, Link } from 'lucide-react';

const NormatividadForm = ({ form, setForm, handleSubmit, loading }) => {
  return (
    <div className="pro-form animate-fade-in" style={{ padding: '0px' }}>
      <div className="form-header" style={{ marginBottom: '1.5rem', background: '#fffbeb', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
        <Scale size={20} color="#f59e0b" />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>Fundamento Normativo Institucional</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Relacione su actuación con normas, protocolos o políticas institucionales pertinentes.</p>
        </div>
      </div>
      
      <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>TIPO DE NORMATIVA</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
             <Book size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
             <select value={form.tipo} onChange={(e) => setForm({...form, normatividad: {...form.normatividad, tipo: e.target.value}})} style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}>
               <option>Reglamento institucional</option>
               <option>Protocolo de atención oficial</option>
               <option>Política de bienestar</option>
               <option>Manual de Convivencia</option>
               <option>Ley 1620 de 2013</option>
             </select>
          </div>
        </div>
        <div className="pro-field">
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>ARTÍCULO O SECCIÓN APLICABLE</label>
          <input type="text" value={form.articulo} onChange={(e) => setForm({...form, normatividad: {...form.normatividad, articulo: e.target.value}})} placeholder="Ej: Art. 12 literal b" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
        </div>
        <div className="pro-field full-width" style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>DESCRIPCIÓN DE LA BASE LEGAL</label>
          <textarea value={form.descripcion} onChange={(e) => setForm({...form, normatividad: {...form.normatividad, descripcion: e.target.value}})} placeholder="Resumen del texto normativo aplicado a este caso..." rows="3" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}></textarea>
        </div>
        <div className="pro-field full-width" style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>ENLACE O REFERENCIA ADICIONAL</label>
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <Link size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
            <input type="text" value={form.referencia} onChange={(e) => setForm({...form, normatividad: {...form.normatividad, referencia: e.target.value}})} placeholder="URL al documento o referencia bibliográfica" style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>
      </div>
      <div className="form-actions-pro" style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button className="btn-save-pro" onClick={() => handleSubmit('normatividad', 'Normatividad')} disabled={loading} style={{ background: '#d97706', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', float: 'right' }}>
          <CheckCircle size={18} /> Vincular Marco Normativo Legal
        </button>
      </div>
      <div style={{ clear: 'both' }}></div>
    </div>
  );
};

export default NormatividadForm;
