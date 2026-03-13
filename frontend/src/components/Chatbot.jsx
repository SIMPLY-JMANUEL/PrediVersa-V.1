import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Chatbot.css'

const PUBLIC_INJECT_ID = 'bp-inject-script-public'

function removeBotpressElements() {
  const elements = document.body.children;
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    const tag = el.tagName.toLowerCase();
    const id = el.id ? el.id.toLowerCase() : '';
    const cls = typeof el.className === 'string' ? el.className.toLowerCase() : '';
    
    // Identificar inyecciones de Botpress por prefijos comunes
    if (
      tag.includes('bp-') || tag.includes('botpress') ||
      id.includes('bp-') || id.includes('botpress') ||
      cls.includes('bp-') || cls.includes('bpw') ||
      (tag === 'iframe' && el.src && el.src.includes('botpress'))
    ) {
      if (id !== 'root') el.remove(); // Evitar borrar el root de React por accidente
    }
  }
}

function removeBotpressScripts() {
  const node1 = document.getElementById(PUBLIC_INJECT_ID)
  const node2 = document.getElementById('bp-config-script-public')
  if (node1?.parentNode) node1.parentNode.removeChild(node1)
  if (node2?.parentNode) node2.parentNode.removeChild(node2)
}

function Chatbot({ isAuthenticated, isLoginOpen }) {
  const location = useLocation()

  // Botpress configuration URLs - Replace with your own bot IDs
  // Public chatbot: Only appears on homepage when NOT authenticated
  // Configuraciones
  const INJECT_JS = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
  const CONFIG_JS = 'https://files.bpcontent.cloud/2026/02/01/22/20260201225345-6RFZIFLO.js'

  useEffect(() => {
    // Rutas donde NUNCA debe aparecer el chatbot PÚBLICO
    const noChatbotRoutes = ['/login', '/student', '/admin', '/collaborator']
    
    // Si el login está abierto o estamos en un dashboard, ocultar chatbot PÚBLICO
    if (isLoginOpen || noChatbotRoutes.some(route => location.pathname.startsWith(route))) {
      // Solo ocultamos los elementos inyectados del chatbot público, no bloqueamos la clase hide-botpress 
      // si estamos en la ruta /student porque allí queremos que el OTRO chatbot se vea.
      
      const isStudentRoute = location.pathname.startsWith('/student');
      
      if (!isStudentRoute) {
        document.body.classList.add('hide-botpress')
      } else {
        document.body.classList.remove('hide-botpress')
      }
      
      removeBotpressScripts()
      
      // Intentar forzar el cierre del widget de Botpress si existe la API
      if (window.botpressWebChat) {
        try { window.botpressWebChat.sendEvent({ type: 'hide' }) } catch (e) {}
      }

      // Destruir elementos del DOM de forma implacable durante 2 segundos por si el script tardó en inyectarlos
      let attempts = 0;
      const interval = setInterval(() => {
        removeBotpressElements()
        attempts++;
        if (attempts > 10) clearInterval(interval);
      }, 200);

      return () => {
        clearInterval(interval)
        removeBotpressElements()
        removeBotpressScripts()
      }
    }

    // El chatbot público SOLO aparece en la página de inicio (/) cuando NO está autenticado
    const isPublicHome = location.pathname === '/'
    const showPublicChatbot = isPublicHome && !isAuthenticated

    // Si no se debe mostrar (no es homepage o ya está autenticado)
    if (!showPublicChatbot) {
      document.body.classList.add('hide-botpress')
      removeBotpressElements()
      removeBotpressScripts()
      return
    }

    // Mostrar chatbot público solo en homepage
    document.body.classList.remove('hide-botpress')
    
    // Solo inyectar si no existen ya
    if (!document.getElementById(PUBLIC_INJECT_ID)) {
      removeBotpressScripts()
      
      const script1 = document.createElement('script')
      script1.id = PUBLIC_INJECT_ID
      script1.src = INJECT_JS
      script1.async = true
      document.body.appendChild(script1)
      
      const script2 = document.createElement('script')
      script2.id = 'bp-config-script-public'
      script2.src = CONFIG_JS
      script2.defer = true
      document.body.appendChild(script2)
    }

    return () => {
      removeBotpressElements()
      removeBotpressScripts()
    }
  }, [location.pathname, isAuthenticated, isLoginOpen])

  return null
}

export default Chatbot
