import { useState } from 'react'
import DashboardHeader from './DashboardHeader'
import { UserCircle, ChevronDown, Scale, Newspaper, ClipboardList, AlertTriangle } from 'lucide-react'
import StudentChatbot from './StudentChatbot'
import './StudentDashboard.css'

function StudentDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('denuncia')

  return (
    <div className="dashboard-wrapper">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-container">
        <div className="dashboard-layout">
          
          {/* Panel Izquierdo: Perfil e Info Académica */}
          <aside className="dashboard-sidebar">
            <div className="dashboard-card profile-card">
              <div className="profile-photo">
                <UserCircle size={64} color="#8ECFEA" strokeWidth={1.5} />
                <p>Insertar Imagen</p>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="label">Nombres y apellidos:</span>
                  <span className="value">{user?.name || 'Nombre del Estudiante'}</span>
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
                  <span className="value">01/01/2000</span>
                </div>
                <div className="detail-item">
                  <span className="label">Edad:</span>
                  <span className="value">26</span>
                </div>
                <div className="detail-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">+57 000 000 0000</span>
                </div>
                <div className="detail-item">
                  <span className="label">Usuario:</span>
                  <span className="value">{user?.email || 'estudiante@ejemplo.com'}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card academic-card">
              <h3 className="card-title">INFORMACIÓN ACADÉMICA</h3>
              <div className="academic-content">
                <p className="text-muted">Área reservada para el progreso académico.</p>
              </div>
            </div>
          </aside>

          {/* Panel Central: Chat y Menús */}
          <main className="dashboard-main">
            <div className="dashboard-card chat-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <StudentChatbot />
            </div>

            <div className="menu-section">
              <div className="menu-tabs">
                <button 
                  className={`menu-tab ${activeMenu === 'denuncia' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('denuncia')}
                >
                  <AlertTriangle size={18} className="tab-icon" />
                  <span className="tab-text">Denuncia fácil</span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

                <button 
                  className={`menu-tab ${activeMenu === 'normatividad' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('normatividad')}
                >
                  <Scale size={18} className="tab-icon" />
                  <span className="tab-text">Normatividad</span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

                <button 
                  className={`menu-tab ${activeMenu === 'noticias' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('noticias')}
                >
                  <Newspaper size={18} className="tab-icon" />
                  <span className="tab-text">Noticias</span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>

                <button 
                  className={`menu-tab ${activeMenu === 'test' ? 'active' : ''}`}
                  onClick={() => setActiveMenu('test')}
                >
                  <ClipboardList size={18} className="tab-icon" />
                  <span className="tab-text">Test</span>
                  <div className="chevron-wrapper">
                    <ChevronDown size={16} className="chevron" />
                  </div>
                </button>
              </div>
              
              <div className="dashboard-card menu-content-card">
                <div className="content-pane">
                  {activeMenu === 'denuncia' && <p>Información de <strong>Denuncia fácil</strong> seleccionada.</p>}
                  {activeMenu === 'normatividad' && <p>Información de <strong>Normatividad</strong> seleccionada.</p>}
                  {activeMenu === 'noticias' && <p>Información de <strong>Noticias</strong> seleccionada.</p>}
                  {activeMenu === 'test' && <p>Información de <strong>Test</strong> seleccionada.</p>}
                </div>
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
