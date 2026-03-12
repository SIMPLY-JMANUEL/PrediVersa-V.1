import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Chatbot.css'

const PUBLIC_INJECT_ID = 'bp-inject-script-public'
const PUBLIC_CONFIG_ID = 'bp-config-script-public'

function removeBotpressElements() {
  const botpressContainers = document.querySelectorAll(
    '[class*="bpw-"], [id^="bp-"], .bpw-widget, .bpw-chat-bubble, #bp-web-widget-container'
  )
  botpressContainers.forEach((node) => node.remove())

  const botpressIframes = document.querySelectorAll('iframe[src*="botpress"]')
  botpressIframes.forEach((node) => node.remove())
}

function removeBotpressScripts() {
  const ids = [PUBLIC_INJECT_ID, PUBLIC_CONFIG_ID]
  ids.forEach((id) => {
    const node = document.getElementById(id)
    if (node?.parentNode) node.parentNode.removeChild(node)
  })
}

function Chatbot({ isAuthenticated, isLoginOpen }) {
  const location = useLocation()

  // Botpress configuration URLs - Replace with your own bot IDs
  // Public chatbot: Only appears on homepage when NOT authenticated
  const PUBLIC_CONFIG_URL = 'https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/02/01/22/20260201225345-L1UI8M4S.json'

  useEffect(() => {
    // Rutas donde NUNCA debe aparecer el chatbot
    const noChatbotRoutes = ['/login', '/student', '/admin', '/collaborator']
    
    // Si el login está abierto o estamos en un dashboard, ocultar chatbot
    if (isLoginOpen || noChatbotRoutes.some(route => location.pathname.startsWith(route))) {
      document.body.classList.add('hide-botpress')
      removeBotpressElements()
      removeBotpressScripts()
      return
    }

    // El chatbot público SOLO aparece en la página de inicio (/) cuando NO está autenticado
    const isPublicHome = location.pathname === '/'
    const showPublicChatbot = isPublicHome && !isAuthenticated

    // Si no se debe mostrar ningún chatbot (no es homepage o ya está autenticado)
    if (!showPublicChatbot) {
      document.body.classList.add('hide-botpress')
      removeBotpressElements()
      removeBotpressScripts()
      return
    }

    // Mostrar chatbot público solo en homepage cuando no está autenticado
    document.body.classList.remove('hide-botpress')
    
    removeBotpressScripts()
    if (!document.getElementById(PUBLIC_INJECT_ID)) {
      const script1 = document.createElement('script')
      script1.id = PUBLIC_INJECT_ID
      script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
      script1.async = true
      document.body.appendChild(script1)
    }
    
    if (!document.getElementById(PUBLIC_CONFIG_ID)) {
      const script2 = document.createElement('script')
      script2.id = PUBLIC_CONFIG_ID
      script2.src = PUBLIC_CONFIG_URL
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
