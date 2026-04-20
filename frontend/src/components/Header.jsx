import './Header.css'
import logo from '../assets/images/logo-prediversa.png'

import { Link, useNavigate } from 'react-router-dom'

function Header({ onLoginClick, user, onLogout }) {
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Estudiante': return '/student';
      case 'Administrador': return '/admin';
      case 'Colaborador':
      case 'Colaboradores': return '/collaborator';
      default: return '/';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img 
          src={logo} 
          alt="Logo PrediVersa" 
          className="header-logo" 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        <nav className="navbar-left">
          <ul>
            <li>
              <Link to="/quienes-somos" style={{ color: 'inherit', textDecoration: 'none' }}>Quienes Somos</Link>
            </li>
            <li>
              <Link to="/servicios" style={{ color: 'inherit', textDecoration: 'none' }}>Servicios</Link>
            </li>
          </ul>
        </nav>
      </div>
      <nav className="navbar-right">
        <ul>
          <li>
            <Link to="/noticias" style={{ color: 'inherit', textDecoration: 'none' }}>Noticias</Link>
          </li>
          <li>
            <Link to="/planes" style={{ color: 'inherit', textDecoration: 'none' }}>Planes</Link>
          </li>
          <li>
            <Link to="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link>
          </li>
          {user ? (
            <>
              <li onClick={() => navigate(getDashboardPath())} className="dashboard-link">Mi Dashboard</li>
              <li onClick={onLogout} className="logout-link-header">Cerrar Sesión</li>
            </>
          ) : (
            <li onClick={onLoginClick} className="login-link">Inicio de Sesión</li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header
