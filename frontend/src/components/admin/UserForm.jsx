import React, { useMemo } from 'react';

const UserForm = ({ userForm, formErrors, handleInputChange, editingUser, handleUpdate, handleSave, handleClear, cancelEdit }) => {
  
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
      <div className="user-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* COLUMNA 1: DATOS PERSONALES DEL USUARIO */}
        <div className="form-column">
          <h4 style={{ color: '#0c4a6e', fontSize: '0.85rem', fontWeight: '900', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>DATOS PERSONALES</h4>
          
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

        </div>

        {/* COLUMNA 2: DATOS DEL REPRESENTANTE LEGAL */}
        <div className="form-column">
          <h4 style={{ color: '#0c4a6e', fontSize: '0.85rem', fontWeight: '900', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>REPRESENTANTE LEGAL</h4>
          
          <div className="form-field">
            <label>Nombre del Representante *</label>
            <div className="input-wrapper">
              <input type="text" name="repName" value={userForm.repName || ''} onChange={handleInputChange} className="pro-field-input" placeholder="Nombre completo acudiente" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-field">
              <label>Parentesco</label>
              <select name="repRelationship" value={userForm.repRelationship || ''} onChange={handleInputChange} className="pro-field-input" style={{ height: '54px', cursor: 'pointer', fontWeight: '600' }}>
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
            <label>Dirección del Representante</label>
            <div className="input-wrapper">
              <input type="text" name="repAddress" value={userForm.repAddress || ''} onChange={handleInputChange} className="pro-field-input" placeholder="Dirección residencia" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN HORIZONTAL: CORREO Y ROL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '1rem' }}>
        <div className="form-field">
          <label style={{ color: '#64748b', fontWeight: '800', fontSize: '0.8rem' }}>Correo Institucional (Automático)</label>
          <div className="input-wrapper" style={{ background: '#f0f9ff', padding: '14px', borderRadius: '12px', border: '1px dashed #7dd3fc', color: '#0c4a6e', fontWeight: '800', fontSize: '1rem', marginTop: '0.5rem' }}>
            {userForm.institutionalEmail || generatedEmail}
          </div>
        </div>

        <div className="form-field">
          <label style={{ color: '#64748b', fontWeight: '800', fontSize: '0.8rem' }}>ROL DEL USUARIO</label>
          <div className="input-wrapper" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', padding: '2px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
            <select 
              name="rol" 
              value={userForm.rol} 
              onChange={handleInputChange}
              className="pro-field-input"
              style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '700', color: '#0ea5e9', outline: 'none', cursor: 'pointer', height: '46px' }}
            >
              <option value="Estudiante">Estudiante</option>
              <option value="Colaboradores">Colaborador</option>
              <option value="Psicología">Psicología</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN: GUARDAR Y LIMPIAR */}
      <div className="action-row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {editingUser ? (
          <>
            <button className="btn-primary-pro" onClick={handleUpdate}>Actualizar Usuario</button>
            <button className="btn-secondary-pro" onClick={cancelEdit} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '10px 22px', fontSize: '0.8rem', borderRadius: '10px' }}>Cancelar</button>
          </>
        ) : (
          <>
            <button className="btn-primary-pro" onClick={handleSave} style={{ minWidth: '250px' }}>
              Guardar e Inscribir Usuario
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserForm;
