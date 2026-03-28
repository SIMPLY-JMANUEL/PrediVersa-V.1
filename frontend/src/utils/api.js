// FIX A-1: Usar variable de entorno para la URL base — configurable por entorno
export const BASE_URL = import.meta.env.VITE_API_URL || '';
export const API_CHATBOT = `${BASE_URL}/api/chatbot`;
export const API_USERS = `${BASE_URL}/api/users`;
export const API_AUTH = `${BASE_URL}/api/auth`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * FIX E-3: apiFetch con interceptor de 401 para logout automático
 * Si el servidor devuelve 401, despacha el evento 'auth:expired' que
 * capturado en App.jsx fuerza el logout del usuario.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Interceptor de sesión expirada
  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    return { success: false, message: 'Sesión expirada' };
  }

  return response.json();
};
