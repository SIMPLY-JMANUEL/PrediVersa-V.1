import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Chatbot.css'

const PUBLIC_INJECT_ID = 'bp-inject-script-public'
const PUBLIC_CONFIG_ID = 'bp-config-script-public'
const STUDENT_INJECT_ID = 'bp-inject-script-student'
const STUDENT_CONFIG_ID = 'bp-config-script-student'

function removeBotpressElements() {
  const botpressContainers = document.querySelectorAll(
    '[class*="bpw-"], [id^="bp-"], .bpw-widget, .bpw-chat-bubble, #bp-web-widget-container'
  )
  botpressContainers.forEach((node) => node.remove())

  const botpressIframes = document.querySelectorAll('iframe[src*="botpress"]')
  botpressIframes.forEach((node) => node.remove())
}

function removeBotpressScripts() {
  const ids = [PUBLIC_INJECT_ID, PUBLIC_CONFIG_ID, STUDENT_INJECT_ID, STUDENT_CONFIG_ID]
  ids.forEach((id) => {
    const node = document.getElementById(id)
    if (node?.parentNode) node.parentNode.removeChild(node)
  })
}

function Chatbot({ isAuthenticated, isLoginOpen }) {
  const location = useLocation()

  // Botpress configuration URLs - Replace with your own bot IDs
  const PUBLIC_CONFIG_URL = 'https://files.bpcontent.cloud/2026/02/24/03/20260224033302-7VFXIL75.js'
  const STUDENT_CONFIG_URL = 'https://files.bpcontent.cloud/2026/02/24/03/20260224033302-7VFXIL75.js'

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        return JSON.parse(userData)
      }
    } catch (e) {}
    return null
  }

  useEffect(() => {
    // Si el login está abierto, ocultar chatbot
    if (isLoginOpen) {
      document.body.classList.add('hide-botpress')
      removeBotpressElements()
      removeBotpressScripts()
      return
    }

    const isPublicHome = location.pathname === '/'
    const isStudentRoute = location.pathname === '/student'

    // Show public chatbot on home page when NOT authenticated
    // Get user data and role
    const userData = getUserData()
    const userRole = userData?.role || null
    
    // Show student chatbot on ANY route when authenticated
    const showPublic = isPublicHome && !isAuthenticated
    const showStudent = isAuthenticated

    // Si no se debe mostrar ningún chatbot
    if (!showPublic && !showStudent) {
      document.body.classList.add('hide-botpress')
      removeBotpressElements()
      removeBotpressScripts()
      return
    }

    document.body.classList.remove('hide-botpress')

    if (showPublic) {
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
    }

    if (showStudent) {
      removeBotpressScripts()
      if (!document.getElementById(STUDENT_INJECT_ID)) {
        const script1 = document.createElement('script')
        script1.id = STUDENT_INJECT_ID
        script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
        script1.async = true
        document.body.appendChild(script1)
      }
      
      if (!document.getElementById(STUDENT_CONFIG_ID)) {
        const script2 = document.createElement('script')
        script2.id = STUDENT_CONFIG_ID
        script2.src = STUDENT_CONFIG_URL
        script2.defer = true
        script2.onload = () => {
          // Pass user role to Botpress after config loads
          setTimeout(() => {
            if (window.botpressWebChat) {
              window.botpressWebChat.configure({
                userId: userData?.email || 'authenticated-user',
                extra: {
                  role: userRole,
                  name: userData?.name,
                  email: userData?.email
                }
              }).catch(() => {
                console.log('Botpress configure not available yet')
              })
            }
          }, 1000)
        }
        document.body.appendChild(script2)
      }
    }

    return () => {
      removeBotpressElements()
      removeBotpressScripts()
    }
  }, [location.pathname, isAuthenticated, isLoginOpen])

  return null
}

export default Chatbot
