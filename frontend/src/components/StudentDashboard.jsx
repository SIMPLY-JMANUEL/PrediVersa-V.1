import DashboardHeader from './DashboardHeader'
import { BookOpen, LineChart, CheckSquare, GraduationCap } from 'lucide-react'
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
            <div className="card-icon-wrapper">
              <BookOpen className="card-icon" size={28} />
            </div>
            <h3>Mis Cursos</h3>
            <p>Accede a tus cursos y materiales de estudio interactivos.</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon-wrapper">
              <LineChart className="card-icon" size={28} />
            </div>
            <h3>Mi Progreso</h3>
            <p>Visualiza tu avance detallado en las diferentes asignaturas.</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon-wrapper">
              <CheckSquare className="card-icon" size={28} />
            </div>
            <h3>Tareas</h3>
            <p>Entrega tus tareas a tiempo y revisa las pendientes.</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon-wrapper">
              <GraduationCap className="card-icon" size={28} />
            </div>
            <h3>Calificaciones</h3>
            <p>Consulta tus calificaciones, retroalimentación y desempeño general.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentDashboard
