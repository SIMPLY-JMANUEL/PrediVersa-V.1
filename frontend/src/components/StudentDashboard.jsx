import { useState } from 'react'
import DashboardHeader from './DashboardHeader'
import DenunciaFacil from './DenunciaFacil'
import Normatividad from './Normatividad'
import TestVersa from './TestVersa'
import AmazonLexChat from './AmazonLexChat'
import UniversalSidebar from './shared/UniversalSidebar'
import { MessageSquare, AlertTriangle, Scale, ClipboardList, Info } from 'lucide-react'
import './StudentDashboard.css'

/**
 * 🏛️ STUDENT DASHBOARD LUXE
 * Portal de Bienestar y Apoyo Psicosocial PrediVersa.
 */
function StudentDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('chat')

  // Catálogo de servicios disponibles para el estudiante
  const menuItems = [
    { id: 'chat', label: 'Orientación IA', icon: <MessageSquare size={19} /> },
    { id: 'denuncia', label: 'Denuncia Fácil', icon: <AlertTriangle size={19} /> },
    { id: 'normatividad', label: 'Normatividad', icon: <Scale size={19} /> },
    { id: 'test', label: 'Test Preventivo', icon: <ClipboardList size={19} /> }
  ];

  return (
    <div className="dashboard-wrapper luxe-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-layout mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 🛰️ SIDEBAR DE CONTEXTO (ESTUDIANTE) */}
        <aside className="lg:col-span-1">
          <UniversalSidebar user={user} stats={{ activeUsers: 1, totalAlerts: 0, dbConnected: true }}>
            <div className="p-card sidebar-info mb-6">
              <div className="flex items-center gap-3 text-primary font-extrabold mb-4">
                <Info size={18} />
                <h4 className="uppercase tracking-widest text-xs">Información Vital</h4>
              </div>
              <p className="text-sm text-text-light">Bienvenido a tu centro de apoyo digital. Aquí puedes reportar situaciones de riesgo o hablar con VERSA IA.</p>
            </div>
          </UniversalSidebar>
        </aside>

        {/* 🏛️ ÁREA DE ACCIÓN PRINCIPAL */}
        <main className="lg:col-span-3">
          <header className="mb-10">
            <h2 className="page-title">Centro de Apoyo Versa</h2>
            <p className="page-subtitle">Hola, {user?.name.split(' ')[0]}. Tu seguridad y bienestar son nuestra prioridad absoluta.</p>
          </header>

          {/* 🔘 NAVEGACIÓN CAPSULA (UX FLUIDA) */}
          <nav className="management-tabs">
            {menuItems.map(item => (
              <button 
                key={item.id}
                className={`mgmt-tab ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* 💎 CONTENEDOR DE CRISTAL (DINÁMICO) */}
          <section className="p-card mgmt-content min-h-[500px]">
            {activeMenu === 'chat' && (
              <div className="animate-fade-in">
                <AmazonLexChat user={user} />
              </div>
            )}
            
            {activeMenu === 'denuncia' && <DenunciaFacil user={user} />}
            {activeMenu === 'normatividad' && <Normatividad />}
            {activeMenu === 'test' && <TestVersa user={user} />}
          </section>
        </main>

      </div>
    </div>
  )
}

export default StudentDashboard
