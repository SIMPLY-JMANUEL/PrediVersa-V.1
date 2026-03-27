import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { FileSpreadsheet, Users, Bell, Settings, BarChart3 } from 'lucide-react'
import ExcelUploader from './ExcelUploader'
import AnalyticsDashboard from './admin/AnalyticsDashboard'
import { useUserPhoto } from '../hooks/useUserPhoto'
import { useUsers } from '../hooks/useUsers'
import { useAlerts } from '../hooks/useAlerts'

import AlertList from './admin/AlertList'
import AlertCaseView from './admin/AlertCaseView'
import InstitutionalConfig from './admin/InstitutionalConfig'
import UserForm from './admin/UserForm'
import UserDetailsModal from './admin/UserDetailsModal'
import UserVerification from './admin/UserVerification'
import VersaNotifications from './admin/VersaNotifications'
import AdminSidebar from './admin/AdminSidebar'

import { apiFetch, BASE_URL } from '../utils/api' // FIX A-1: centralizar URL base
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
  const { 
    alerts, loadingAlerts, notifVersa, setNotifVersa, notifVisible, setNotifVisible, fetchAlerts,
    alertStats, fetchAlertStats
  } = useAlerts(token)

  const [activeTab, setActiveTab] = useState('usuarios')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showExcelUploader, setShowExcelUploader] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)

  // FIX A-3: switchTab declarado DESPUÉS de useState para evitar referencia temprana a setActiveTab
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'alertas') setSelectedAlert(null);
  };

  const [userForm, setUserForm] = useState({
    nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '',
    telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
    repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Play sound on critical alerts
  useEffect(() => {
    if (notifVersa.length > 0) {
      const latest = notifVersa[0];
      if (latest.nivel === 'alto' && !latest.tipo?.includes('colaborador')) {
        playAlertSound();
      }
    }
  }, [notifVersa]);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.error('Audio not supported', e); }
  };

  useEffect(() => { fetchAlerts(); fetchUsers(); }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  }

  const handleSave = async () => {
    try {
      // Generar email automáticamente si no existe (al igual que en la vista visual)
      let finalEmail = userForm.email;
      if (!finalEmail && userForm.nombres) {
        const parts = userForm.nombres.toLowerCase().split(' ');
        const first = parts[0] || '';
        const last = parts[1] || '';
        const docSuffix = (userForm.id || '').slice(-4);
        finalEmail = `${first}${last ? '.' + last : ''}${docSuffix}@prediversa.edu.co`;
      }

      // Validación básica
      if (!userForm.nombres || !userForm.id || !finalEmail) {
        setSaveMessage('Error: Nombres y N° Documento (ID) son obligatorios');
        return;
      }

      // FIX A-5: Generar contraseña aleatoria segura en lugar de hardcodeada 'Predi123!'
      const randomPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!';
      setSaveMessage('Guardando...');
      const response = await apiFetch('/api/users', { // FIX A-1: usar apiFetch
        method: 'POST',
        body: JSON.stringify({
          documentId: userForm.id, 
          email: finalEmail, 
          name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, 
          phone: userForm.telefono, 
          address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, 
          password: randomPass,
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
      const data = response
      if (data.success) {
        setSaveMessage(`✅ Usuario creado. Contraseña temporal: ${randomPass}`); // FIX A-5: mostrar la contraseña generada al admin 
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
      const response = await apiFetch(`/api/users/${editingUser.id}`, { // FIX A-1: usar apiFetch
        method: 'PUT',
        body: JSON.stringify({
          documentId: userForm.id, email: userForm.email, name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol, phone: userForm.telefono, address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null, edad: userForm.edad, grado: userForm.grado,
          repName: userForm.repName, repDocType: userForm.repDocType, repDocId: userForm.repDocId,
          repRelationship: userForm.repRelationship, repPhone: userForm.repPhone,
          repEmail: userForm.repEmail, repAddress: userForm.repAddress
        })
      })
      const data = response // apiFetch ya retorna JSON
      if (data.success) {
        setSaveMessage('Actualizado exitosamente'); setEditingUser(null); fetchUsers();
        setUserForm({ 
          nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', 
          telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
          repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
        }); setFormErrors({});
      }
    } catch (error) { 
      console.error(error); setSaveMessage('❌ Error de conexión');
    }
    setTimeout(() => setSaveMessage(''), 4000)
  }
  
  const handleClear = (e) => {
    if (e) e.preventDefault();
    setEditingUser(null);
    setSaveMessage('');
    setUserForm({ 
      nombres: '', apellidos: '', id: '', edad: '', fechaNacimiento: '', lugarNacimiento: '', 
      telefono: '', direccion: '', nombreMadre: '', nombrePadre: '', email: '', grado: '', rol: 'Estudiante',
      repName: '', repDocType: 'CC', repDocId: '', repRelationship: '', repPhone: '', repEmail: '', repAddress: ''
    });
    setFormErrors({});
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      await apiFetch(`/api/users/${id}`, { // FIX A-1: usar apiFetch
        method: 'DELETE'
      }); fetchUsers()
    } catch (error) { console.error(error) }
  }

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      <VersaNotifications notifVisible={notifVisible} notifVersa={notifVersa} setNotifVersa={setNotifVersa} setNotifVisible={setNotifVisible} setActiveTab={setActiveTab} />

      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          <AdminSidebar user={user} setActiveTab={switchTab} stats={stats} />

          <main className="dashboard-main">
            <div className="professional-header">
              <h2 className="page-title">Panel de Administración</h2>
              <p className="page-subtitle">Gestión global de la plataforma PrediVersa.</p>
            </div>

            <div className="management-tabs">
              {[
                { id: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
                { id: 'alertas', label: 'Centro de Alertas', icon: <Bell size={18} /> },
                { id: 'analitica', label: 'Inteligencia', icon: <BarChart3 size={18} /> },
                { id: 'configuracion', label: 'Estructura', icon: <Settings size={18} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`mgmt-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => switchTab(tab.id)} // FIX A-4: usar switchTab para limpiar selectedAlert
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            

            <div className="dashboard-card mgmt-content">
              {activeTab === 'usuarios' && (
                <div className="animate-fade-in">
                  <div className="mgmt-header-row">
                    <div className="mgmt-header-titles">
                      <h3 className="mgmt-title-pro">Gestión de Personal</h3>
                      <p className="mgmt-subtitle-pro">Administra los perfiles y accesos de la comunidad educativa.</p>
                    </div>
                    <button 
                      className="btn-primary-pro" 
                      onClick={() => setShowExcelUploader(true)} 
                    >
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
                  {saveMessage && <div className={`flash-message ${saveMessage.includes('Error') ? 'error' : ''}`} style={{ marginTop: '1rem' }}>{saveMessage}</div>}
                  
                  <div className="users-list-section" style={{ marginTop: '1.5rem' }}>
                    <UserVerification 
                      searchTerm={searchTerm} setSearchTerm={setSearchTerm} paginatedUsers={paginatedUsers} 
                      currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} 
                      handleEdit={handleEdit} handleDelete={handleDelete} exportToCSV={exportToCSV} 
                      filteredUsers={filteredUsers} fetchUsers={fetchUsers}
                      onViewDetails={setViewingUser}
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

              {activeTab === 'analitica' && (
                <div className="animate-fade-in">
                  <AnalyticsDashboard stats={alertStats} />
                </div>
              )}
              
              {activeTab === 'configuracion' && (
                <div className="animate-fade-in">
                  <InstitutionalConfig />
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
