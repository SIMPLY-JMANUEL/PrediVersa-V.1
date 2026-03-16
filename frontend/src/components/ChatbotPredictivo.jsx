import React, { useEffect, useState } from 'react';
import './StudentChatbot.css';

// Limpia TODO lo que Botpress guarda en el almacenamiento local del navegador
const clearBotpressStorage = () => {
  // 1. localStorage: borrar claves que comiencen con prefijos de Botpress
  const localKeysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (
        key.startsWith('bp/') ||
        key.startsWith('botpress') ||
        key.startsWith('bpVisitor') ||
        key.startsWith('bp-') ||
        key.includes('botpress') ||
        key.includes('webchat')
      )
    ) {
      localKeysToDelete.push(key);
    }
  }
  localKeysToDelete.forEach(key => localStorage.removeItem(key));

  // 2. sessionStorage: misma limpieza
  const sessionKeysToDelete = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (
      key &&
      (
        key.startsWith('bp/') ||
        key.startsWith('botpress') ||
        key.startsWith('bpVisitor') ||
        key.startsWith('bp-') ||
        key.includes('botpress') ||
        key.includes('webchat')
      )
    ) {
      sessionKeysToDelete.push(key);
    }
  }
  sessionKeysToDelete.forEach(key => sessionStorage.removeItem(key));

  // 3. Cookies relacionadas con Botpress
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.trim().split('=')[0];
    if (
      name &&
      (
        name.includes('bp') ||
        name.includes('botpress') ||
        name.includes('webchat')
      )
    ) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

  console.log('Historial del chatbot limpiado correctamente.');
};

const StudentChatbot = () => {
  // Usamos una key única por sesión. Al cambiar la key, el iframe se recarga sin historial.
  const [iframeKey] = useState(() => `bp-session-${Date.now()}`);

  useEffect(() => {
    // Al entrar: limpiar historial previo para empezar conversación desde cero
    clearBotpressStorage();

    // Al salir (logout / navegación a otra sección): limpiar historial también
    return () => {
      clearBotpressStorage();
    };
  }, []);

  return (
    <div className="student-chatbot-container">
      <iframe
        key={iframeKey}
        src={`https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/02/04/01/20260204011551-1M9X8Z3Y.json&t=${iframeKey}`}
        title="Chat Evalúa - Asistente Virtual"
        allow="microphone"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
};

export default StudentChatbot;
