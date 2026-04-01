import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useUIStore } from './store/useUIStore'

// 🏛️ Componentes Críticos (Carga Inmediata)
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import Login from './components/Login'
import RoleProtectedRoute from './components/RoleProtectedRoute'

// ⚡ Componentes Lazy (Code Splitting - Carga diferida)
const StudentDashboard = lazy(() => import('./components/StudentDashboard'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const CollaboratorDashboard = lazy(() => import('./components/CollaboratorDashboard'))
const ResetPassword = lazy(() => import('./components/ResetPassword'))
const QuienesSomos = lazy(() => import('./components/QuienesSomos'))
const Servicios = lazy(() => import('./components/Servicios'))
const Noticias = lazy(() => import('./components/Noticias'))
const Planes = lazy(() => import('./components/Planes'))
const Contacto = lazy(() => import('./components/Contacto'))

/**
 * 🧊 LUXE LOADER (Suspense Fallback)
 */
const LuxeLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-xl z-[3000]">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    <p className="mt-4 font-black text-primary text-xs uppercase tracking-[0.2em] animate-pulse">Sincronizando PrediVersa...</p>
  </div>
);

/**
 * 🏛️ PREDIVERSA - ORQUESTADOR DE RUTAS (OPTIMIZED)
 */
function AppRoutes({ user, handleLogout }) {
  const { isLoginOpen, setLoginOpen } = useUIStore();
  
  return (
    <Suspense fallback={<LuxeLoader />}>
      <Routes>
        <Route path="/" element={<><Header onLoginClick={() => setLoginOpen(true)} /><Main /></>} />
        <Route path="/quienes-somos" element={<><Header onLoginClick={() => setLoginOpen(true)} /><QuienesSomos /></>} />
        <Route path="/servicios" element={<><Header onLoginClick={() => setLoginOpen(true)} /><Servicios /></>} />
        <Route path="/noticias" element={<><Header onLoginClick={() => setLoginOpen(true)} /><Noticias /></>} />
        <Route path="/planes" element={<><Header onLoginClick={() => setLoginOpen(true)} /><Planes /></>} />
        <Route path="/contacto" element={<><Header onLoginClick={() => setLoginOpen(true)} /><Contacto /></>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
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
      <Footer />
      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setLoginOpen(false)}
      />
    </Suspense>
  )
}

function App() {
  const { user, logout } = useAuthStore();
  
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      useUIStore.getState().setLoginOpen(true);
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout]);

  return (
    <Router>
      <AppRoutes 
        user={user}
        handleLogout={logout}
      />
    </Router>
  )
}

export default App

