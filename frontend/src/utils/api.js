export const BASE_URL = 'http://localhost:5000';
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

  return response.json();
};
