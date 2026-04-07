import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { Briefcase, FileText, Send, ClipboardCheck, Paperclip, Book, Info } from 'lucide-react'
import UniversalSidebar from './shared/UniversalSidebar'
import { useCaseTracking } from '../hooks/useCaseTracking'
import { apiFetch } from '../utils/api'

import RemisionForm from './collaborator/RemisionForm'
import ActuacionForm from './collaborator/ActuacionForm'
import SoporteForm from './collaborator/SoporteForm'
import NormatividadForm from './collaborator/NormatividadForm'

import '../styles/components/CollaboratorDashboard.css'

/**
 * 🏛️ COLLABORATOR DASHBOARD LUXE
 * Estación de Trabajo Profesional para Intervenciones Psicosociales.
 */
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
    } catch (e) { 
      console.error("❌ Fallo cargando caseload:", e) 
    } finally { setLoadingAlerts(false) }
  }

  useEffect(() => { fetchAssignedAlerts() }, [])

  const [forms, setForms] = useState({
    remision: { area: 'Psicología', responsable: '', fecha: new Date().toISOString().split('T')[0], motivo: '', urgencia: 'Media', observaciones: '' },
    actuacion: { tipo: 'Contacto telefónico con el usuario', fechaHora: new Date().toISOString().slice(0, 16), responsable: user?.name, descripcion: '', resultado: '' },
    soporte: { tipo: 'Registro de llamada', fechaCarga: new Date().toISOString().split('T')[0], nombreArchivo: '', descripcion: '' },
    normatividad: { tipo: 'Reglamento institucional', articulo: '', descripcion: '', referencia: '' }
  })

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
    if (!selectedAlert) return;
    
    let actionData = { alertId: selectedAlert.id, collaboratorId: user.id, category: category, responsibleName: user.name };

    // Mapeo táctico de intervención
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
      setSaveMessage(`✅ ${category} registrada en bitácora`);
      resetForm(menu);
      fetchAssignedAlerts();
      setTimeout(() => setSaveMessage(''), 4000);
    }
  }

  return (
    <div className="luxe-theme-container min-h-screen">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="collaborator-container py-10 px-6 max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* 🛰️ SIDEBAR DE CARGA LABORAL (CASELOAD) */}
          <aside className="lg:col-span-1">
            <UniversalSidebar user={user} stats={{ activeUsers: 1, totalAlerts: assignedAlerts.length, dbConnected: true }}>
              <div className="p-card caseload-card mb-6">
                <header className="case-list-header flex items-center gap-3">
                  <h4 className="flex items-center gap-2">
                    <Briefcase size={16} /> 
                    Mis Casos Activos
                  </h4>
                  <span className="p-badge-red text-xs px-2 py-1 bg-primary/10 rounded-full font-black text-primary">
                    {assignedAlerts.length}
                  </span>
                </header>
                
                <div className="caseload-list overflow-y-auto max-h-[500px]">
                  {loadingAlerts ? <div className="p-6 text-center opacity-50">Sincronizando...</div> :
                   assignedAlerts.length === 0 ? <div className="p-8 text-center text-sm font-medium opacity-50">Sin casos asignados</div> :
                   assignedAlerts.map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAlert(a)} 
                      className={`case-item ${selectedAlert?.id === a.id ? 'active' : ''} ${a.severity?.toLowerCase() || 'bajo'}`}
                    >
                      <div className="flex justify-between text-xs font-black opacity-50 mb-1">
                        <span>{a.ticketNumber}</span>
                        <span className="uppercase">{a.status}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">{a.studentName}</div>
                      <div className="text-[11px] opacity-60 mt-1 uppercase tracking-tight">{a.alertType}</div>
                    </div>
                  ))}
                </div>
              </div>
            </UniversalSidebar>
          </aside>

          {/* 🏛️ MÓDULO DE INTERVENCIÓN ACTIVA */}
          <main className="lg:col-span-3">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="page-title text-4xl font-extrabold tracking-tighter">Estación de Intervención</h2>
                <p className="page-subtitle text-slate-500 font-medium">Liderazgo y seguimiento psicosocial PrediVersa.</p>
              </div>
              {selectedAlert && (
                <div className="selected-case-badge bg-primary/10 text-primary border border-primary/20">
                   Ticket Activo: {selectedAlert.ticketNumber} | {selectedAlert.studentName}
                </div>
              )}
            </header>

            {/* 🔳 NAVEGACIÓN CAPSULA COLLAB */}
            <nav className="collab-tabs bg-slate-100/50 p-2 rounded-2xl flex gap-2 w-fit mb-8">
              {[
                { id: 'alerta', label: 'Remisión', icon: <Send size={18} /> },
                { id: 'actuaciones', label: 'Actuaciones', icon: <ClipboardCheck size={18} /> },
                { id: 'soporte', label: 'Evidencia', icon: <Paperclip size={18} /> },
                { id: 'normatividad', label: 'Marco Legal', icon: <Book size={18} /> }
              ].map(tab => (
                <button 
                  key={tab.id} 
                  className={`mgmt-tab px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all flex items-center gap-2 ${activeMenu === tab.id ? 'bg-white shadow-xl text-primary scale-105' : 'text-slate-400 opacity-60'}`} 
                  onClick={() => setActiveMenu(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
            
            {/* 💎 PANEL DE GESTIÓN (P-CARD) */}
            <section className="p-card mgmt-content min-h-[550px] relative">
              {saveMessage && (
                <div className="absolute top-6 right-6 flash-message bg-accent/10 border-l-4 border-accent p-4 text-accent font-black animate-slide-in">
                  {saveMessage}
                </div>
              )}
              
              {!selectedAlert ? (
                <div className="welcome-placeholder flex flex-col items-center justify-center h-full text-center">
                  <div className="icon-circle mb-6"><FileText size={48} /></div>
                  <h3 className="text-2xl font-black text-slate-800">Caja de Intervenciones</h3>
                  <p className="text-slate-500 max-w-sm mt-2">Selecciona un caso del panel lateral para iniciar el protocolo de actuación.</p>
                </div>
              ) : (
                <div className="form-container animate-fade-in p-2">
                  {activeMenu === 'alerta' && <RemisionForm form={forms.remision} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} />}
                  {activeMenu === 'actuaciones' && <ActuacionForm form={forms.actuacion} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} />}
                  {activeMenu === 'soporte' && <SoporteForm form={forms.soporte} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} userName={user?.name} />}
                  {activeMenu === 'normatividad' && <NormatividadForm form={forms.normatividad} setForm={setForms} handleSubmit={handleSubmit} loading={loadingActions} />}
                </div>
              )}
            </section>
          </main>

        </div>
      </div>
    </div>
  )
}

export default CollaboratorDashboard
