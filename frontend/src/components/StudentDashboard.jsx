import DashboardHeader from './DashboardHeader'
import './StudentDashboard.css'

function StudentDashboard({ user, onLogout }) {

  return (
    <>
      <DashboardHeader user={user} onLogout={onLogout} />
      <div className="dashboard-container">
        <div className="dashboard-header-title">
          <h1>Dashboard Estudiante</h1>
          <p className="welcome-text">Bienvenido, {user?.name}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📚 Mis Cursos</h3>
            <p>Accede a tus cursos y materiales de estudio.</p>
          </div>

          <div className="dashboard-card">
            <h3>📊 Mi Progreso</h3>
            <p>Visualiza tu avance en las diferentes asignaturas.</p>
          </div>

          <div className="dashboard-card">
            <h3>📝 Tareas</h3>
            <p>Entrega tus tareas y revisa las pendientes.</p>
          </div>

          <div className="dashboard-card">
            <h3>🎓 Calificaciones</h3>
            <p>Consulta tus calificaciones y desempeño.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentDashboard
