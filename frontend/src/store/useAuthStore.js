import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 🔒 ZUSTAND AUTH STORE
 * Manejo global de identidad y persistencia automática.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // ACCIONES
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token); // Mantener para compatibilidad
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      updateUser: (updatedUser) => {
        set((state) => ({ user: { ...state.user, ...updatedUser } }));
      }
    }),
    {
      name: 'prediversa-auth-storage' // Nombre en localStorage
    }
  )
);
