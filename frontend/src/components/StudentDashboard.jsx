import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { UserCircle, Scale, Newspaper, ClipboardList, AlertTriangle, Info, MessageSquare } from 'lucide-react'
import DenunciaFacil from './DenunciaFacil'
import Normatividad from './Normatividad'
import TestVersa from './TestVersa'
import AmazonLexChat from './AmazonLexChat'
import { useUserPhoto } from '../hooks/useUserPhoto'
import '../ProfessionalTheme.css'
import './StudentDashboard.css'

function StudentDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('chat')
  const [photo] = useUserPhoto()

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          
          <aside className="dashboard-sidebar">
            <div className="dashboard-card profile-card">
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                {photo ? (
                  <img src={photo} alt="Perfil" className="profile-photo-img img-theme-circle" />
                ) : (
                  <div className="img-theme-circle flex-center" style={{background: '#f8fafc'}}>
                    <UserCircle size={80} color="#94a3b8" strokeWidth={1} />
                  </div>
                )}

              </div>

              <div className="profile-details">
                <h3 className="user-name">{user?.name}</h3>
                <p className="user-role">{user?.role}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>

            <div className="dashboard-card sidebar-info">
              <div className="card-header-pro">
                <Info size={18} />
                <h4>PANEL ESTUDIANTIL</h4>
              </div>
              <p>Gestiona tus reportes, consultas y normatividad institucional.</p>
            </div>
          </aside>

          <main className="dashboard-main">
            <div className="professional-header">
              <h2 className="page-title">Centro de Apoyo Versa</h2>
              <p className="page-subtitle">Bienvenido de nuevo, {user?.name}. ¿En qué podemos ayudarte hoy?</p>
            </div>

            <div className="management-tabs">
              {[
                { id: 'chat', label: '1. Chatbot Evalúa', icon: <MessageSquare size={18} /> },
                { id: 'denuncia', label: '2. Denuncia Fácil', icon: <AlertTriangle size={18} /> },
                { id: 'normatividad', label: '3. Normatividad', icon: <Scale size={18} /> },
                { id: 'test', label: '4. Test Versa', icon: <ClipboardList size={18} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`mgmt-tab ${activeMenu === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="dashboard-card mgmt-content">
              {activeMenu === 'chat' && (
                <div className="animate-fade-in" style={{ padding: '0.5rem 0' }}>
                  <AmazonLexChat user={user} />
                  
                  <div className="chatbot-footer-hint">
                    <div className="dot-online"></div>
                    <span>Conexión Protegida — Amazon Lex & Motor Versa IA</span>
                  </div>
                </div>
              )}
              
              {activeMenu === 'denuncia' && (
                <DenunciaFacil user={user} />
              )}

              {activeMenu === 'normatividad' && (
                <Normatividad />
              )}

              {activeMenu === 'test' && (
                <TestVersa user={user} />
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
