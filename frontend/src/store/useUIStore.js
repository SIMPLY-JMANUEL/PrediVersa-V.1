import { create } from 'zustand';

/**
 * 🧊 ZUSTAND UI STORE
 * Control de modales y estados visuales globales.
 */
export const useUIStore = create((set) => ({
  isLoginOpen: false,
  setLoginOpen: (isOpen) => set({ isLoginOpen: isOpen }),
  toggleLogin: () => set((state) => ({ isLoginOpen: !state.isLoginOpen })),
}));
