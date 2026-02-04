import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import Login from './components/Login'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import CollaboratorDashboard from './components/CollaboratorDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes({ user, isLoginOpen, setIsLoginOpen, handleLogin, handleLogout }) {
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
          <ProtectedRoute user={user}>
            <StudentDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute user={user}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/collaborator" element={
          <ProtectedRoute user={user}>
            <CollaboratorDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
      </Routes>
      <Chatbot isAuthenticated={!!user} isLoginOpen={isLoginOpen} />
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

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
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

