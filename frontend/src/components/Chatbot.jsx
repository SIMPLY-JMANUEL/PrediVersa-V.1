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

    const showPublic = isPublicHome && !isAuthenticated
    const showStudent = isStudentRoute && isAuthenticated

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
        script1.src = 'https://cdn.botpress.cloud/webchat/v3.5/inject.js'
        script1.async = true
        document.body.appendChild(script1)
      }

      if (!document.getElementById(PUBLIC_CONFIG_ID)) {
        const script2 = document.createElement('script')
        script2.id = PUBLIC_CONFIG_ID
        script2.src = 'https://files.bpcontent.cloud/2026/02/01/22/20260201225345-6RFZIFLO.js'
        script2.defer = true
        document.body.appendChild(script2)
      }
    }

    if (showStudent) {
      removeBotpressScripts()
      if (!document.getElementById(STUDENT_INJECT_ID)) {
        const script1 = document.createElement('script')
        script1.id = STUDENT_INJECT_ID
        script1.src = 'https://cdn.botpress.cloud/webchat/v3.5/inject.js'
        script1.async = true
        document.body.appendChild(script1)
      }

      if (!document.getElementById(STUDENT_CONFIG_ID)) {
        const script2 = document.createElement('script')
        script2.id = STUDENT_CONFIG_ID
        script2.src = 'https://files.bpcontent.cloud/2026/02/04/01/20260204011551-9Y10Y2F8.js'
        script2.defer = true
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
