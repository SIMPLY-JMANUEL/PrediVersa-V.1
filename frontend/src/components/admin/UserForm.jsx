import React, { useMemo } from 'react';

const UserForm = ({ userForm, formErrors, handleInputChange, editingUser, handleUpdate, handleSave, cancelEdit }) => {
  
  // Generación visual del correo institucional (solo lectura en el form)
  const generatedEmail = useMemo(() => {
    if (!userForm.nombres) return '...';
    const parts = userForm.nombres.toLowerCase().split(' ');
    const first = parts[0] || '';
    const last = parts[1] || '';
    const docSuffix = (userForm.id || '').slice(-4);
    return `${first}${last ? '.' + last : ''}${docSuffix}@prediversa.edu.co`;
  }, [userForm.nombres, userForm.id]);

  return (
    <div className="user-form-container">
      <div className="user-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* COLUMNA 1: DATOS PERSONALES DEL USUARIO */}
        <div className="form-column">
          <h4 style={{ color: '#0ea5e9', fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>DATOS PERSONALES</h4>
          
          <div className={`form-field ${formErrors.nombres ? 'has-error' : ''}`}>
            <label>Nombres Completos *</label>
            <div className="input-wrapper">
              <input type="text" name="nombres" value={userForm.nombres} onChange={handleInputChange} className="pro-field-input" placeholder="Ej: Juan" />
            </div>
          </div>

          <div className={`form-field ${formErrors.apellidos ? 'has-error' : ''}`}>
            <label>Apellidos Completos *</label>
            <div className="input-wrapper">
              <input type="text" name="apellidos" value={userForm.apellidos} onChange={handleInputChange} className="pro-field-input" placeholder="Ej: Perez" />
            </div>
          </div>
          
          <div className={`form-field ${formErrors.id ? 'has-error' : ''}`}>
            <label>N° Documento (ID) *</label>
            <div className="input-wrapper">
              <input type="text" name="id" value={userForm.id} onChange={handleInputChange} className="pro-field-input" placeholder="Sin puntos" disabled={editingUser} />
            </div>
          </div>

          <div className="form-field">
            <label>Grado / Cargo</label>
            <div className="input-wrapper">
              <input type="text" name="grado" value={userForm.grado} onChange={handleInputChange} className="pro-field-input" placeholder="Ej: 11-01 / Docente" />
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '1rem' }}>
            <label style={{ color: '#64748b' }}>Correo Institucional (Automático)</label>
            <div className="input-wrapper" style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#0369a1', fontWeight: '600', fontSize: '0.85rem' }}>
              {userForm.institutionalEmail || generatedEmail}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: DATOS DEL REPRESENTANTE LEGAL */}
        <div className="form-column">
          <h4 style={{ color: '#0ea5e9', fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>REPRESENTANTE LEGAL</h4>
          
          <div className="form-field">
            <label>Nombre del Representante *</label>
            <div className="input-wrapper">
              <input type="text" name="repName" value={userForm.repName || ''} onChange={handleInputChange} className="pro-field-input" placeholder="Nombre completo acudiente" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-field">
              <label>Parentesco</label>
              <select name="repRelationship" value={userForm.repRelationship || ''} onChange={handleInputChange} className="pro-field-input" style={{ height: '48px' }}>
                <option value="">Seleccionar...</option>
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Tutor">Tutor</option>
                <option value="Acudiente">Acudiente</option>
              </select>
            </div>
            <div className="form-field">
              <label>N° Documento Rep.</label>
              <div className="input-wrapper">
                <input type="text" name="repDocId" value={userForm.repDocId || ''} onChange={handleInputChange} className="pro-field-input" placeholder="ID Acudiente" />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>Teléfono de Contacto *</label>
            <div className="input-wrapper">
              <input type="text" name="repPhone" value={userForm.repPhone || ''} onChange={handleInputChange} className="pro-field-input" placeholder="Celular acudiente" />
            </div>
          </div>

          <div className="form-field">
            <label>Email del Representante</label>
            <div className="input-wrapper">
              <input type="email" name="repEmail" value={userForm.repEmail || ''} onChange={handleInputChange} className="pro-field-input" placeholder="correo@acudiente.com" />
            </div>
          </div>

          <div className="form-field">
            <label>Dirección del Representante</label>
            <div className="input-wrapper">
              <input type="text" name="repAddress" value={userForm.repAddress || ''} onChange={handleInputChange} className="pro-field-input" placeholder="Dirección residencia" />
            </div>
          </div>
        </div>
      </div>

      <div className="action-row" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
        <div className="action-box">
          <span style={{ fontWeight: '700', color: '#1e293b' }}>ROL DEL USUARIO</span>
          <select 
            name="rol" 
            value={userForm.rol} 
            onChange={handleInputChange}
            className="action-select"
            style={{ minWidth: '200px' }}
          >
            <option value="Estudiante">Estudiante</option>
            <option value="Colaboradores">Colaborador</option>
            <option value="Psicología">Psicología</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
        
        {editingUser ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="update-btn" onClick={handleUpdate}>
              Actualizar Usuario
            </button>
            <button className="cancel-btn" onClick={cancelEdit}>
              Cancelar
            </button>
          </div>
        ) : (
          <button className="save-btn" onClick={handleSave} style={{ background: '#0ea5e9', padding: '12px 30px' }}>
            Guardar e Inscribir Usuario
          </button>
        )}
      </div>
    </div>
  );
};

export default UserForm;
