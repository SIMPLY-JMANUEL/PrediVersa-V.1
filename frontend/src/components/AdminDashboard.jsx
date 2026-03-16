import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { FileSpreadsheet, Users, Bell, BarChart3, Settings } from 'lucide-react'
import ExcelUploader from './ExcelUploader'
import { useUserPhoto } from '../hooks/useUserPhoto'
import { useUsers } from '../hooks/useUsers'
import { useAlerts } from '../hooks/useAlerts'

import AdminStats from './admin/AdminStats'
import AlertList from './admin/AlertList'
import AlertDetails from './admin/AlertDetails'
import AlertAssignment from './admin/AlertAssignment'
import UserForm from './admin/UserForm'
import UserDetailsModal from './admin/UserDetailsModal'
import UserVerification from './admin/UserVerification'
import VersaNotifications from './admin/VersaNotifications'
import AdminSidebar from './admin/AdminSidebar'
import CaseTimeline from './admin/CaseTimeline'

import '../ProfessionalTheme.css'
import './AdminDashboard.css'

const exportToCSV = (users, filename = 'usuarios.csv') => {
  if (users.length === 0) return
  const headers = ['Nombre', 'Email', 'Rol', 'Estado', 'Teléfono', 'Dirección', 'Fecha Creación']
  const csvContent = [
    headers.join(','),
    ...users.map(u => [
      `"${u.name || ''}"`, `"${u.email || ''}"`, `"${u.role || ''}"`, `"${u.status || ''}"`,
      `"${u.phone || ''}"`, `"${u.address || ''}"`, `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}"`
    ].join(','))
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob); link.download = filename; link.click()
}

function AdminDashboard({ user, onLogout }) {
  const token = localStorage.getItem('token')
  const { 
    loadingUsers, searchTerm, setSearchTerm, paginatedUsers, totalPages, stats, 
    fetchUsers, currentPage, setCurrentPage, filteredUsers 
  } = useUsers(token)
  
  // Sincronizar pestañas con el Sidebar
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'alertas') setSelectedAlert(null);
  };
  const { 
    alerts, loadingAlerts, notifVersa, setNotifVersa, notifVisible, setNotifVisible, fetchAlerts 
  } = useAlerts(token)

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showExcelUploader, setShowExcelUploader] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)

  const [userForm, setUserForm] = useState({
    nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '',
    telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
    repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => { fetchAlerts(); fetchUsers(); }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  }

  const handleSave = async () => {
    try {
      // Validación básica
      if (!userForm.nombres || !userForm.id || !userForm.email) {
        setSaveMessage('Error: Nombres, ID y Email son obligatorios');
        return;
      }

      setSaveMessage('Guardando...');
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          documentId: userForm.id, 
          email: userForm.email, 
          name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, 
          phone: userForm.telefono, 
          address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, 
          password: 'Predi123!',
          edad: userForm.edad, 
          lugarNacimiento: userForm.lugarNacimiento,
          nombrePadre: userForm.nombrePadre, 
          nombreMadre: userForm.nombreMadre, 
          grado: userForm.grado,
          repName: userForm.repName, 
          repDocType: userForm.repDocType, 
          repDocId: userForm.repDocId,
          repRelationship: userForm.repRelationship, 
          repPhone: userForm.repPhone,
          repEmail: userForm.repEmail, 
          repAddress: userForm.repAddress
        })
      })
      const data = await response.json()
      if (data.success) {
        setSaveMessage('✅ Usuario creado exitosamente'); 
        fetchUsers();
        setUserForm({ 
          nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', 
          telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
          repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
        })
      } else {
        setSaveMessage('❌ ' + (data.message || 'Error al guardar'));
      }
    } catch (error) { 
      console.error(error);
      setSaveMessage('❌ Error de conexión con el servidor');
    }
    setTimeout(() => setSaveMessage(''), 4000)
  }

  const handleEdit = (u) => {
    setEditingUser(u); const parts = u.name?.split(' ') || ['', '']
    setUserForm({
      nombres: parts[0], apellidos: parts.slice(1).join(' '), id: u.documentId, edad: u.edad || '',
      fechaNacimiento: u.birthDate?.split('T')[0] || '', lugarNacimiento: u.lugarNacimiento || '',
      telefono: u.phone || '', direccion: u.address || '', nombreMadre: u.nombreMadre || '',
      nombrePadre: u.nombrePadre || '', email: u.email, grado: u.grado || '', rol: u.role,
      repName: u.repName || '', repDocType: u.repDocType || 'CC', repDocId: u.repDocId || '',
      repRelationship: u.repRelationship || '', repPhone: u.repPhone || '',
      repEmail: u.repEmail || '', repAddress: u.repAddress || ''
    }); setActiveTab('usuarios')
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          documentId: userForm.id, email: userForm.email, name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, phone: userForm.telefono, address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, edad: userForm.edad, grado: userForm.grado,
          repName: userForm.repName, repDocType: userForm.repDocType, repDocId: userForm.repDocId,
          repRelationship: userForm.repRelationship, repPhone: userForm.repPhone,
          repEmail: userForm.repEmail, repAddress: userForm.repAddress
        })
      })
      const data = await response.json()
      if (data.success) {
        setSaveMessage('Actualizado exitosamente'); setEditingUser(null); fetchUsers();
        setUserForm({ 
          nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', 
          telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
          repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
        })
      }
    } catch (error) { console.error(error) }
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      }); fetchUsers()
    } catch (error) { console.error(error) }
  }

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      <VersaNotifications notifVisible={notifVisible} notifVersa={notifVersa} setNotifVersa={setNotifVersa} setNotifVisible={setNotifVisible} setActiveTab={setActiveTab} />

      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          <AdminSidebar user={user} setActiveTab={switchTab} />

          <main className="dashboard-main">
            <div className="professional-header">
              <h2 className="page-title">Panel de Administración</h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Gestión global de la plataforma PrediVersa.</p>
            </div>

            <div className="management-tabs">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
                { id: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
                { id: 'alertas', label: 'Centro de Alertas', icon: <Bell size={18} /> },
                { id: 'configuracion', label: 'Estructura', icon: <Settings size={18} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`mgmt-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="dashboard-card mgmt-content">
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <AdminStats stats={stats} />
                </div>
              )}

              {activeTab === 'usuarios' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Gestión de Personal</h3>
                    <button className="mgmt-tab active" onClick={() => setShowExcelUploader(true)} style={{ borderRadius: '12px', padding: '10px 20px' }}>
                      <FileSpreadsheet size={16} /> Carga Masiva (Excel)
                    </button>
                  </div>
                  
                  {showExcelUploader && <ExcelUploader onUploadSuccess={fetchUsers} onClose={() => setShowExcelUploader(false)} />}
                  
                  <UserForm userForm={userForm} formErrors={formErrors} handleInputChange={handleInputChange} editingUser={editingUser} handleUpdate={handleUpdate} handleSave={handleSave} cancelEdit={() => { setEditingUser(null); setUserForm({ nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante' }) }} />
                  {saveMessage && <div className={`flash-message ${saveMessage.includes('Error') ? 'error' : ''}`} style={{ marginTop: '1rem' }}>{saveMessage}</div>}
                  
                  <div className="users-list-section" style={{ marginTop: '3rem' }}>
                    <UserVerification 
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm} paginatedUsers={paginatedUsers} 
                      currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} 
                      handleEdit={handleEdit} handleDelete={handleDelete} exportToCSV={exportToCSV} filteredUsers={filteredUsers} 
                    />
                  </div>
                </div>
              )}

              {activeTab === 'alertas' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <button 
                      className={`mgmt-tab-small ${!selectedAlert ? 'active' : ''}`}
                      onClick={() => setSelectedAlert(null)}
                    >
                      Resumen y Listado
                    </button>
                    {selectedAlert && (
                      <>
                        <button className="mgmt-tab-small active">Detalles del Caso</button>
                        <button 
                          className="mgmt-tab-small" 
                          onClick={() => {
                            // Cambiar a vista de asignación si es necesario (el componente AlertAssignment lo maneja)
                            const assignmentSection = document.getElementById('assignment-section');
                            if (assignmentSection) assignmentSection.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Remisión Directa
                        </button>
                      </>
                    )}
                  </div>

                  {!selectedAlert ? (
                    <AlertList alerts={alerts} loadingAlerts={loadingAlerts} onSelectAlert={setSelectedAlert} />
                  ) : (
                    <div className="alert-details-pro">
                      <AlertDetails selectedAlert={selectedAlert} onBack={() => setSelectedAlert(null)} />
                      
                      <div id="assignment-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #e2e8f0' }}>
                        <AlertAssignment 
                          selectedAlert={selectedAlert} 
                          fetchAlerts={fetchAlerts} 
                          onBack={() => setSelectedAlert(null)} 
                        />
                      </div>

                      <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: '#1e293b' }}>Línea de Vida del Caso</h4>
                        <CaseTimeline alertId={selectedAlert.id} token={token} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'configuracion' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
                  <Settings size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Configuración Institucional</h3>
                  <p style={{ color: '#64748b' }}>Módulo para la gestión de dependencias, roles avanzados y auditoría de sistema.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {viewingUser && <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} onEdit={handleEdit} />}
    </div>
  )
}

export default AdminDashboard
