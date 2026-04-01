import React, { useMemo, useState } from 'react';
import { User, School, Shield, Lock, Check, Send, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const UserForm = ({ userForm, formErrors, handleInputChange, editingUser, handleUpdate, handleSave, handleClear, cancelEdit }) => {
  const [activeTab, setActiveTab] = useState('personal');

  // Generación visual del correo institucional (solo lectura en el form)
  const generatedEmail = useMemo(() => {
    if (!userForm.nombres) return '...';
    const parts = userForm.nombres.toLowerCase().split(' ');
    const first = parts[0] || '';
    const last = parts[1] || '';
    const docSuffix = (userForm.id || '').slice(-4);
    return `${first}${last ? '.' + last : ''}${docSuffix}@prediversa.edu.co`;
  }, [userForm.nombres, userForm.id]);

  const isMinor = parseInt(userForm.edad) < 18;
  const isStudent = userForm.rol === 'Estudiante';
  const showGuardian = isMinor || isStudent;

  const tabs = [
    { id: 'personal', label: 'Personales', icon: <User size={16} /> },
    { id: 'institucional', label: 'Institucional', icon: <School size={16} /> },
    { id: 'representante', label: 'Representante', icon: <Shield size={16} />, hidden: !showGuardian },
    { id: 'acceso', label: 'Acceso', icon: <Lock size={16} /> }
  ];

  const visibleTabs = tabs.filter(t => !t.hidden);

  const nextTab = () => {
    const currentIndex = visibleTabs.findIndex(t => t.id === activeTab);
    if (currentIndex < visibleTabs.length - 1) setActiveTab(visibleTabs[currentIndex + 1].id);
  };

  const prevTab = () => {
    const currentIndex = visibleTabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) setActiveTab(visibleTabs[currentIndex - 1].id);
  };

  return (
    <div className="user-form-enterprise animate-fade-in" style={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    }}>
      
      {/* HEADER DEL FORMULARIO */}
      <div style={{
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, #3A6F85 0%, #2A4E5F 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px' }}>
            {editingUser ? 'EDICIÓN DE IDENTIDAD' : 'REGISTRO DE NUEVA IDENTIDAD'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Complete los campos para garantizar la integridad de los datos.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
          VERSIÓN 1.5 ENTERPRISE
        </div>
      </div>

      {/* NAVEGACIÓN POR TABS */}
      <div style={{ 
        display: 'flex', 
        background: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0',
        padding: '0 1rem'
      }}>
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? '#3A6F85' : '#64748b',
              fontWeight: activeTab === tab.id ? '800' : '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === tab.id ? '3px solid #3A6F85' : '3px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem' }}>
        
        {/* TAB 1: DATOS PERSONALES */}
        {activeTab === 'personal' && (
          <div className="tab-pane animate-slide-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>NOMBRES COMPLETOS *</label>
                <input type="text" name="nombres" value={userForm.nombres} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border 0.3s' }} 
                  placeholder="Juan Andres" />
              </div>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>APELLIDOS COMPLETOS *</label>
                <input type="text" name="apellidos" value={userForm.apellidos} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                  placeholder="Perez Rodriguez" />
              </div>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>N° DOCUMENTO (ID) *</label>
                <input type="text" name="id" value={userForm.id} onChange={handleInputChange} 
                  disabled={editingUser}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: editingUser ? '#f1f5f9' : 'white' }} 
                  placeholder="1000555333" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="pro-field">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>EDAD</label>
                  <input type="number" name="edad" value={userForm.edad} onChange={handleInputChange} 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                    placeholder="17" />
                </div>
                <div className="pro-field">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>TELÉFONO</label>
                  <input type="text" name="telefono" value={userForm.telefono} onChange={handleInputChange} 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                    placeholder="300555..." />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INSTITUCIONAL */}
        {activeTab === 'institucional' && (
          <div className="tab-pane animate-slide-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>GRADO / CARGO</label>
                <input type="text" name="grado" value={userForm.grado} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                  placeholder="Ej: 11-01 / Docente" />
              </div>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>LUGAR DE NACIMIENTO</label>
                <input type="text" name="lugarNacimiento" value={userForm.lugarNacimiento} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                  placeholder="Bogotá, D.C." />
              </div>
              <div className="pro-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>DIRECCIÓN DE RESIDENCIA</label>
                <input type="text" name="direccion" value={userForm.direccion} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                  placeholder="Calle 123 #45-67" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REPRESENTANTE */}
        {activeTab === 'representante' && (
          <div className="tab-pane animate-slide-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="pro-field" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>NOMBRE DEL ACUDIENTE / REPRESENTANTE *</label>
                <input type="text" name="repName" value={userForm.repName} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                  placeholder="Nombre completo" />
              </div>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>PARENTESCO</label>
                <select name="repRelationship" value={userForm.repRelationship} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: 'white' }}>
                  <option value="">Seleccionar...</option>
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Acudiente">Acudiente</option>
                </select>
              </div>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>TELÉFONO ACUDIENTE *</label>
                <input type="text" name="repPhone" value={userForm.repPhone} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} 
                  placeholder="Celular de contacto" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACCESO */}
        {activeTab === 'acceso' && (
          <div className="tab-pane animate-slide-up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>ROL EN EL SISTEMA</label>
                <select name="rol" value={userForm.rol} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 'bold', color: '#3A6F85' }}>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Colaboradores">Colaborador</option>
                  <option value="Psicología">Psicología</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="pro-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>IDENTIFICADOR ÚNICO (EMAIL)</label>
                <div style={{ padding: '14px', background: '#f0f9ff', borderRadius: '12px', border: '1px dashed #3A6F85', color: '#0c4a6e', fontWeight: '800', fontSize: '0.9rem' }}>
                  {userForm.email || generatedEmail}
                </div>
              </div>
              
              {!editingUser && (
                <div style={{ gridColumn: 'span 2', background: '#fffbeb', padding: '1rem', borderRadius: '12px', border: '1px solid #fcd34d', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Shield size={24} color="#d97706" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.8rem', color: '#92400e' }}>SEGURIDAD AUTOMÁTICA ACTIVADA</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#b45309' }}>Si no asigna una contraseña manual, el sistema generará una aleatoria segura y se la mostrará al finalizar.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER DE NAVEGACIÓN Y ACCIÓN */}
        <div style={{ 
          marginTop: '2.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary-pro" 
              onClick={prevTab}
              disabled={visibleTabs.findIndex(t => t.id === activeTab) === 0}
              style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px', opacity: visibleTabs.findIndex(t => t.id === activeTab) === 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button 
              className="btn-secondary-pro" 
              onClick={nextTab}
              disabled={visibleTabs.findIndex(t => t.id === activeTab) === visibleTabs.length - 1}
              style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px', opacity: visibleTabs.findIndex(t => t.id === activeTab) === visibleTabs.length - 1 ? 0.3 : 1 }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
             {editingUser ? (
               <>
                 <button className="btn-secondary-pro" onClick={cancelEdit}>Cancelar</button>
                 <button className="btn-primary-pro" onClick={handleUpdate} style={{ padding: '12px 28px', minWidth: '180px' }}>
                   <Check size={18} /> Actualizar Identidad
                 </button>
               </>
             ) : (
               <>
                 <button className="btn-secondary-pro" onClick={() => { handleClear(); setActiveTab('personal'); }}>Limpiar</button>
                 <button className="btn-primary-pro" onClick={handleSave} style={{ padding: '12px 32px', minWidth: '220px', boxShadow: '0 10px 20px rgba(58, 111, 133, 0.3)' }}>
                   <Send size={18} /> Registrar en PrediVersa
                 </button>
               </>
             )}
          </div>
        </div>

      </div>

      {/* ESTILOS INTERNOS PARA ANIMACIONES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pro-field input:focus, .pro-field select:focus {
          border-color: #3A6F85 !important;
          box-shadow: 0 0 0 4px rgba(58, 111, 133, 0.1);
        }
        .tab-pane {
          min-height: 250px;
        }
      `}} />
    </div>
  );
};

export default UserForm;
