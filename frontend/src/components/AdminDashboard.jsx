import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { FileSpreadsheet } from 'lucide-react'
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

import './StudentDashboard.css'
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
  const [photo] = useUserPhoto()
  const { 
    loadingUsers, searchTerm, setSearchTerm, paginatedUsers, totalPages, stats, 
    fetchUsers, currentPage, setCurrentPage, filteredUsers 
  } = useUsers(token)
  const { 
    alerts, loadingAlerts, notifVersa, setNotifVersa, notifVisible, setNotifVisible, fetchAlerts 
  } = useAlerts(token)

  const [activeTab, setActiveTab] = useState('creacion')
  const [activeAlertTab, setActiveAlertTab] = useState('alertas')
  const [showExcelUploader, setShowExcelUploader] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)

  const [userForm, setUserForm] = useState({
    nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '',
    telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante'
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => { fetchAlerts(); fetchUsers(); }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  }

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          documentId: userForm.id, email: userForm.email, name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, phone: userForm.telefono, address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, password: 'Password123'
        })
      })
      const data = await response.json()
      if (data.success) {
        setSaveMessage('Usuario creado exitosamente'); fetchUsers();
        setUserForm({ nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante' })
      }
    } catch (error) { console.error(error) }
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleEdit = (u) => {
    setEditingUser(u); const parts = u.name?.split(' ') || ['', '']
    setUserForm({
      nombres: parts[0], apellidos: parts.slice(1).join(' '), id: u.documentId, edad: u.edad || '',
      fechaNacimiento: u.birthDate?.split('T')[0] || '', lugarNacimiento: u.lugarNacimiento || '',
      telefono: u.phone || '', direccion: u.address || '', nombreMadre: u.nombreMadre || '',
      nombrePadre: u.nombrePadre || '', email: u.email, grado: u.grado || '', rol: u.role
    }); setActiveTab('creacion')
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          documentId: userForm.id, email: userForm.email, name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, phone: userForm.telefono, address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, edad: userForm.edad, grado: userForm.grado
        })
      })
      const data = await response.json()
      if (data.success) {
        setSaveMessage('Actualizado exitosamente'); setEditingUser(null); fetchUsers();
        setUserForm({ nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante' })
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
    <div className="dashboard-wrapper">
      <DashboardHeader user={user} onLogout={onLogout} />
      <VersaNotifications notifVisible={notifVisible} notifVersa={notifVersa} setNotifVersa={setNotifVersa} setNotifVisible={setNotifVisible} setActiveTab={setActiveTab} />

      <div className="dashboard-container" style={{maxWidth: '1600px', width: '100%'}}>
        <div className="dashboard-layout">
          <AdminSidebar photo={photo} user={user} />

          <main className="dashboard-main">
            <div className="admin-dashboard-wireframe" style={{padding: '0', maxWidth: '100%'}}>
              <AdminStats stats={stats} />

              <div className="user-creation-section">
                <div className="tabs-row">
                  <button className={`tab-btn ${activeTab === 'creacion' ? 'active' : ''}`} onClick={() => setActiveTab('creacion')}>Creación</button>
                  <button className={`tab-btn ${activeTab === 'verificacion' ? 'active' : ''}`} onClick={() => setActiveTab('verificacion')}>Verificación</button>
                  <button className="tab-btn excel-upload-btn" onClick={() => setShowExcelUploader(true)}><FileSpreadsheet size={16} /> Excel</button>
                </div>

                {showExcelUploader && <ExcelUploader onUploadSuccess={fetchUsers} onClose={() => setShowExcelUploader(false)} />}

                {activeTab === 'creacion' && (
                  <>
                    <UserForm userForm={userForm} formErrors={formErrors} handleInputChange={handleInputChange} editingUser={editingUser} handleUpdate={handleUpdate} handleSave={handleSave} cancelEdit={() => { setEditingUser(null); setUserForm({ nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante' }) }} />
                    {saveMessage && <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>{saveMessage}</div>}
                    <div className="users-list-section">
                      <h3 className="users-list-title">Últimos Creados</h3>
                      <div className="users-table">
                        <div className="users-table-header"><span>Nombre</span><span>Email</span><span>Rol</span><span>Acciones</span></div>
                        {paginatedUsers.slice(0, 5).map(u => (
                          <div key={u.id} className="users-table-row">
                            <span>{u.name}</span><span>{u.email}</span><span>{u.role}</span>
                            <span>
                              <button className="action-btn-small view" onClick={() => setViewingUser(u)}>👁️</button>
                              <button className="action-btn-small edit" onClick={() => handleEdit(u)}>Editar</button>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'verificacion' && (
                  <UserVerification 
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm} paginatedUsers={paginatedUsers} 
                    currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} 
                    handleEdit={handleEdit} handleDelete={handleDelete} exportToCSV={exportToCSV} filteredUsers={filteredUsers} 
                  />
                )}
              </div>

              <div className="alerts-section">
                <div className="alerts-tabs-row">
                  {['alertas', 'asignacion', 'acciones', 'estadoProceso'].map(t => (
                    <button key={t} className={`alert-tab-btn ${activeAlertTab === t ? 'active' : ''}`} onClick={() => setActiveAlertTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                  ))}
                </div>
                <div className="alerts-content">
                  {activeAlertTab === 'alertas' && (!selectedAlert ? <AlertList alerts={alerts} loadingAlerts={loadingAlerts} onSelectAlert={setSelectedAlert} /> : <AlertDetails selectedAlert={selectedAlert} onBack={() => setSelectedAlert(null)} />)}
                  {activeAlertTab === 'asignacion' && <AlertAssignment selectedAlert={selectedAlert} fetchAlerts={fetchAlerts} onBack={() => { setActiveAlertTab('alertas'); setSelectedAlert(null); }} />}
                  {activeAlertTab === 'acciones' && (
                    selectedAlert ? 
                    <CaseTimeline alertId={selectedAlert.id} token={token} /> :
                    <div className="p-8 text-center text-gray-400">Selecciona un caso en la pestaña "Alertas" para ver sus acciones.</div>
                  )}
                  {activeAlertTab === 'estadoProceso' && (
                    selectedAlert ?
                    <div className="p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6" style={{ background: '#f8fafc' }}>
                        <h4 className="font-bold text-gray-800 mb-2">Estado Actual del Proceso</h4>
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                            selectedAlert.status === 'Resuelta' ? 'bg-green-100 text-green-700' :
                            selectedAlert.status === 'En Proceso' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedAlert.status}
                          </div>
                          <span className="text-gray-500 text-sm">Responsable: <b>{selectedAlert.assignedTo || 'Sin asignar'}</b></span>
                        </div>
                      </div>
                      <CaseTimeline alertId={selectedAlert.id} token={token} />
                    </div> :
                    <div className="p-8 text-center text-gray-400">Selecciona un caso para ver el flujo del proceso.</div>
                  )}
                </div>
              </div>
              {viewingUser && <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} onEdit={handleEdit} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
