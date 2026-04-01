import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import './global.css';

// 📡 CONFIGURACIÓN DEL CACHÉ DE SERVIDOR (REACT QUERY)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Reintentos en caso de fallo de red
      staleTime: 60 * 1000, // Los datos se consideran frescos por 60 segundos
      refetchOnWindowFocus: true, // Auto-actualizar al volver a la pestaña
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
       <App />
    </QueryClientProvider>
  </React.StrictMode>
);
