import { useState, useEffect } from 'react';

export const useAlerts = (token) => {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [notifVersa, setNotifVersa] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const response = await fetch('http://localhost:5000/api/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // FIX E-3: detectar sesión expirada globalmente
      if (response.status === 401) {
        window.dispatchEvent(new Event('auth:expired'));
        return;
      }
      const data = await response.json();
      if (data.success) setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    let source;
    let reconnectTimeout;

    // FIX AL-3: función de conexión SSE con reconexión automática
    const conectarSSE = () => {
      source = new EventSource(`http://localhost:5000/api/chatbot/stream?token=${token}`);
      source.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.tipo === 'conexion') return;
          setNotifVersa(prev => [data, ...prev].slice(0, 20));
          setNotifVisible(true);
          fetchAlerts();
        } catch { /* silent */ }
      };
      source.onerror = () => {
        source.close();
        // Reconectar después de 5 segundos
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 Reconectando SSE...');
          conectarSSE();
        }, 5000);
      };
    };

    conectarSSE();
    fetchAlerts();

    return () => {
      source?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [token]);

  return {
    alerts,
    loadingAlerts,
    notifVersa,
    setNotifVersa,
    notifVisible,
    setNotifVisible,
    fetchAlerts
  };
};
