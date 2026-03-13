/**
 * useUserPhoto - Hook compartido para sincronizar la foto de perfil
 * entre el panel de configuración y todos los dashboards.
 *
 * Usa localStorage + evento personalizado 'userPhotoChanged'
 * para que todos los componentes se actualicen en tiempo real
 * sin necesidad de reiniciar la app.
 */
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'userPhoto'

export function useUserPhoto() {
  const [photo, setPhotoState] = useState(() => localStorage.getItem(STORAGE_KEY) || null)

  useEffect(() => {
    // Escuchar actualizaciones desde el panel de configuración
    const handleChange = (e) => {
      if (e.key === STORAGE_KEY || e.type === 'userPhotoChanged') {
        setPhotoState(localStorage.getItem(STORAGE_KEY) || null)
      }
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener('userPhotoChanged', handleChange)
    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('userPhotoChanged', handleChange)
    }
  }, [])

  const setPhoto = (dataUrl) => {
    if (dataUrl) {
      localStorage.setItem(STORAGE_KEY, dataUrl)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setPhotoState(dataUrl)
    // Notificar a todos los componentes suscritos
    window.dispatchEvent(new Event('userPhotoChanged'))
  }

  return [photo, setPhoto]
}
