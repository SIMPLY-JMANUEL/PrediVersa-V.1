import './Header.css'
import logo from '../assets/images/logo-prediversa.png'

import { Link, useNavigate } from 'react-router-dom'

function Header({ onLoginClick }) {
  const navigate = useNavigate();

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
            <li style={{ cursor: 'pointer' }}>Servicios</li>
          </ul>
        </nav>
      </div>
      <nav className="navbar-right">
        <ul>
          <li style={{ cursor: 'pointer' }}>Noticias</li>
          <li style={{ cursor: 'pointer' }}>Contacto</li>
          <li onClick={onLoginClick} className="login-link">Inicio de Sesión</li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
