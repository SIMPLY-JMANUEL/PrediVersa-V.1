import DashboardHeader from './DashboardHeader'
import './CollaboratorDashboard.css'

function CollaboratorDashboard({ user, onLogout }) {

  return (
    <>
      <DashboardHeader user={user} onLogout={onLogout} />
      <div className="dashboard-container">
        <div className="dashboard-header-title">
          <h1>Dashboard Colaborador</h1>
          <p className="welcome-text">Bienvenido, {user?.name}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📖 Crear Contenido</h3>
            <p>Desarrolla y carga nuevos materiales educativos.</p>
          </div>

          <div className="dashboard-card">
            <h3>✅ Revisar Trabajos</h3>
            <p>Evalúa y proporciona retroalimentación a estudiantes.</p>
          </div>

          <div className="dashboard-card">
            <h3>💬 Foro</h3>
            <p>Participa en discusiones y resuelve dudas.</p>
          </div>

          <div className="dashboard-card">
            <h3>📅 Calendario</h3>
            <p>Gestiona fechas importantes y eventos educativos.</p>
          </div>

          <div className="dashboard-card">
            <h3>📈 Seguimiento</h3>
            <p>Monitorea el progreso de los estudiantes.</p>
          </div>

          <div className="dashboard-card">
            <h3>💬 Mensajes</h3>
            <p>Comunícate con estudiantes y administradores.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default CollaboratorDashboard
