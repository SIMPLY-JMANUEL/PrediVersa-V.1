import { useState } from 'react'
import DashboardHeader from './DashboardHeader'
import { UserCircle, Scale, Newspaper, ClipboardList, AlertTriangle, Info, MessageSquare } from 'lucide-react'
import ChatbotVersa from './ChatbotVersa'
import DenunciaFacil from './DenunciaFacil'
import Normatividad from './Normatividad'
import TestVersa from './TestVersa'
import { useUserPhoto } from '../hooks/useUserPhoto'
import '../ProfessionalTheme.css'
import './StudentDashboard.css'

function StudentDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('chat')
  const [photo, setPhoto] = useUserPhoto()
  const [isUploading, setIsUploading] = useState(false)

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      await setPhoto(reader.result)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          
          <aside className="dashboard-sidebar">
            <div className="dashboard-card profile-card">
              <div className="profile-photo">
                {photo ? (
                  <img src={photo} alt="Perfil" className="profile-photo-img" />
                ) : (
                  <UserCircle size={80} color="#94a3b8" strokeWidth={1} />
                )}
                {isUploading && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    fontSize: '0.75rem', fontWeight: 'bold'
                  }}>Cargando...</div>
                )}
              </div>
              <label style={{
                background: '#f1f5f9', color: '#475569', padding: '8px 16px',
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0',
                marginBottom: '1.5rem'
              }}>
                <input type="file" onChange={handlePhotoChange} accept="image/*" hidden />
                {photo ? 'Cambiar Foto' : 'Subir Foto'}
              </label>

              <div className="profile-details">
                <h3 className="user-name">{user?.name}</h3>
                <p className="user-role">{user?.role}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>

            <div className="dashboard-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0c4a6e', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <Info size={18} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>PANEL ESTUDIANTIL</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Gestiona tus reportes, consultas y normatividad institucional.</p>
            </div>
          </aside>

          <main className="dashboard-main">
            <div className="professional-header">
              <h2 className="page-title">Centro de Apoyo Versa</h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Bienvenido de nuevo, {user?.name}. ¿En qué podemos ayudarte hoy?</p>
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
                <div className="animate-fade-in" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                  <ChatbotVersa user={user} />
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
