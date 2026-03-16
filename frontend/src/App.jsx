import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import Login from './components/Login'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import CollaboratorDashboard from './components/CollaboratorDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

function AppRoutes({ user, isLoginOpen, setIsLoginOpen, handleLogin, handleLogout }) {
  const location = useLocation()
  return (
    <>
      <Routes>
        <Route path="/" element={
          <>
            <Header onLoginClick={() => setIsLoginOpen(true)} />
            <Main />
          </>
        } />
        <Route path="/student" element={
          <RoleProtectedRoute user={user} allowedRoles={['Estudiante']}>
            <StudentDashboard user={user} onLogout={handleLogout} />
          </RoleProtectedRoute>
        } />
        <Route path="/admin" element={
          <RoleProtectedRoute user={user} allowedRoles={['Administrador']}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </RoleProtectedRoute>
        } />
        <Route path="/collaborator" element={
          <RoleProtectedRoute user={user} allowedRoles={['Colaborador', 'Colaboradores']}>
            <CollaboratorDashboard user={user} onLogout={handleLogout} />
          </RoleProtectedRoute>
        } />
      </Routes>
      <Chatbot key={location.pathname} isAuthenticated={!!user} isLoginOpen={isLoginOpen} />
      <Footer />
      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLogin}
      />
    </>
  )
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Mostrar loading mientras se verifica el usuario
  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
  }

  return (
    <Router>
      <AppRoutes 
        user={user}
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  )
}

export default App

