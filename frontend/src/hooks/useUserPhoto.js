/**
 * useUserPhoto - Hook compartido para sincronizar la foto de perfil
 * entre el panel de configuración y todos los dashboards.
 *
 * Usa localStorage + evento personalizado 'userPhotoChanged'
 * para que todos los componentes se actualicen en tiempo real
 * sin necesidad de reiniciar la app.
 */
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'user'

export function useUserPhoto() {
  const [photo, setPhotoState] = useState(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY)
    if (storedUser) {
      const user = JSON.parse(storedUser)
      return user.profilePicture || null
    }
    return null
  })

  useEffect(() => {
    const handleChange = (e) => {
      if (e.key === STORAGE_KEY || e.type === 'userPhotoChanged') {
        const storedUser = localStorage.getItem(STORAGE_KEY)
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setPhotoState(user.profilePicture || null)
        }
      }
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener('userPhotoChanged', handleChange)
    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('userPhotoChanged', handleChange)
    }
  }, [])

  const setPhoto = async (dataUrl) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/profile/photo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: dataUrl })
      })

      const data = await response.json()
      if (data.success) {
        // Actualizar el usuario en localStorage
        const storedUser = localStorage.getItem(STORAGE_KEY)
        if (storedUser) {
          const user = JSON.parse(storedUser)
          user.profilePicture = data.profilePicture
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
          setPhotoState(data.profilePicture)
          window.dispatchEvent(new Event('userPhotoChanged'))
        }
      }
    } catch (error) {
      console.error('Error al guardar la foto en el servidor:', error)
    }
  }

  return [photo, setPhoto]
}
