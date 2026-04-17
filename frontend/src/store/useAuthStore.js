import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 🔒 ZUSTAND AUTH STORE (HARDENED)
 * Gestión de identidades con protección contra XSS persistente.
 * Se utiliza sessionStorage en lugar de localStorage para asegurar que los tokens
 * se destruyan al cerrar la pestaña. El token no se persiste en disco.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null, // Mantenido en memoria volátil de la aplicación
      isAuthenticated: false,

      // ACCIONES
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        sessionStorage.clear();
      },

      updateUser: (updatedUser) => {
        set((state) => ({ user: { ...state.user, ...updatedUser } }));
      }
    }),
    {
      name: 'prediversa-auth-storage',
      storage: createJSONStorage(() => sessionStorage), // Cambio a almacenamiento de sesión
      // Solo persistimos el objeto user y el estado de autenticación, NO el token.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), 
    }
  )
);
