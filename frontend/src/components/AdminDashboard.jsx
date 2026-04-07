import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { FileSpreadsheet, Users, Bell, Settings, BarChart3 } from 'lucide-react'
import ExcelUploader from './ExcelUploader'
import AnalyticsDashboard from './admin/AnalyticsDashboard'
import { useUsers } from '../hooks/useUsers'
import { useAlerts } from '../hooks/useAlerts'
import { useUserManagement } from '../hooks/useUserManagement'
import { exportToCSV } from '../utils/exportUtils'
import { playCriticalAlertSound } from '../utils/audioUtils'

import AlertList from './admin/AlertList'
import AlertCaseView from './admin/AlertCaseView'
import InstitutionalConfig from './admin/InstitutionalConfig'
import UserForm from './admin/UserForm'
import UserVerification from './admin/UserVerification'
import UserRequestsAdmin from './admin/UserRequestsAdmin'

import '../styles/components/AdminDashboard.css'

/**
 * 🏛️ ADMIN DASHBOARD LUXE UI
 * Centro de Mando Institucional PrediVersa v3.0.
 */
function AdminDashboard({ user, onLogout }) {
  const token = localStorage.getItem('token')
  
  // 🔭 GESTIÓN DE DATOS (HOOKS BLINDADOS)
  const { 
    loadingUsers, searchTerm, setSearchTerm, paginatedUsers, totalPages, stats, 
    fetchUsers, currentPage, setCurrentPage, filteredUsers 
  } = useUsers(token)
  
  const { 
    alerts, loadingAlerts, notifVersa, setNotifVersa, notifVisible, setNotifVisible, fetchAlerts,
    alertStats
  } = useAlerts(token)

  const {
    userForm, editingUser, saveMessage, formErrors,
    handleInputChange, handleSave, handleUpdate, handleDelete, handleEdit, handleClear
  } = useUserManagement(fetchUsers)

  const [activeTab, setActiveTab] = useState('usuarios')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showExcelUploader, setShowExcelUploader] = useState(false)

  // 🔘 CAMBIO DE CONSOLA (UX FLUIDA)
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'alertas') setSelectedAlert(null);
  };

  useEffect(() => {
    if (notifVersa.length > 0) {
      if (notifVersa[0].nivel === 'alto') playCriticalAlertSound(880, 0.4);
    }
  }, [notifVersa]);

  useEffect(() => { 
    fetchAlerts(); 
    fetchUsers(); 
  }, [])

  return (
    <div className="luxe-theme-container min-h-screen bg-slate-50">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      {/* 🔔 NOTIFICACIONES DE ALTA PRIORIDAD */}
      <VersaNotifications 
        notifVisible={notifVisible} 
        notifVersa={notifVersa} 
        setNotifVersa={setNotifVersa} 
        setNotifVisible={setNotifVisible} 
        setActiveTab={setActiveTab} 
      />

      <div className="admin-dashboard-container py-10 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* 🛰️ SIDEBAR DE MANDO (ADMIN) */}
          <aside className="lg:col-span-1">
            <AdminSidebar user={user} setActiveTab={switchTab} stats={stats} />
          </aside>

          {/* 🏛️ ÁREA CENTRAL DE GESTIÓN */}
          <main className="lg:col-span-3">
            <header className="mb-12">
              <h2 className="admin-page-title">Panel de Control</h2>
              <p className="admin-page-subtitle">Monitoreo Psicosocial e Identidades Centralizadas.</p>
            </header>

            {/* 🔘 CONSOLA DE TABS DE ALTA GAMA */}
            <nav className="admin-nav-tabs">
              {[
                { id: 'usuarios', label: 'Identidades', icon: <Users size={19} /> },
                { id: 'solicitudes', label: 'Solicitudes', icon: <UserPlus size={19} /> },
                { id: 'alertas', label: 'Monitoría', icon: <Bell size={19} /> },
                { id: 'analitica', label: 'Inteligencia', icon: <BarChart3 size={19} /> },
                { id: 'configuracion', label: 'Estructura', icon: <Settings size={19} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* 💎 PANEL DE ADMINISTRACIÓN (P-CARD) */}
            <section className="p-card admin-mgmt-pane">
              
              {activeTab === 'solicitudes' && <UserRequestsAdmin />}

              {activeTab === 'usuarios' && (
                <div className="animate-fade-in">
                  <div className="mgmt-header-row border-b border-gray-100 mb-8 pb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Gestión de Usuarios</h3>
                      <p className="text-slate-500 text-sm mt-1">Alta, modificación y auditoría de perfiles institucionales.</p>
                    </div>
                    <button className="p-btn-primary flex items-center gap-2" onClick={() => setShowExcelUploader(true)}>
                      <FileSpreadsheet size={16} /> Importar Excel (Masa)
                    </button>
                  </div>
                  
                  {showExcelUploader && <ExcelUploader onUploadSuccess={fetchUsers} onClose={() => setShowExcelUploader(false)} />}
                  
                  <UserForm 
                    userForm={userForm} 
                    formErrors={formErrors} 
                    handleInputChange={handleInputChange} 
                    editingUser={editingUser} 
                    handleUpdate={handleUpdate} 
                    handleSave={handleSave} 
                    handleClear={handleClear} 
                  />

                  {saveMessage && (
                    <div className={`flash-message ${saveMessage.includes('❌') ? 'error' : ''} my-6`}>
                      {saveMessage}
                    </div>
                  )}
                  
                  <div className="mt-10">
                    <UserVerification 
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                      paginatedUsers={paginatedUsers} 
                      currentPage={currentPage} totalPages={totalPages} 
                      setCurrentPage={setCurrentPage} 
                      handleEdit={handleEdit} 
                      handleDelete={handleDelete} 
                      exportToCSV={() => exportToCSV(filteredUsers)} 
                      filteredUsers={filteredUsers} 
                      fetchUsers={fetchUsers}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'alertas' && (
                <div className="animate-fade-in">
                  {!selectedAlert ? (
                    <AlertList alerts={alerts} loadingAlerts={loadingAlerts} onSelectAlert={setSelectedAlert} />
                  ) : (
                    <AlertCaseView
                      selectedAlert={selectedAlert}
                      onBack={() => setSelectedAlert(null)}
                      fetchAlerts={fetchAlerts}
                      token={token}
                    />
                  )}
                </div>
              )}

              {activeTab === 'analitica' && <AnalyticsDashboard stats={alertStats} />}
              {activeTab === 'configuracion' && <InstitutionalConfig />}

            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
