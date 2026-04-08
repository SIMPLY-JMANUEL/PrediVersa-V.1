import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { Briefcase, FileText, Send, ClipboardCheck, Paperclip, Book } from 'lucide-react'
import UniversalSidebar from './shared/UniversalSidebar'
import { useCaseTracking } from '../hooks/useCaseTracking'
import { apiFetch } from '../utils/api'

// Importación de componentes modulares (Lupa Clean Code)
import RemisionForm from './collaborator/RemisionForm'
import ActuacionForm from './collaborator/ActuacionForm'
import SoporteForm from './collaborator/SoporteForm'
import NormatividadForm from './collaborator/NormatividadForm'

import './CollaboratorDashboard.css'

function CollaboratorDashboard({ user, onLogout }) {
  const token = localStorage.getItem('token')
  const [activeMenu, setActiveMenu] = useState('alerta')
  const { registerAction, loadingActions } = useCaseTracking(token)

  const [assignedAlerts, setAssignedAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const fetchAssignedAlerts = async () => {
    setLoadingAlerts(true)
    try {
      const data = await apiFetch(`/api/alerts`);
      if (data.success) {
        const myAlerts = data.alerts.filter(a => 
          a.assignedTo && a.assignedTo.toLowerCase().trim() === user?.name?.toLowerCase().trim()
        )
        setAssignedAlerts(myAlerts)
      }
    } catch (e) { console.error("Error cargando alertas:", e) }
    finally { setLoadingAlerts(false) }
  }

  useEffect(() => {
    fetchAssignedAlerts()
  }, [])

  const [forms, setForms] = useState({
    remision: { area: 'Psicología', responsable: '', fecha: new Date().toISOString().split('T')[0], motivo: '', urgencia: 'Media', observaciones: '' },
    actuacion: { tipo: 'Contacto telefónico con el usuario', fechaHora: new Date().toISOString().slice(0, 16), responsable: user?.name, descripcion: '', resultado: '' },
    soporte: { tipo: 'Registro de llamada', fechaCarga: new Date().toISOString().split('T')[0], nombreArchivo: '', descripcion: '' },
    normatividad: { tipo: 'Reglamento institucional', articulo: '', descripcion: '', referencia: '' }
  })

  // Lógica de reseteo de estados
  const resetForm = (menu) => {
    const defaults = {
      remision: { area: 'Psicología', responsable: '', fecha: new Date().toISOString().split('T')[0], motivo: '', urgencia: 'Media', observaciones: '' },
      actuacion: { tipo: 'Contacto telefónico con el usuario', fechaHora: new Date().toISOString().slice(0, 16), responsable: user?.name, descripcion: '', resultado: '' },
      soporte: { tipo: 'Registro de llamada', fechaCarga: new Date().toISOString().split('T')[0], nombreArchivo: '', descripcion: '' },
      normatividad: { tipo: 'Reglamento institucional', articulo: '', descripcion: '', referencia: '' }
    }
    setForms(prev => ({ ...prev, [menu]: defaults[menu] }))
  }

  const handleSubmit = async (menu, category) => {
    if (!selectedAlert) return alert('Seleccione un caso primero del panel izquierdo.')
    
    let actionData = { alertId: selectedAlert.id, collaboratorId: user.id, category: category, responsibleName: user.name };

    // Mapeo dinámico según la sección seleccionada
    if (menu === 'remision') {
      actionData = { ...actionData, actionType: `Remisión a ${forms.remision.area}`, area: forms.remision.area, responsibleName: forms.remision.responsable, description: forms.remision.motivo, urgency: forms.remision.urgencia, result: forms.remision.observaciones, actionDate: forms.remision.fecha };
    } else if (menu === 'actuaciones') {
      actionData = { ...actionData, actionType: forms.actuacion.tipo, description: forms.actuacion.descripcion, result: forms.actuacion.resultado, actionDate: forms.actuacion.fechaHora };
    } else if (menu === 'soporte') {
      actionData = { ...actionData, actionType: forms.soporte.tipo, fileName: forms.soporte.nombreArchivo, description: forms.soporte.descripcion, actionDate: forms.soporte.fechaCarga };
    } else if (menu === 'normatividad') {
      actionData = { ...actionData, actionType: forms.normatividad.tipo, normType: forms.normatividad.tipo, normArticle: forms.normatividad.articulo, description: forms.normatividad.descripcion, fileUrl: forms.normatividad.referencia };
    }

    const res = await registerAction(actionData)
    if (res.success) {
      setSaveMessage(`✅ ${category} registrada correctamente`);
      resetForm(menu);
      fetchAssignedAlerts();
      setTimeout(() => setSaveMessage(''), 4000);
    }
  }

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          
          <UniversalSidebar user={user} stats={{ totalUsers: 1, activeUsers: 1, totalAlerts: assignedAlerts.length, verifiedUsers: 0, dbConnected: true }}>
            <div className="dashboard-card caseload-card">
              <h4 className="card-title"><Briefcase size={18} /> Casos Asignados <span className="badge">{assignedAlerts.length}</span></h4>
              <div className="caseload-list">
                {loadingAlerts ? <div className="loading-small">Cargando...</div> :
                 assignedAlerts.length === 0 ? <div className="empty-state">Sin casos asignados</div> :
                 assignedAlerts.map(a => (
                   <div key={a.id} onClick={() => setSelectedAlert(a)} className={`case-item ${selectedAlert?.id === a.id ? 'active' : ''} ${a.alertType.toLowerCase()}`}>
                     <div className="case-header">
                       <span className="case-ticket">{a.ticketNumber}</span>
                       <span className={`case-status status-${a.status.toLowerCase().replace(' ', '-')}`}>{a.status}</span>
                     </div>
                     <div className="case-name">{a.studentName}</div>
                     <div className="case-type">{a.alertType}</div>
                   </div>
                 ))
                }
              </div>
            </div>
          </UniversalSidebar>

          <main className="dashboard-main">
            <div className="professional-header">
              <h2 className="page-title">Gestión Profesional de Casos</h2>
              {selectedAlert && (
                <div className="selected-case-summary">
                  <span>Atendiendo a: <b>{selectedAlert.studentName}</b> | Ticket: <b>{selectedAlert.ticketNumber}</b></span>
                </div>
              )}
            </div>

            <div className="management-tabs">
              {[
                { id: 'alerta', label: '1. Remisión', icon: <Send size={18} /> },
                { id: 'actuaciones', label: '2. Actuaciones', icon: <ClipboardCheck size={18} /> },
                { id: 'soporte', label: '3. Soporte', icon: <Paperclip size={18} /> },
                { id: 'normatividad', label: '4. Normatividad', icon: <Book size={18} /> }
              ].map(tab => (
                <button key={tab.id} className={`mgmt-tab ${activeMenu === tab.id ? 'active' : ''}`} onClick={() => setActiveMenu(tab.id)}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            
            <div className="dashboard-card mgmt-content">
              {saveMessage && <div className="flash-message animate-fade-in">{saveMessage}</div>}
              
              {!selectedAlert ? (
                <div className="welcome-placeholder">
                  <div className="icon-circle"><FileText size={48} /></div>
                  <h3>Gestión de Casos</h3>
                  <p>Seleccione un caso del panel izquierdo para registrar intervenciones.</p>
                </div>
              ) : (
                <div className="form-container">
                  {activeMenu === 'alerta' && <RemisionForm form={forms.remision} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} />}
                  {activeMenu === 'actuaciones' && <ActuacionForm form={forms.actuacion} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} />}
                  {activeMenu === 'soporte' && <SoporteForm form={forms.soporte} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} userName={user?.name} />}
                  {activeMenu === 'normatividad' && <NormatividadForm form={forms.normatividad} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} />}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default CollaboratorDashboard
