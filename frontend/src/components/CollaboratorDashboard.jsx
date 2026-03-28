import { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import { Briefcase, Info, AlertCircle, FileText, Send, Paperclip, ClipboardCheck, Book, Scale, User, Calendar, CheckCircle } from 'lucide-react'
import UniversalSidebar from './shared/UniversalSidebar'
import { useCaseTracking } from '../hooks/useCaseTracking'
import { apiFetch } from '../utils/api'
import './CollaboratorDashboard.css'

function CollaboratorDashboard({ user, onLogout }) {
  const token = localStorage.getItem('token')
  const [activeMenu, setActiveMenu] = useState('alerta')
  const { registerAction, loadingActions } = useCaseTracking(token)

  const [assignedAlerts, setAssignedAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // 📡 Notificaciones en tiempo real
  const [notifVersa, setNotifVersa] = useState([])
  const [notifVisible, setNotifVisible] = useState(false)

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
      } catch (e) { console.error(e) }
      finally { setLoadingAlerts(false) }
    }

    useEffect(() => {
      fetchAssignedAlerts()
      const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const source = new EventSource(`${api_url}/api/chatbot/stream?token=${token}`)
      
      source.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.tipo === 'conexion') return
          setNotifVersa(prev => [data, ...prev].slice(0, 20))
          setNotifVisible(true)
          fetchAssignedAlerts()
        } catch { /* silent */ }
      }

      source.onerror = () => { /* El navegador reconectará automáticamente */ }
      
      return () => source.close()
    }, [])

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
    if (!selectedAlert) return alert('Seleccione un caso primero del panel izquierdo.')
    
    let actionData = {
      alertId: selectedAlert.id,
      collaboratorId: user.id,
      category: category,
      responsibleName: user.name
    }

    if (menu === 'remision') {
      actionData = {
        ...actionData,
        actionType: `Remisión a ${forms.remision.area}`,
        area: forms.remision.area,
        responsibleName: forms.remision.responsable,
        description: forms.remision.motivo,
        urgency: forms.remision.urgencia,
        result: forms.remision.observaciones,
        actionDate: forms.remision.fecha
      }
    } else if (menu === 'actuaciones') {
      actionData = {
        ...actionData,
        actionType: forms.actuacion.tipo,
        description: forms.actuacion.descripcion,
        result: forms.actuacion.resultado,
        actionDate: forms.actuacion.fechaHora
      }
    } else if (menu === 'soporte') {
      actionData = {
        ...actionData,
        actionType: forms.soporte.tipo,
        fileName: forms.soporte.nombreArchivo,
        description: forms.soporte.descripcion,
        actionDate: forms.soporte.fechaCarga
      }
    } else if (menu === 'normatividad') {
      actionData = {
        ...actionData,
        actionType: forms.normatividad.tipo,
        normType: forms.normatividad.tipo,
        normArticle: forms.normatividad.articulo,
        description: forms.normatividad.descripcion,
        fileUrl: forms.normatividad.referencia
      }
    }

    const res = await registerAction(actionData)
    if (res.success) {
      setSaveMessage(`✅ ${category} registrada correctamente`)
      resetForm(menu)
      fetchAssignedAlerts()
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  return (
    <div className="dashboard-wrapper profesional-theme">
      <DashboardHeader user={user} onLogout={onLogout} />
      
      <div className="dashboard-container profesional-theme">
        <div className="dashboard-layout">
          
          <UniversalSidebar user={user} stats={{ totalUsers: 1, activeUsers: 1, totalAlerts: assignedAlerts.length, verifiedUsers: 0, dbConnected: true }}>
            <div className="dashboard-card caseload-card">
              <h4 className="card-title">
                <Briefcase size={18} /> Casos Asignados{' '}
                <span className="badge">{assignedAlerts.length}</span>
              </h4>
              <div className="caseload-list">
                {loadingAlerts ? <div className="loading-small">Cargando...</div> :
                 assignedAlerts.length === 0 ? <div className="empty-state">Sin casos asignados</div> :
                 assignedAlerts.map(a => (
                   <div key={a.id} 
                        onClick={() => setSelectedAlert(a)}
                        className={`case-item ${selectedAlert?.id === a.id ? 'active' : ''} ${a.alertType.toLowerCase()}`}>
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
              <h2 className="page-title">Centro de Gestión de Casos</h2>
              {selectedAlert && (
                <div className="selected-case-summary">
                  <AlertCircle size={20} />
                  <span>Atendiendo a: <b>{selectedAlert.studentName}</b></span>
                  <span className="divider">|</span>
                  <span>Ticket: <b>{selectedAlert.ticketNumber}</b></span>
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
              {saveMessage && <div className="flash-message">{saveMessage}</div>}
              
              {!selectedAlert ? (
                <div className="welcome-placeholder">
                  <div className="icon-circle">
                    <FileText size={48} />
                  </div>
                  <h3>Gestión Profesional de Casos</h3>
                  <p>Por favor, seleccione un caso del panel izquierdo para iniciar el registro de intervenciones, remisiones o soportes técnicos.</p>
                </div>
              ) : (
                <div className="form-container animate-fade-in">
                  
                  {activeMenu === 'alerta' && (
                    <div className="pro-form">
                      <div className="form-header">
                        <Info size={20} />
                        <h4>Información de Remisión de Caso</h4>
                        <p>Indica si el caso fue enviado a otra área o profesional especializado.</p>
                      </div>
                      <div className="grid-2-cols">
                        <div className="pro-field">
                          <label>Área o dependencia remitida</label>
                          <select value={forms.remision.area} onChange={(e) => setForms({...forms, remision: {...forms.remision, area: e.target.value}})}>
                            <option>Psicología</option>
                            <option>Coordinación académica</option>
                            <option>Bienestar</option>
                            <option>Soporte técnico</option>
                            <option>Dirección</option>
                            <option>Otro</option>
                          </select>
                        </div>
                        <div className="pro-field">
                          <label>Profesional o responsable receptor</label>
                          <div className="input-with-icon">
                            <User size={16} />
                            <input type="text" value={forms.remision.responsable} onChange={(e) => setForms({...forms, remision: {...forms.remision, responsable: e.target.value}})} placeholder="Nombre del profesional" />
                          </div>
                        </div>
                        <div className="pro-field">
                          <label>Fecha de remisión</label>
                          <div className="input-with-icon">
                            <Calendar size={16} />
                            <input type="date" value={forms.remision.fecha} onChange={(e) => setForms({...forms, remision: {...forms.remision, fecha: e.target.value}})} />
                          </div>
                        </div>
                        <div className="pro-field">
                          <label>Nivel de urgencia</label>
                          <select value={forms.remision.urgencia} onChange={(e) => setForms({...forms, remision: {...forms.remision, urgencia: e.target.value}})}>
                            <option>Baja</option>
                            <option>Media</option>
                            <option>Alta</option>
                            <option>Urgente</option>
                          </select>
                        </div>
                        <div className="pro-field full-width">
                          <label>Motivo de la remisión</label>
                          <textarea value={forms.remision.motivo} onChange={(e) => setForms({...forms, remision: {...forms.remision, motivo: e.target.value}})} placeholder="Explique brevemente por qué se remite el caso..." rows="2"></textarea>
                        </div>
                        <div className="pro-field full-width">
                          <label>Observaciones del colaborador</label>
                          <textarea value={forms.remision.observaciones} onChange={(e) => setForms({...forms, remision: {...forms.remision, observaciones: e.target.value}})} placeholder="Detalles adicionales o recomendaciones..." rows="2"></textarea>
                        </div>
                      </div>
                      <div className="form-actions-pro">
                        <button className="btn-save-pro" onClick={() => handleSubmit('remision', 'Remision')} disabled={loadingActions}>
                          <CheckCircle size={18} /> Registrar Remisión Profesional
                        </button>
                      </div>
                    </div>
                  )}

                  {activeMenu === 'actuaciones' && (
                    <div className="pro-form">
                      <div className="form-header">
                        <ClipboardCheck size={20} />
                        <h4>Registro de Actuaciones Realizadas</h4>
                        <p>Documente detalladamente las intervenciones hechas por su parte en este caso.</p>
                      </div>
                      <div className="grid-2-cols">
                        <div className="pro-field">
                          <label>Opciones de actuación</label>
                          <select value={forms.actuacion.tipo} onChange={(e) => setForms({...forms, actuacion: {...forms.actuacion, tipo: e.target.value}})}>
                            <option>Contacto telefónico con el usuario</option>
                            <option>Correo electrónico enviado</option>
                            <option>Mensaje por chatbot / sistema</option>
                            <option>Reunión o cita programada</option>
                            <option>Orientación o asesoría brindada</option>
                            <option>Seguimiento del caso</option>
                            <option>Escalamiento a otra área</option>
                            <option>Cierre del caso</option>
                          </select>
                        </div>
                        <div className="pro-field">
                          <label>Fecha y hora de la actuación</label>
                          <input type="datetime-local" value={forms.actuacion.fechaHora} onChange={(e) => setForms({...forms, actuacion: {...forms.actuacion, fechaHora: e.target.value}})} />
                        </div>
                        <div className="pro-field">
                          <label>Responsable</label>
                          <input type="text" value={forms.actuacion.responsable} readOnly />
                        </div>
                        <div className="pro-field">
                          <label>Resultado de la acción</label>
                          <input type="text" value={forms.actuacion.resultado} onChange={(e) => setForms({...forms, actuacion: {...forms.actuacion, resultado: e.target.value}})} placeholder="Ej: Citación aceptada" />
                        </div>
                        <div className="pro-field full-width">
                          <label>Descripción breve</label>
                          <textarea value={forms.actuacion.descripcion} onChange={(e) => setForms({...forms, actuacion: {...forms.actuacion, descripcion: e.target.value}})} placeholder="Resumen de la intervención..." rows="3"></textarea>
                        </div>
                      </div>
                      <div className="form-actions-pro">
                        <button className="btn-save-pro accent" onClick={() => handleSubmit('actuaciones', 'Actuacion')} disabled={loadingActions}>
                          <ClipboardCheck size={18} /> Guardar Actuación en Folio
                        </button>
                      </div>
                    </div>
                  )}

                  {activeMenu === 'soporte' && (
                    <div className="pro-form">
                      <div className="form-header">
                        <Paperclip size={20} />
                        <h4>Evidencias y Soportes Documentales</h4>
                        <p>Adjunte o registre evidencias que respalden las actuaciones realizadas.</p>
                      </div>
                      <div className="grid-2-cols">
                        <div className="pro-field">
                          <label>Tipos de soporte</label>
                          <select value={forms.soporte.tipo} onChange={(e) => setForms({...forms, soporte: {...forms.soporte, tipo: e.target.value}})}>
                            <option>Registro de llamada</option>
                            <option>Captura de pantalla</option>
                            <option>Documento PDF</option>
                            <option>Correo electrónico</option>
                            <option>Acta de reunión</option>
                            <option>Informe del caso</option>
                            <option>Archivo adjunto</option>
                          </select>
                        </div>
                        <div className="pro-field">
                          <label>Fecha de carga (Registro)</label>
                          <input type="date" value={forms.soporte.fechaCarga} onChange={(e) => setForms({...forms, soporte: {...forms.soporte, fechaCarga: e.target.value}})} />
                        </div>
                        <div className="pro-field">
                          <label>Nombre del archivo / Ref</label>
                          <input type="text" value={forms.soporte.nombreArchivo} onChange={(e) => setForms({...forms, soporte: {...forms.soporte, nombreArchivo: e.target.value}})} placeholder="Ej: acta_001.pdf" />
                        </div>
                        <div className="pro-field">
                          <label>Usuario que adjunta</label>
                          <input type="text" value={user?.name} readOnly />
                        </div>
                        <div className="pro-field full-width">
                          <label>Descripción del soporte</label>
                          <textarea value={forms.soporte.descripcion} onChange={(e) => setForms({...forms, soporte: {...forms.soporte, descripcion: e.target.value}})} placeholder="Contexto sobre este archivo o evidencia..." rows="2"></textarea>
                        </div>
                      </div>
                      <div className="form-actions-pro">
                        <button className="btn-save-pro" onClick={() => handleSubmit('soporte', 'Soporte')} disabled={loadingActions}>
                          <Paperclip size={18} /> Registrar Evidencia de Soporte
                        </button>
                      </div>
                    </div>
                  )}

                  {activeMenu === 'normatividad' && (
                    <div className="pro-form">
                      <div className="form-header">
                        <Scale size={20} />
                        <h4>Fundamento Normativo y Legal</h4>
                        <p>Relacione la actuación con normas, protocolos o políticas institucionales pertinentes.</p>
                      </div>
                      <div className="grid-2-cols">
                        <div className="pro-field">
                          <label>Tipo de normativa</label>
                          <select value={forms.normatividad.tipo} onChange={(e) => setForms({...forms, normatividad: {...forms.normatividad, tipo: e.target.value}})}>
                            <option>Reglamento institucional</option>
                            <option>Protocolo de atención</option>
                            <option>Política de bienestar</option>
                            <option>Política académica</option>
                            <option>Política disciplinaria</option>
                          </select>
                        </div>
                        <div className="pro-field">
                          <label>Artículo o sección aplicable</label>
                          <input type="text" value={forms.normatividad.articulo} onChange={(e) => setForms({...forms, normatividad: {...forms.normatividad, articulo: e.target.value}})} placeholder="Ej: Art. 12 literal b" />
                        </div>
                        <div className="pro-field full-width">
                          <label>Descripción breve (Base Legal)</label>
                          <textarea value={forms.normatividad.descripcion} onChange={(e) => setForms({...forms, normatividad: {...forms.normatividad, descripcion: e.target.value}})} placeholder="Resumen de la norma aplicada..." rows="2"></textarea>
                        </div>
                        <div className="pro-field full-width">
                          <label>Enlace o documento de referencia</label>
                          <input type="text" value={forms.normatividad.referencia} onChange={(e) => setForms({...forms, normatividad: {...forms.normatividad, referencia: e.target.value}})} placeholder="Link a manual de convivencia / ley" />
                        </div>
                      </div>
                      <div className="form-actions-pro">
                        <button className="btn-save-pro" onClick={() => handleSubmit('normatividad', 'Normatividad')} disabled={loadingActions}>
                          <Scale size={18} /> Vincular Marco Normativo
                        </button>
                      </div>
                    </div>
                  )}
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
