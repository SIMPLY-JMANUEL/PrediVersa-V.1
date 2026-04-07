import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  UserPlus, 
  Key, 
  Phone,
  FileText,
  Loader2
} from 'lucide-react'
import '../styles/components/Login.css'

/**
 * 🏛️ LOGIN PREDIVERSA LUXE UI (v2.7)
 * Implementa flujos de recuperación y registro por aprobación.
 */
function Login({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  
  // Vistas: 'login', 'register', 'forgot', 'success'
  const [view, setView] = useState('login')
  
  // Campos
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    documentId: '',
    role: 'Estudiante',
    rememberMe: false
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (view === 'login') {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        })

        if (data.success) {
          login(data.user, data.token)
          // Integración con el estado global de App.jsx para que el Dashboard lo permita entrar
          if (onLoginSuccess) onLoginSuccess(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          setTimeout(() => {
            onClose()
            const role = data.user.role || 'Estudiante'
            if (role === 'Administrador') navigate('/admin')
            else if (role === 'Estudiante') navigate('/student')
            else navigate('/collaborator')
          }, 400)
        } else {
          setError(data.message || 'Credenciales incorrectas.')
        }
      } else if (view === 'register') {
        const data = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData)
        })

        if (data.success) {
          setSuccess(data.message)
          setView('success')
        } else {
          setError(data.message)
        }
      } else if (view === 'forgot') {
        const data = await apiFetch('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: formData.email })
        })

        if (data.success) {
          setSuccess(data.message)
          setView('success')
        } else {
          setError(data.message)
        }
      }
    } catch (err) {
      setError('Error de conexión con PrediVersa v2.7. Intente más tarde.')
    } finally {
      setLoading(false)
    }
  }

  const resetViews = () => {
    setView('login')
    setError('')
    setSuccess('')
    setFormData({ email: '', password: '', name: '', phone: '', documentId: '', role: 'Estudiante', rememberMe: false })
  }

  if (!isOpen) return null

  return (
    <div className="login-overlay">
      <div className="login-modal p-card">
        {/* HEADER MODERNO */}
        <div className="login-header-premium">
          <div className="header-text">
            <h2>
              {view === 'login' ? 'Bienvenido a PrediVersa' : 
               view === 'register' ? 'Solicitud de Acceso' : 
               view === 'forgot' ? 'Recuperar Acceso' : 'Proceso Exitoso'}
            </h2>
            <p>
              {view === 'login' ? 'Identidad predictiva escolar segura' : 
               view === 'register' ? 'Completa tus datos para validación' : 
               view === 'forgot' ? 'Protocolo de reseteo institucional' : 'Acción completada con éxito'}
            </p>
          </div>
          <button className="login-close-premium" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="login-form-scrollable">
          {view === 'success' ? (
            <div className="login-success-state">
              <CheckCircle2 size={64} color="hsl(var(--p-primary))" className="mb-4" />
              <h3>¡Solicitud Recibida!</h3>
              <p>{success}</p>
              <button onClick={resetViews} className="login-btn-action mt-6">Volver al Inicio</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form-content">
              {/* CAMPO: EMAIL (Siempre visible excepto en reset password flow específico) */}
              <div className="form-group-premium">
                <label className="input-label-premium">Correo Institucional</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="usuario@prediversa.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* CAMPOS DINÁMICOS POR VISTA */}
              {view === 'login' && (
                <div className="form-group-premium">
                  <label className="input-label-premium">Contraseña</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="login-options-row">
                    <div className="remember-me-premium">
                      <input 
                        type="checkbox" 
                        id="rememberMe" 
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label htmlFor="rememberMe">Mantener sesión</label>
                    </div>
                    <div className="forgot-password-link">
                      <span onClick={() => setView('forgot')}>¿Olvidaste tu contraseña?</span>
                    </div>
                  </div>
                </div>
              )}

              {view === 'register' && (
                <>
                  <div className="form-group-premium">
                    <label className="input-label-premium">Nombre Completo</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group-premium">
                      <label className="input-label-premium">Documento</label>
                      <div className="input-wrapper">
                        <FileText className="input-icon" size={18} />
                        <input
                          name="documentId"
                          type="text"
                          value={formData.documentId}
                          onChange={handleChange}
                          placeholder="ID / CC"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="form-group-premium">
                      <label className="input-label-premium">Teléfono</label>
                      <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="300 000 0000"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="login-alert-ui">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="login-btn-action" disabled={loading}>
                {loading ? (
                  <><Loader2 className="animate-spin mr-2" size={18} /> Procesando...</>
                ) : (
                  <>
                    {view === 'login' ? 'Iniciar Sesión' : view === 'register' ? 'Solicitar Registro' : 'Enviar Enlace'}
                    <ArrowRight className="ml-2" size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {!loading && view !== 'success' && (
          <div className="login-footer-professional">
            {view === 'login' ? (
              <p>¿Sin acceso institucional? <button onClick={() => setView('register')} className="link-btn">Crea una solicitud</button></p>
            ) : (
              <p>¿Ya tienes cuenta? <button onClick={() => setView('login')} className="link-btn">Volver al Login</button></p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
