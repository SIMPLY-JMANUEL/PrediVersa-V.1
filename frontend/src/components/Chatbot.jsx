import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Chatbot.css'

// ── Visibilidad del webchat ──
function setBotpressVisibility(visible) {
  if (window.botpress) {
    window.botpress.sendEvent({ type: visible ? 'show' : 'hide' });
  } else if (window.botpressWebChat) {
    window.botpressWebChat.sendEvent({ type: visible ? 'show' : 'hide' });
  }
}

// ── Enviar datos del usuario logueado a Botpress ──
function setBotpressUser(user) {
  if (!user) return;

  const userData = {
    userId: String(user.id || user.documentId || 'anonimo'),
    userName: user.name || 'Estudiante',
    userEmail: user.email || '',
    userRole: user.role || 'Estudiante',
  };

  // API Botpress v3.6
  const trySet = () => {
    if (window.botpress && window.botpress.setUser) {
      window.botpress.setUser({
        name: userData.userName,
        email: userData.userEmail,
        data: {
          userId: userData.userId,
          role: userData.userRole,
        },
      });
      console.log('✅ Botpress: usuario configurado →', userData.userName);
    } else if (window.botpressWebChat) {
      // Fallback para versiones anteriores
      window.botpressWebChat.sendEvent({
        type: 'setUser',
        user: userData,
      });
    }
  };

  // Intentar inmediatamente o esperar a que el widget cargue
  if (window.botpress || window.botpressWebChat) {
    trySet();
  } else {
    const interval = setInterval(() => {
      if (window.botpress || window.botpressWebChat) {
        trySet();
        clearInterval(interval);
      }
    }, 500);
    // Limpiar después de 10 segundos si no carga
    setTimeout(() => clearInterval(interval), 10000);
  }
}

function Chatbot({ isAuthenticated, isLoginOpen, user }) {
  const location = useLocation();

  // Controlar visibilidad: Solo mostrar en Landing Page (/) y si no hay login abierto
  useEffect(() => {
    const isLanding = location.pathname === '/';
    const shouldShow = isLanding && !isLoginOpen && !isAuthenticated;
    
    setBotpressVisibility(shouldShow);
    
    // Si no estamos en landing, intentamos forzar el ocultamiento 
    // (algunas versiones de Botpress reactivan el botón solo)
    if (!shouldShow) {
      const interval = setInterval(() => setBotpressVisibility(false), 1000);
      setTimeout(() => clearInterval(interval), 5000);
    }
  }, [location.pathname, isAuthenticated, isLoginOpen]);

  // Pasar datos del usuario al bot cuando hay sesión
  useEffect(() => {
    if (isAuthenticated && user) {
      setBotpressUser(user);
    }
  }, [isAuthenticated, user]);

  return null;
}

export default Chatbot
