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
import UserDetailsModal from './admin/UserDetailsModal'
import UserVerification from './admin/UserVerification'
import VersaNotifications from './admin/VersaNotifications'
import AdminSidebar from './admin/AdminSidebar'

import '../ProfessionalTheme.css'
import './AdminDashboard.css'

function AdminDashboard({ user, onLogout }) {
  const token = localStorage.getItem('token')
  
  // Hooks de Gestión de Datos
  const { 
    loadingUsers, searchTerm, setSearchTerm, paginatedUsers, totalPages, stats, 
    fetchUsers, currentPage, setCurrentPage, filteredUsers 
  } = useUsers(token)
  
  const { 
    alerts, loadingAlerts, notifVersa, setNotifVersa, notifVisible, setNotifVisible, fetchAlerts,
    alertStats
  } = useAlerts(token)

  // Hook Central de Gestión de Usuarios (Filtro por Lupa)
  const {
    userForm, editingUser, saveMessage, formErrors,
    handleInputChange, handleSave, handleUpdate, handleDelete, handleEdit, handleClear
  } = useUserManagement(fetchUsers)

  const [activeTab, setActiveTab] = useState('usuarios')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showExcelUploader, setShowExcelUploader] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)

  // Cambio de Tab Inteligente
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'alertas') setSelectedAlert(null);
  };

  // Notificaciones Sonoras para Riesgo Crítico
  useEffect(() => {
    if (notifVersa.length > 0) {
      const latest = notifVersa[0];
      if (latest.nivel === 'alto' && !latest.tipo?.includes('colaborador')) {
        playCriticalAlertSound(880, 0.5);
      }
    }
  }, [notifVersa]);

  // Carga inicial
  useEffect(() => { 
    fetchAlerts(); 
    fetchUsers(); 
  }, [])

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <VersaNotifications 
        notifVisible={notifVisible} 
        notifVersa={notifVersa} 
        setNotifVersa={setNotifVersa} 
        setNotifVisible={setNotifVisible} 
        setActiveTab={setActiveTab} 
      />

      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          <AdminSidebar user={user} setActiveTab={switchTab} stats={stats} />

          <main className="dashboard-main">
            <div className="professional-header">
              <h2 className="page-title">Panel de Administración</h2>
              <p className="page-subtitle">Sincronización total de la comunidad PrediVersa.</p>
            </div>

            {/* Menú de Navegación Analítico */}
            <div className="management-tabs">
              {[
                { id: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
                { id: 'alertas', label: 'Monitoría', icon: <Bell size={18} /> },
                { id: 'analitica', label: 'Inteligencia', icon: <BarChart3 size={18} /> },
                { id: 'configuracion', label: 'Estructura', icon: <Settings size={18} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`mgmt-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mgmt-content">
              {/* VISTA: GESTIÓN DE USUARIOS */}
              {activeTab === 'usuarios' && (
                <div className="animate-fade-in section-usuarios">
                  <div className="mgmt-header-row">
                    <div>
                      <h3 className="mgmt-title-pro">Gestión de Identidades</h3>
                      <p className="mgmt-subtitle-pro">Alta, baja y modificación de perfiles institucionales.</p>
                    </div>
                    <button className="btn-primary-pro" onClick={() => setShowExcelUploader(true)}>
                      <FileSpreadsheet size={16} /> Carga Masiva (Excel)
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
                    cancelEdit={handleClear} 
                  />

                  {saveMessage && <div className={`flash-message ${saveMessage.includes('❌') ? 'error' : ''}`}>{saveMessage}</div>}
                  
                  <div className="users-list-section">
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
                      onViewDetails={setViewingUser}
                    />
                  </div>
                </div>
              )}

              {/* VISTA: CENTRO DE ALERTAS */}
              {activeTab === 'alertas' && (
                <div className="animate-fade-in section-alertas">
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

              {/* VISTA: INTELIGENCIA PREDICTIVA */}
              {activeTab === 'analitica' && (
                <div className="animate-fade-in section-analitica">
                  <AnalyticsDashboard stats={alertStats} />
                </div>
              )}
              
              {/* VISTA: CONFIGURACIÓN INSTITUCIONAL */}
              {activeTab === 'configuracion' && (
                <div className="animate-fade-in section-config">
                  <InstitutionalConfig />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {viewingUser && (
        <UserDetailsModal 
          user={viewingUser} 
          onClose={() => setViewingUser(null)} 
          onEdit={handleEdit} 
        />
      )}
    </div>
  )
}

export default AdminDashboard
