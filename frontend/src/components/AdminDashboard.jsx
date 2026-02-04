import DashboardHeader from './DashboardHeader'
import './AdminDashboard.css'

function AdminDashboard({ user, onLogout }) {

  return (
    <>
      <DashboardHeader user={user} onLogout={onLogout} />
      <div className="dashboard-container">
        <div className="dashboard-header-title">
          <h1>Dashboard Administrador</h1>
          <p className="welcome-text">Bienvenido, {user?.name}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>👥 Gestionar Usuarios</h3>
            <p>Administra estudiantes, colaboradores y permisos.</p>
          </div>

          <div className="dashboard-card">
            <h3>📚 Gestionar Cursos</h3>
            <p>Crea, edita y elimina cursos de la plataforma.</p>
          </div>

          <div className="dashboard-card">
            <h3>📊 Reportes</h3>
            <p>Visualiza reportes de desempeño y estadísticas.</p>
          </div>

          <div className="dashboard-card">
            <h3>⚙️ Configuración</h3>
            <p>Ajusta parámetros generales de la plataforma.</p>
          </div>

          <div className="dashboard-card">
            <h3>🔔 Notificaciones</h3>
            <p>Gestiona notificaciones y comunicaciones.</p>
          </div>

          <div className="dashboard-card">
            <h3>📋 Auditoría</h3>
            <p>Revisa registros de actividades del sistema.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
