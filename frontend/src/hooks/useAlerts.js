import { useState, useEffect } from 'react';
import { apiFetch, BASE_URL } from '../utils/api';

export const useAlerts = (token) => {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [notifVersa, setNotifVersa] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [alertStats, setAlertStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const data = await apiFetch('/api/alerts');
      if (data.success) setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchAlertStats = async () => {
    setLoadingStats(true);
    try {
      const data = await apiFetch('/api/alerts/stats');
      if (data.success) setAlertStats(data.stats);
    } catch (error) {
      console.error('Error fetching alert stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    let source;
    let reconnectTimeout;

    // Optimización SSE con reconexión nativa del navegador
    const conectarSSE = () => {
      source = new EventSource(`${BASE_URL}/api/chatbot/stream?token=${token}`);
      
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
        // En lugar de cerrar y alertar, dejamos que el navegador 
        // intente reconectar según su política interna (normalmente 3s).
        // Esto reduce el ruido en la consola durante micro-cortes de App Runner.
      };
    };

    conectarSSE();
    fetchAlerts();
    fetchAlertStats();

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
    fetchAlerts,
    alertStats,
    loadingStats,
    fetchAlertStats
  };
};
