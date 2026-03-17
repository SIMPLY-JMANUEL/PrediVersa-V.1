/**
 * useUserPhoto - Hook compartido para sincronizar la foto de perfil
 * entre el panel de configuración y todos los dashboards.
 *
 * Usa localStorage + evento personalizado 'userPhotoChanged'
 * para que todos los componentes se actualicen en tiempo real
 * sin necesidad de reiniciar la app.
 */
import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api' // FIX A-1: Usar utilitario centralizado

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
      // FIX E-2: Compresión básica de imagen para evitar QuotaExceededError en localStorage
      const compressImage = (base64, maxWidth = 400, quality = 0.7) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = base64;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = img.width / img.height;
            canvas.width = Math.min(img.width, maxWidth);
            canvas.height = canvas.width / ratio;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
        });
      };

      const finalPhoto = dataUrl.length > 50000 ? await compressImage(dataUrl) : dataUrl;

      const response = await apiFetch('/api/users/profile/photo', {
        method: 'PUT',
        body: JSON.stringify({ profilePicture: finalPhoto })
      })

      const data = response
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
