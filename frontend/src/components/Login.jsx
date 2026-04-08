import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import './Login.css'

function Login({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate()
  const [view, setView] = useState('login') // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (view === 'login') {
      if (!email || !password) {
        setError('Por favor completa todos los campos')
        return
      }
      setLoading(true)
      try {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        if (data.success) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          onLoginSuccess(data.user)
          setEmail(''); setPassword('')
          setTimeout(() => {
            onClose()
            const role = data.user.role
            if (role === 'Estudiante') navigate('/student')
            else if (role === 'Administrador' || role === 'Administradores') navigate('/admin')
            else navigate('/collaborator')
          }, 500)
        } else {
          setError(data.message || 'Credenciales incorrectas')
        }
      } catch (err) {
        setError('Error de conexión con el servidor.')
      } finally { setLoading(false) }
    } else if (view === 'register') {
      setError('El registro de usuarios nuevos debe ser gestionado por el administrador institucional.')
    } else {
      setError('Se ha enviado un correo de recuperación (Simulado). Revisa tu bandeja.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-overlay">
      <div className="login-modal premium-card">
        <div className="login-header-premium">
          <div className="header-text">
            <h2>{view === 'login' ? 'Bienvenido a PrediVersa' : view === 'register' ? 'Solicitud de Registro' : 'Recuperar Acceso'}</h2>
            <p>{view === 'login' ? 'Ingresa tus credenciales para continuar' : 'Sigue los pasos a continuación'}</p>
          </div>
          <button className="login-close-premium" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form-content">
          <div className="form-group-premium">
            <label>Correo Institucional</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@prediversa.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          {view === 'login' && (
            <div className="form-group-premium">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
              </div>
              <div className="forgot-password-link">
                <span onClick={() => setView('forgot')}>¿Olvidaste tu contraseña?</span>
              </div>
            </div>
          )}

          {error && <div className="login-alert-ui">{error}</div>}

          <button type="submit" className="login-btn-action" disabled={loading}>
            {loading ? <span className="loader-dots">⬤ ⬤ ⬤</span> : view === 'login' ? 'Iniciar Sesión' : 'Enviar Solicitud'}
          </button>
        </form>

        <div className="login-footer-professional">
          {view === 'login' ? (
            <p>¿No tienes una cuenta aún? <button onClick={() => setView('register')} className="link-btn">Regístrate</button></p>
          ) : (
            <p>¿Ya tienes cuenta? <button onClick={() => setView('login')} className="link-btn">Volver al Login</button></p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
