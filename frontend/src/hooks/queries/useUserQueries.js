import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';

/**
 * 🕵️ HOOKS DE CACHÉ INTELIGENTE (REACT QUERY)
 * Sincronización automática de usuarios y roles.
 */

export const useUserQueries = (token) => {
  const queryClient = useQueryClient();

  // 📡 1. GET ALL USERS (Caché durante 5 min)
  const useUsers = (searchTerm = '') => useQuery({
    queryKey: ['users', searchTerm],
    queryFn: () => apiFetch(`/api/users?search=${searchTerm}`),
    staleTime: 5 * 60 * 1000, // 5 minutos de calma
    enabled: !!token
  });

  // 🔘 2. CREATE USER MUTATION (Invalidación automática)
  const useCreateUser = () => useMutation({
    mutationFn: (userData) => apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    onSuccess: () => {
      // ✅ Invalidar caché de usuarios para que se refresque la lista
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // 🔘 3. DELETE USER MUTATION
  const useDeleteUser = () => useMutation({
    mutationFn: (id) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  return {
    useUsers,
    useCreateUser,
    useDeleteUser
  };
};
