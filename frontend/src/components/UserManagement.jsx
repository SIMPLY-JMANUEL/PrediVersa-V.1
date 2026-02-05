import { useState, useEffect } from 'react'
import './UserManagement.css'

function UserManagement({ onClose }) {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })

  const [formData, setFormData] = useState({
    documentId: '',
    name: '',
    email: '',
    role: 'Estudiante',
    phone: '',
    address: '',
    birthDate: '',
    status: 'Activo',
    password: ''
  })

  const baseUrl = 'http://localhost:5000'

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers()
  }, [])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/auth/users`)
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      } else {
        setError('Error al cargar usuarios')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...users]

    // Filtro de búsqueda (nombre, email, documento)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.documentId?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por rol
    if (filters.role) {
      result = result.filter(user => user.role === filters.role)
    }

    // Filtro por estado
    if (filters.status) {
      result = result.filter(user => user.status === filters.status)
    }

    setFilteredUsers(result)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingUser 
        ? `${baseUrl}/api/auth/users/${editingUser.id}`
        : `${baseUrl}/api/auth/register`
      
      const method = editingUser ? 'PUT' : 'POST'
      
      const bodyData = { ...formData }

      // Si estamos editando y no se proporcionó contraseña, no enviarla
      if (editingUser && !formData.password) {
        delete bodyData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers() // Recargar lista
        resetForm()
        setShowForm(false)
      } else {
        setError(data.message || 'Error al guardar usuario')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error:', err)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return
    }

    try {
      const response = await fetch(`${baseUrl}/api/auth/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers() // Recargar lista
      } else {
        setError(data.message || 'Error al eliminar usuario')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error:', err)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      documentId: user.documentId || '',
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      birthDate: user.birthDate || '',
      status: user.status || 'Activo',
      password: ''
    })
    setShowForm(true)
    setViewingUser(null)
  }

  const handleView = (user) => {
    setViewingUser(user)
    setShowForm(false)
  }

  const resetForm = () => {
    setFormData({
      documentId: '',
      name: '',
      email: '',
      role: 'Estudiante',
      phone: '',
      address: '',
      birthDate: '',
      status: 'Activo',
      password: ''
    })
    setEditingUser(null)
    setViewingUser(null)
    setError('')
  }

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  return (
    <div className="user-management-overlay" onClick={onClose}>
      <div className="user-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-management-header">
          <h2>Gestionar Usuarios</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!showForm && !viewingUser ? (
          <>
            {/* Filtros */}
            <div className="filters-container">
              <div className="filter-group">
                <input
                  type="text"
                  name="search"
                  placeholder="Buscar por nombre, email o documento..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Todos los roles</option>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Colaboradores">Colaborador</option>
                </select>
              </div>
              <div className="filter-group">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <button className="btn-secondary" onClick={clearFilters}>
                Limpiar filtros
              </button>
              <button className="btn-primary" onClick={handleAddNew}>
                + Agregar Usuario
              </button>
            </div>

            {/* Contador de resultados */}
            <div className="results-count">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </div>

            {loading ? (
              <div className="loading">Cargando usuarios...</div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.documentId || 'N/A'}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${user.status?.toLowerCase() || 'activo'}`}>
                            {user.status || 'Activo'}
                          </span>
                        </td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <button 
                            className="btn-view"
                            onClick={() => handleView(user)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(user)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(user.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="no-results">No se encontraron usuarios con los filtros aplicados</div>
                )}
              </div>
            )}
          </>
        ) : viewingUser ? (
          // Vista de detalles del usuario
          <div className="user-details">
            <h3>Detalles del Usuario</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Documento:</label>
                <span>{viewingUser.documentId || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Nombre:</label>
                <span>{viewingUser.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{viewingUser.email}</span>
              </div>
              <div className="detail-item">
                <label>Rol:</label>
                <span className={`role-badge role-${viewingUser.role.toLowerCase()}`}>
                  {viewingUser.role}
                </span>
              </div>
              <div className="detail-item">
                <label>Estado:</label>
                <span className={`status-badge status-${viewingUser.status?.toLowerCase() || 'activo'}`}>
                  {viewingUser.status || 'Activo'}
                </span>
              </div>
              <div className="detail-item">
                <label>Teléfono:</label>
                <span>{viewingUser.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Fecha de Nacimiento:</label>
                <span>{formatDate(viewingUser.birthDate)}</span>
              </div>
              <div className="detail-item">
                <label>Fecha de Registro:</label>
                <span>{formatDate(viewingUser.createdAt)}</span>
              </div>
              <div className="detail-item full-width">
                <label>Dirección:</label>
                <span>{viewingUser.address || 'N/A'}</span>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setViewingUser(null)}>
                Volver
              </button>
              <button className="btn-primary" onClick={() => handleEdit(viewingUser)}>
                Editar Usuario
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="user-form">
            <h3>{editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="documentId">Documento de Identidad *</label>
                <input
                  type="text"
                  id="documentId"
                  value={formData.documentId}
                  onChange={(e) => setFormData({...formData, documentId: e.target.value})}
                  required
                  placeholder="Ej: 1234567890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Nombre Completo *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Nombre completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Rol *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="Estudiante">Estudiante</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Colaboradores">Colaborador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="3001234567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthDate">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>

              {editingUser && (
                <div className="form-group">
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              <div className="form-group full-width">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Calle, número, ciudad"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                  placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => {setShowForm(false); resetForm();}}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default UserManagement