import { useState } from 'react'
import DashboardHeader from './DashboardHeader'
import { UserCircle, ChevronDown, AlertCircle, ClipboardCheck, HelpCircle, Scale } from 'lucide-react'
import './CollaboratorDashboard.css'

function CollaboratorDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('alerta')

  return (
    <div className="dashboard-wrapper">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-container">
        <div className="dashboard-layout">
          
          {/* Panel Izquierdo: Perfil del Colaborador */}
          <aside className="dashboard-sidebar">
            <div className="dashboard-card profile-card">
              <div className="profile-photo">
                <UserCircle size={64} color="#8ECFEA" strokeWidth={1.5} />
                <p>Insertar Imagen</p>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="label">Nombres y apellidos:</span>
                  <span className="value">{user?.name || 'Nombre del Colaborador'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Tipo documento:</span>
                  <span className="value">CC</span>
                </div>
                <div className="detail-item">
                  <span className="label">Número documento:</span>
                  <span className="value">1234567890</span>
                </div>
                <div className="detail-item">
                  <span className="label">Fecha nacimiento:</span>
                  <span className="value">{user?.birthDate ? new Date(user?.birthDate).toLocaleDateString() : '01/01/1990'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Edad:</span>
                  <span className="value">{user?.edad || '34'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">{user?.phone || '+57 000 000 0000'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Usuario:</span>
                  <span className="value">{user?.email || 'colaborador@ejemplo.com'}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Panel Central: Menús Desplegables */}
          <main className="dashboard-main">
            <div className="menu-section">
              <div className="menu-tabs">
                
                <button 
                  className={`menu-tab ${activeMenu === 'alerta' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('alerta')}
                >
                  <AlertCircle size={18} className="tab-icon" />
                  <span className="tab-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                    <span>Alerta caso remitido</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(Menú desplegable)</span>
                  </span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

                <button 
                  className={`menu-tab ${activeMenu === 'actuaciones' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('actuaciones')}
                >
                  <ClipboardCheck size={18} className="tab-icon" />
                  <span className="tab-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                    <span>Actuaciones realizadas</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(Menú desplegable)</span>
                  </span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

                <button 
                  className={`menu-tab ${activeMenu === 'soporte' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('soporte')}
                >
                  <HelpCircle size={18} className="tab-icon" />
                  <span className="tab-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                    <span>Soporte</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(Menú desplegable)</span>
                  </span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

                <button 
                  className={`menu-tab ${activeMenu === 'normatividad' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('normatividad')}
                >
                  <Scale size={18} className="tab-icon" />
                  <span className="tab-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                    <span>Normatividad</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(Menú desplegable)</span>
                  </span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

              </div>
              
              <div className="dashboard-card menu-content-card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="content-pane" style={{ textAlign: 'center', width: '100%' }}>
                  <h2 style={{ color: '#2A4E5F', fontWeight: '500' }}>Información de cada uno de los menús desplegables</h2>
                  
                  {/* Contenido Dinámico según la pestaña activa */}
                  <div style={{ marginTop: '2rem', opacity: 0.7 }}>
                    {activeMenu === 'alerta' && <p>Panel para gestionar y visualizar las <strong>alertas y casos remitidos</strong> que requieren su atención.</p>}
                    {activeMenu === 'actuaciones' && <p>Registro histórico y seguimiento de las <strong>actuaciones realizadas</strong> a su nombre.</p>}
                    {activeMenu === 'soporte' && <p>Área de asistencia técnica o académica de <strong>soporte al colaborador</strong>.</p>}
                    {activeMenu === 'normatividad' && <p>Acceso a manuales, directrices y <strong>normatividad vigente</strong> del ecosistema educativo.</p>}
                  </div>
                </div>
              </div>
            </div>
          </main>
          
        </div>
      </div>
    </div>
  )
}

export default CollaboratorDashboard
