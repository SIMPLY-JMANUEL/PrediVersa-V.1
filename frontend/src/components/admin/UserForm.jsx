import React from 'react';

const UserForm = ({ userForm, formErrors, handleInputChange, editingUser, handleUpdate, handleSave, cancelEdit }) => {
  return (
    <div className="user-form-container">
      <div className="user-form-grid">
        <div className="form-column">
          <div className={`form-field ${formErrors.nombres ? 'has-error' : ''}`}>
            <label>Nombres *</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="nombres" value={userForm.nombres} onChange={handleInputChange} className="wireframe-input" placeholder="Nombres" />
            </div>
          </div>
          {formErrors.nombres && <span className="field-error">{formErrors.nombres}</span>}
          
          <div className={`form-field ${formErrors.apellidos ? 'has-error' : ''}`}>
            <label>Apellidos *</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="apellidos" value={userForm.apellidos} onChange={handleInputChange} className="wireframe-input" placeholder="Apellidos" />
            </div>
          </div>
          {formErrors.apellidos && <span className="field-error">{formErrors.apellidos}</span>}
          
          <div className={`form-field ${formErrors.id ? 'has-error' : ''}`}>
            <label>ID *</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="id" value={userForm.id} onChange={handleInputChange} className="wireframe-input" placeholder="Número de documento" disabled={editingUser} />
            </div>
          </div>
          {formErrors.id && <span className="field-error">{formErrors.id}</span>}
          
          <div className="form-field">
            <label>Edad</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="edad" value={userForm.edad} onChange={handleInputChange} className="wireframe-input" placeholder="Edad" />
            </div>
          </div>
        </div>

        <div className="form-column">
          <div className="form-field">
            <label>F/Nacimiento</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="date" name="fechaNacimiento" value={userForm.fechaNacimiento} onChange={handleInputChange} className="wireframe-input" />
            </div>
          </div>
          <div className="form-field">
            <label>L/ Nacimiento</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="lugarNacimiento" value={userForm.lugarNacimiento} onChange={handleInputChange} className="wireframe-input" placeholder="Lugar de nacimiento" />
            </div>
          </div>
          <div className={`form-field ${formErrors.telefono ? 'has-error' : ''}`}>
            <label>Teléfono</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="telefono" value={userForm.telefono} onChange={handleInputChange} className="wireframe-input" placeholder="Teléfono" />
            </div>
          </div>
          {formErrors.telefono && <span className="field-error">{formErrors.telefono}</span>}
          
          <div className="form-field">
            <label>Dirección</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="direccion" value={userForm.direccion} onChange={handleInputChange} className="wireframe-input" placeholder="Dirección" />
            </div>
          </div>
        </div>

        <div className="form-column">
          <div className="form-field">
            <label>N/Madre</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="nombreMadre" value={userForm.nombreMadre} onChange={handleInputChange} className="wireframe-input" placeholder="Nombre madre" />
            </div>
          </div>
          <div className="form-field">
            <label>N/Padre</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="nombrePadre" value={userForm.nombrePadre} onChange={handleInputChange} className="wireframe-input" placeholder="Nombre padre" />
            </div>
          </div>
          <div className={`form-field ${formErrors.email ? 'has-error' : ''}`}>
            <label>Email *</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="email" name="email" value={userForm.email} onChange={handleInputChange} className="wireframe-input" placeholder="correo@ejemplo.com" />
            </div>
          </div>
          {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          
          <div className="form-field">
            <label>Grado</label>
            <span>:</span>
            <div className="input-wrapper">
              <input type="text" name="grado" value={userForm.grado} onChange={handleInputChange} className="wireframe-input" placeholder="Grado" />
            </div>
          </div>
        </div>
      </div>

      <div className="action-row">
        <div className="action-box">
          <span>Creación de rol</span>
          <select 
            name="rol" 
            value={userForm.rol} 
            onChange={handleInputChange}
            className="action-select"
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
          <button className="save-btn" onClick={handleSave}>
            Guardar Información
          </button>
        )}
      </div>
    </div>
  );
};

export default UserForm;
