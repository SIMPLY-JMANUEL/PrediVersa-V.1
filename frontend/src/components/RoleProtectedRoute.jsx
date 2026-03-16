import { Navigate } from 'react-router-dom'

function RoleProtectedRoute({ children, user, allowedRoles }) {
  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Si el rol del usuario no está en los roles permitidos
  if (!allowedRoles.includes(user.role)) {
    // Redirigir al dashboard correspondiente según su rol
    switch (user.role) {
      case 'Estudiante':
        return <Navigate to="/student" replace />
      case 'Administrador':
        return <Navigate to="/admin" replace />
      case 'Colaborador':
      case 'Colaboradores':
        return <Navigate to="/collaborator" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return children
}

export default RoleProtectedRoute