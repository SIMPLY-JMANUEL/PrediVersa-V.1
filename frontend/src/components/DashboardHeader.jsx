import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, X, Sun, Moon, Monitor, Camera, UserCircle, LogOut, Check } from 'lucide-react'
import { useUserPhoto } from '../hooks/useUserPhoto'
import './DashboardHeader.css'

const THEMES = [
  { id: 'light',  label: 'Claro',    icon: Sun,     desc: 'Fondo blanco, tonos suaves' },
  { id: 'dark',   label: 'Oscuro',   icon: Moon,    desc: 'Fondo oscuro, menos fatiga visual' },
  { id: 'system', label: 'Sistema',  icon: Monitor, desc: 'Sigue la preferencia del dispositivo' },
]

function DashboardHeader({ user, onLogout }) {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [photo, setPhoto] = useUserPhoto()   // ← hook compartido con los dashboards
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light')
  const [photoSaved, setPhotoSaved] = useState(false)
  const fileInputRef = useRef(null)
  const panelRef = useRef(null)

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('theme-dark')
      root.classList.remove('theme-light')
    } else if (theme === 'light') {
      root.classList.remove('theme-dark')
      root.classList.add('theme-light')
    } else {
      // sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('theme-dark', prefersDark)
      root.classList.toggle('theme-light', !prefersDark)
    }
    localStorage.setItem('appTheme', theme)
  }, [theme])

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowSettings(false)
      }
    }
    if (showSettings) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    navigate('/')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setPhoto(evt.target.result)   // ← hook notifica a todos los dashboards
      setPhotoSaved(true)
      setTimeout(() => setPhotoSaved(false), 2500)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhoto(null)   // ← hook limpia el localStorage y notifica
  }

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <img src="/src/assets/images/logo-prediversa.png" alt="Logo PrediVersa" className="dashboard-logo" />

        <div className="header-actions" ref={panelRef}>
          {/* Botón de Configuración */}
          <div className="settings-wrapper">
            <button
              className={`settings-btn ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings(v => !v)}
              title="Configuración"
              aria-label="Abrir configuración"
            >
              <Settings size={18} className={showSettings ? 'spin' : ''} />
              <span>Configuración</span>
            </button>

            {/* Panel desplegable */}
            {showSettings && (
              <div className="settings-panel">
                <div className="sp-header">
                  <span>⚙️ Configuración</span>
                  <button className="sp-close" onClick={() => setShowSettings(false)}>
                    <X size={16} />
                  </button>
                </div>

                {/* ─── Foto de perfil ─── */}
                <section className="sp-section">
                  <h4 className="sp-section-title">
                    <Camera size={15} /> Foto de perfil
                  </h4>

                  <div className="sp-photo-area">
                    {photo ? (
                      <img src={photo} alt="Foto de perfil" className="sp-photo-preview" />
                    ) : (
                      <div className="sp-photo-placeholder">
                        <UserCircle size={56} color="#8ECFEA" strokeWidth={1.5} />
                        <span>Sin foto</span>
                      </div>
                    )}

                    <div className="sp-photo-btns">
                      <button
                        className="sp-btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {photo ? 'Cambiar foto' : 'Subir foto'}
                      </button>
                      {photo && (
                        <button className="sp-btn-danger" onClick={removePhoto}>
                          Eliminar
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {photoSaved && (
                      <div className="sp-success-msg">
                        <Check size={14} /> Foto guardada
                      </div>
                    )}

                    <p className="sp-hint">
                      Formatos: JPG, PNG, WEBP · Máx 5 MB
                    </p>
                  </div>
                </section>

                <div className="sp-divider" />

                {/* ─── Tema ─── */}
                <section className="sp-section">
                  <h4 className="sp-section-title">
                    <Sun size={15} /> Tema de la interfaz
                  </h4>

                  <div className="sp-theme-grid">
                    {THEMES.map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        className={`sp-theme-card ${theme === id ? 'selected' : ''}`}
                        onClick={() => setTheme(id)}
                      >
                        <Icon size={22} />
                        <span className="sp-theme-label">{label}</span>
                        <span className="sp-theme-desc">{desc}</span>
                        {theme === id && (
                          <span className="sp-theme-check"><Check size={12} /></span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="sp-divider" />

                {/* ─── Info usuario ─── */}
                <div className="sp-user-info">
                  <span className="sp-user-name">{user?.name || 'Usuario'}</span>
                  <span className="sp-user-role">{user?.role || 'Rol'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Botón Cerrar Sesión */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: '0.4rem' }} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
