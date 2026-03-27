import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api' // FIX A-1: Centralizar URL
import './Login.css'

function Login({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      const data = response;

      if (data.success) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Notificar al App
        onLoginSuccess(data.user)
        
        // Limpiar formulario
        setEmail('')
        setPassword('')
        
        // Redirigir según el rol
        setTimeout(() => {
          onClose()
          const role = data.user.role
          if (role === 'Estudiante') {
            navigate('/student')
          } else if (role === 'Administrador') {
            navigate('/admin')
          } else if (role === 'Colaborador' || role === 'Colaboradores') {
            navigate('/collaborator')
          }
        }, 500)
      } else {
        setError(data.message || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Por favor intenta de nuevo en unos segundos.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h2>Inicio de Sesión</h2>
          <button className="login-close" onClick={onClose} disabled={loading}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu_email@ejemplo.com"
              disabled={loading}
            />
            <small>Ingresa tu email registrado en el sistema</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
            <small>Ingresa tu contraseña registrada en el sistema</small>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <a href="#signup">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login
