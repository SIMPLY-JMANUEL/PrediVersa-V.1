import { useNavigate } from 'react-router-dom'
import './DashboardHeader.css'

function DashboardHeader({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    navigate('/')
  }

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <img src="/src/assets/images/logo-prediversa.png" alt="Logo PrediVersa" className="dashboard-logo" />
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
