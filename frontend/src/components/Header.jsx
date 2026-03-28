import './Header.css'
import logo from '../assets/images/logo-prediversa.png'

function Header({ onLoginClick }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo PrediVersa" className="header-logo" />
        <nav className="navbar-left">
          <ul>
            <li onClick={() => scrollToSection('quienes-somos')} style={{ cursor: 'pointer' }}>Quienes Somos</li>
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
