import './Header.css'
import logo from '../assets/images/logo-prediversa.png'

function Header({ onLoginClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo PrediVersa" className="header-logo" />
        <nav className="navbar-left">
          <ul>
            <li>Quienes Somos</li>
            <li>Servicios</li>
          </ul>
        </nav>
      </div>
      <nav className="navbar-right">
        <ul>
          <li>Noticias</li>
          <li>Contacto</li>
          <li onClick={onLoginClick} className="login-link">Inicio de Sesión</li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
