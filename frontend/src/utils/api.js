// FIX A-1: Usar variable de entorno para la URL base — Hardcoded fallback para asegurar emparejamiento en AWS
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://jkwpuacezq.us-east-1.awsapprunner.com';
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

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

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

  // Interceptor de sesión expirada (401)
  if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Nota: El backend espera la cookie HttpOnly, por lo que incluimos credenciales
          credentials: 'include' 
        });

        if (refreshRes.ok) {
          const { token } = await refreshRes.json();
          localStorage.setItem('token', token);
          isRefreshing = false;
          onTokenRefreshed(token);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        isRefreshing = false;
        window.dispatchEvent(new Event('auth:expired'));
        return { success: false, message: 'Sesión expirada' };
      }
    }

    // Encolar peticiones mientras se refresca el token
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${token}`
        };
        resolve(fetch(url, { ...options, headers: retryHeaders }).then(res => res.json()));
      });
    });
  }

  return response.json();
};
