import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import './Login.css' // Reutilizamos estilos

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return setError('Token de recuperación no encontrado.')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden.')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')

    setLoading(true)
    setError('')

    try {
      const data = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password })
      })

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="p-card max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 size={64} color="#10b981" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Contraseña Actualizada!</h2>
          <p className="text-slate-600 mb-8">Tu acceso ha sido restablecido con éxito. Ya puedes iniciar sesión.</p>
          <button 
            onClick={() => navigate('/')} 
            className="login-btn-action w-full"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="p-card max-w-md w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="login-header-premium">
          <div className="header-text">
            <h2>Nueva Contraseña</h2>
            <p>Establece tus nuevas credenciales seguras</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form-content">
          <div className="form-group-premium">
            <label className="input-label-premium">Nueva Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label className="input-label-premium">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="login-alert-ui">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!token && (
            <div className="login-alert-ui">
              <AlertCircle size={16} />
              <span>Token no válido o ausente en la URL.</span>
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn-action" 
            disabled={loading || !token}
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-2" size={18} /> Actualizando...</>
            ) : (
              <>Actualizar Contraseña <ArrowRight className="ml-2" size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
