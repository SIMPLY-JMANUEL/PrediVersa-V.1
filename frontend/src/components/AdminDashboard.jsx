import { useState, useEffect, useMemo } from 'react'
import './AdminDashboard.css'

// Función para exportar a CSV
const exportToCSV = (users, filename = 'usuarios.csv') => {
  if (users.length === 0) return
  
  const headers = ['Nombre', 'Email', 'Rol', 'Estado', 'Teléfono', 'Dirección', 'Fecha Creación']
  const csvContent = [
    headers.join(','),
    ...users.map(u => [
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || ''}"`,
      `"${u.status || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.address || ''}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}"`
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

function AdminDashboard({ user, onLogout }) {
  // Estado para el formulario de usuario
  const [userForm, setUserForm] = useState({
    nombres: '',
    apellidos: '',
    id: '',
    edad: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    telefono: '',
    direccion: '',
    nombreMadre: '',
    nombrePadre: '',
    email: '',
    grado: '',
    rol: 'Estudiante'
  })

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({})

  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState('creacion')
  const [activeAlertTab, setActiveAlertTab] = useState('asignacion')

  // Estado para mensaje de guardado
  const [saveMessage, setSaveMessage] = useState('')

  // Estado para lista de usuarios
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado para ordenamiento
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  // Estado para edición
  const [editingUser, setEditingUser] = useState(null)

  // Obtener token del localStorage
  const token = localStorage.getItem('token')

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers()
  }, [])

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Validar campo en tiempo real
  const validateField = (name, value) => {
    const errors = { ...formErrors }
    
    switch (name) {
      case 'nombres':
      case 'apellidos':
        if (!value.trim()) {
          errors[name] = 'Este campo es requerido'
        } else if (value.length < 2) {
          errors[name] = 'Mínimo 2 caracteres'
        } else {
          delete errors[name]
        }
        break
      case 'id':
        if (!value.trim()) {
          errors[name] = 'El documento es requerido'
        } else if (!/^\d+$/.test(value)) {
          errors[name] = 'Solo números'
        } else {
          delete errors[name]
        }
        break
      case 'email':
        if (!value.trim()) {
          errors[name] = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[name] = 'Email inválido'
        } else {
          delete errors[name]
        }
        break
      case 'telefono':
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          errors[name] = 'Teléfono inválido (10 dígitos)'
        } else {
          delete errors[name]
        }
        break
      default:
        delete errors[name]
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = users.length
    const activos = users.filter(u => u.status === 'Activo').length
    const inactivos = total - activos
    const porRol = {
      Estudiante: users.filter(u => u.role === 'Estudiante').length,
      Colaboradores: users.filter(u => u.role === 'Colaboradores').length,
      Psicología: users.filter(u => u.role === 'Psicología').length,
      Administrador: users.filter(u => u.role === 'Administrador').length
    }
    return { total, activos, inactivos, porRol }
  }, [users])

  // Filtrar y ordenar usuarios
  const filteredUsers = useMemo(() => {
    let result = [...users]
    
    // Filtrar
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      result = result.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.documentId?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
      )
    }
    
    // Ordenar
    result.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    return result
  }, [users, searchTerm, sortField, sortDirection])

  // Usuarios paginados
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage
    return filteredUsers.slice(startIndex, startIndex + usersPerPage)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserForm({ ...userForm, [name]: value })
    validateField(name, value)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSave = async () => {
    // Validar todos los campos
    const isValid = 
      validateField('nombres', userForm.nombres) &&
      validateField('apellidos', userForm.apellidos) &&
      validateField('id', userForm.id) &&
      validateField('email', userForm.email)
    
    if (!isValid || Object.keys(formErrors).length > 0) {
      setSaveMessage('Por favor corrija los errores en el formulario')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: userForm.id,
          email: userForm.email,
          name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol,
          phone: userForm.telefono,
          address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null,
          password: 'Password123'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSaveMessage('Usuario creado exitosamente ✓')
        setUserForm({
          nombres: '',
          apellidos: '',
          id: '',
          edad: '',
          fechaNacimiento: '',
          lugarNacimiento: '',
          telefono: '',
          direccion: '',
          nombreMadre: '',
          nombrePadre: '',
          email: '',
          grado: '',
          rol: 'Estudiante'
        })
        setFormErrors({})
        fetchUsers()
      } else {
        setSaveMessage(data.message || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setSaveMessage('Error de conexión')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit)
    const nameParts = userToEdit.name?.split(' ') || ['', '']
    setUserForm({
      nombres: nameParts[0] || '',
      apellidos: nameParts.slice(1).join(' ') || '',
      id: userToEdit.documentId || '',
      edad: '',
      fechaNacimiento: userToEdit.birthDate ? userToEdit.birthDate.split('T')[0] : '',
      lugarNacimiento: '',
      telefono: userToEdit.phone || '',
      direccion: userToEdit.address || '',
      nombreMadre: '',
      nombrePadre: '',
      email: userToEdit.email || '',
      grado: '',
      rol: userToEdit.role || 'Estudiante'
    })
    setActiveTab('creacion')
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: userForm.id,
          email: userForm.email,
          name: `${userForm.nombres} ${userForm.apellidos}`,
          role: userForm.rol,
          phone: userForm.telefono,
          address: userForm.direccion,
          birthDate: userForm.fechaNacimiento || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSaveMessage('Usuario actualizado exitosamente ✓')
        setEditingUser(null)
        setUserForm({
          nombres: '',
          apellidos: '',
          id: '',
          edad: '',
          fechaNacimiento: '',
          lugarNacimiento: '',
          telefono: '',
          direccion: '',
          nombreMadre: '',
          nombrePadre: '',
          email: '',
          grado: '',
          rol: 'Estudiante'
        })
        setFormErrors({})
        fetchUsers()
      } else {
        setSaveMessage(data.message || 'Error al actualizar usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setSaveMessage('Error de conexión')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleDelete = async (userId) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setSaveMessage('Usuario eliminado exitosamente ✓')
        fetchUsers()
      } else {
        setSaveMessage(data.message || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setSaveMessage('Error de conexión')
    }

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setUserForm({
      nombres: '',
      apellidos: '',
      id: '',
      edad: '',
      fechaNacimiento: '',
      lugarNacimiento: '',
      telefono: '',
      direccion: '',
      nombreMadre: '',
      nombrePadre: '',
      email: '',
      grado: '',
      rol: 'Estudiante'
    })
    setFormErrors({})
  }

  // Últimos 5 usuarios
  const last5Users = [...users].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 5)

  return (
    <div className="admin-dashboard-wireframe">
      
      {/* Sección 1: Datos del Administrador */}
      <div className="admin-top-section">
        <div className="admin-section">
          <div className="admin-photo-section">
            <div className="admin-photo">
              <span>Foto<br/>Administrador</span>
            </div>
          </div>
          
          <div className="admin-data-section">
            <h2 className="section-title">Datos Administrador</h2>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label>Nombres</label>
                <span>:</span>
                <div className="input-wrapper">
                  <input type="text" name="adminNombres" className="wireframe-input" defaultValue={user?.name || ''} />
                </div>
              </div>
              <div className="admin-form-field">
                <label>Apellidos</label>
                <span>:</span>
                <div className="input-wrapper">
                  <input type="text" name="adminApellidos" className="wireframe-input" />
                </div>
              </div>
              <div className="admin-form-field">
                <label>ID</label>
                <span>:</span>
                <div className="input-wrapper">
                  <input type="text" name="adminId" className="wireframe-input" defaultValue={user?.id || ''} />
                </div>
              </div>
              <div className="admin-form-field">
                <label>Usuario</label>
                <span>:</span>
                <div className="input-wrapper">
                  <input type="text" name="adminUsuario" className="wireframe-input" defaultValue={user?.email || ''} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="logout-btn-top" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Panel de Estadísticas */}
      <div className="stats-section">
        <h3 className="stats-title">📊 Estadísticas de Usuarios</h3>
        <div className="stats-grid">
          <div className="stat-card-large">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Usuarios</span>
            </div>
          </div>
          <div className="stat-card-large success">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-value">{stats.activos}</span>
              <span className="stat-label">Usuarios Activos</span>
            </div>
          </div>
          <div className="stat-card-large danger">
            <span className="stat-icon">❌</span>
            <div className="stat-info">
              <span className="stat-value">{stats.inactivos}</span>
              <span className="stat-label">Usuarios Inactivos</span>
            </div>
          </div>
          <div className="stat-card-roles">
            <span className="roles-title">Por Rol:</span>
            <div className="roles-list">
              <div className="role-item"><span>Estudiante:</span> <strong>{stats.porRol.Estudiante}</strong></div>
              <div className="role-item"><span>Colaborador:</span> <strong>{stats.porRol.Colaboradores}</strong></div>
              <div className="role-item"><span>Psicología:</span> <strong>{stats.porRol.Psicología}</strong></div>
              <div className="role-item"><span>Administrador:</span> <strong>{stats.porRol.Administrador}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Creación de Usuario */}
      <div className="user-creation-section">
        <div className="tabs-row">
          <button 
            className={`tab-btn ${activeTab === 'creacion' ? 'active' : ''}`}
            onClick={() => setActiveTab('creacion')}
          >
            Creación de usuario
          </button>
          <button 
            className={`tab-btn ${activeTab === 'verificacion' ? 'active' : ''}`}
            onClick={() => setActiveTab('verificacion')}
          >
            Verificación de usuario
          </button>
          <button 
            className={`tab-btn ${activeTab === 'resultado' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('resultado')}
          >
            Resultado
          </button>
          <button 
            className={`tab-btn ${activeTab === 'estado' ? 'active' : ''}`}
            onClick={() => setActiveTab('estado')}
          >
            Estado
          </button>
        </div>

        {/* PESTAÑA: CREACIÓN DE USUARIO */}
        {activeTab === 'creacion' && (
          <>
            <div className="user-form-grid">
              <div className="form-column">
                <div className={`form-field ${formErrors.nombres ? 'has-error' : ''}`}>
                  <label>Nombres *</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="nombres" value={userForm.nombres} onChange={handleInputChange} className="wireframe-input" placeholder="Nombres" />
                  </div>
                </div>
                {formErrors.nombres && <span className="field-error">{formErrors.nombres}</span>}
                
                <div className={`form-field ${formErrors.apellidos ? 'has-error' : ''}`}>
                  <label>Apellidos *</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="apellidos" value={userForm.apellidos} onChange={handleInputChange} className="wireframe-input" placeholder="Apellidos" />
                  </div>
                </div>
                {formErrors.apellidos && <span className="field-error">{formErrors.apellidos}</span>}
                
                <div className={`form-field ${formErrors.id ? 'has-error' : ''}`}>
                  <label>ID *</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="id" value={userForm.id} onChange={handleInputChange} className="wireframe-input" placeholder="Número de documento" disabled={editingUser} />
                  </div>
                </div>
                {formErrors.id && <span className="field-error">{formErrors.id}</span>}
                
                <div className="form-field">
                  <label>Edad</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="edad" value={userForm.edad} onChange={handleInputChange} className="wireframe-input" placeholder="Edad" />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-field">
                  <label>F/Nacimiento</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="date" name="fechaNacimiento" value={userForm.fechaNacimiento} onChange={handleInputChange} className="wireframe-input" />
                  </div>
                </div>
                <div className="form-field">
                  <label>L/ Nacimiento</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="lugarNacimiento" value={userForm.lugarNacimiento} onChange={handleInputChange} className="wireframe-input" placeholder="Lugar de nacimiento" />
                  </div>
                </div>
                <div className={`form-field ${formErrors.telefono ? 'has-error' : ''}`}>
                  <label>Teléfono</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="telefono" value={userForm.telefono} onChange={handleInputChange} className="wireframe-input" placeholder="Teléfono" />
                  </div>
                </div>
                {formErrors.telefono && <span className="field-error">{formErrors.telefono}</span>}
                
                <div className="form-field">
                  <label>Dirección</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="direccion" value={userForm.direccion} onChange={handleInputChange} className="wireframe-input" placeholder="Dirección" />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-field">
                  <label>N/Madre</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="nombreMadre" value={userForm.nombreMadre} onChange={handleInputChange} className="wireframe-input" placeholder="Nombre madre" />
                  </div>
                </div>
                <div className="form-field">
                  <label>N/Padre</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="nombrePadre" value={userForm.nombrePadre} onChange={handleInputChange} className="wireframe-input" placeholder="Nombre padre" />
                  </div>
                </div>
                <div className={`form-field ${formErrors.email ? 'has-error' : ''}`}>
                  <label>Email *</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="email" name="email" value={userForm.email} onChange={handleInputChange} className="wireframe-input" placeholder="correo@ejemplo.com" />
                  </div>
                </div>
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                
                <div className="form-field">
                  <label>Grado</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" name="grado" value={userForm.grado} onChange={handleInputChange} className="wireframe-input" placeholder="Grado" />
                  </div>
                </div>
              </div>
            </div>

            <div className="action-row">
              <div className="action-box">
                <span>Creación de rol</span>
                <select 
                  name="rol" 
                  value={userForm.rol} 
                  onChange={handleInputChange}
                  className="action-select"
                >
                  <option value="Estudiante">Estudiante</option>
                  <option value="Colaboradores">Colaborador</option>
                  <option value="Psicología">Psicología</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              
              {editingUser ? (
                <>
                  <button className="update-btn" onClick={handleUpdate}>
                    Actualizar Usuario
                  </button>
                  <button className="cancel-btn" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button className="save-btn" onClick={handleSave}>
                  Guardar Información
                </button>
              )}
              
              <div className="action-box flex-1">
                <span>Creación usuario</span>
                <span className="action-value">Usuario se genera automáticamente</span>
              </div>
            </div>

            {saveMessage && (
              <div className={`save-message ${saveMessage.includes('Error') || saveMessage.includes('corrija') ? 'error' : 'success'}`}>
                {saveMessage}
              </div>
            )}

            {/* Últimos 5 usuarios creados */}
            <div className="users-list-section">
              <h3 className="users-list-title">Últimos 5 Usuarios Creados</h3>
              <div className="users-table">
                <div className="users-table-header">
                  <span>Nombre</span>
                  <span>Email</span>
                  <span>Rol</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {last5Users.map(u => (
                  <div key={u.id} className="users-table-row">
                    <span>{u.name}</span>
                    <span>{u.email}</span>
                    <span>{u.role}</span>
                    <span className={`status-${u.status?.toLowerCase()}`}>{u.status}</span>
                    <span>
                      <button className="action-btn-small edit" onClick={() => handleEdit(u)}>Editar</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PESTAÑA: VERIFICACIÓN DE USUARIO */}
        {activeTab === 'verificacion' && (
          <div className="verification-section">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Buscar por nombre, email, ID o rol..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-count">Total: {filteredUsers.length} usuarios</span>
              <button className="export-btn" onClick={() => exportToCSV(filteredUsers)}>
                📥 Exportar CSV
              </button>
            </div>
            
            <div className="users-table full-list">
              <div className="users-table-header">
                <span className="sortable" onClick={() => handleSort('name')}>
                  Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </span>
                <span className="sortable" onClick={() => handleSort('email')}>
                  Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </span>
                <span className="sortable" onClick={() => handleSort('role')}>
                  Rol {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                </span>
                <span className="sortable" onClick={() => handleSort('status')}>
                  Estado {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </span>
                <span>Teléfono</span>
                <span>Acciones</span>
              </div>
              {loadingUsers ? (
                <div className="users-table-row loading">Cargando usuarios...</div>
              ) : paginatedUsers.length === 0 ? (
                <div className="users-table-row loading">No se encontraron usuarios</div>
              ) : (
                paginatedUsers.map(u => (
                  <div key={u.id} className="users-table-row">
                    <span>{u.name}</span>
                    <span>{u.email}</span>
                    <span>{u.role}</span>
                    <span className={`status-${u.status?.toLowerCase()}`}>{u.status}</span>
                    <span>{u.phone}</span>
                    <span>
                      <button className="action-btn-small edit" onClick={() => handleEdit(u)}>Editar</button>
                      <button className="action-btn-small delete" onClick={() => handleDelete(u.id)}>Eliminar</button>
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>
                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección 3: Alertas */}
      <div className="alerts-section">
        <div className="alerts-tabs-row">
          <button 
            className={`alert-tab-btn ${activeAlertTab === 'alertas' ? '' : ''}`}
            onClick={() => setActiveAlertTab('alertas')}
          >
            Alertas
          </button>
          <button 
            className={`alert-tab-btn ${activeAlertTab === 'asignacion' ? 'active' : ''}`}
            onClick={() => setActiveAlertTab('asignacion')}
          >
            Asignación de la Alerta
          </button>
          <button 
            className={`alert-tab-btn ${activeAlertTab === 'acciones' ? '' : ''}`}
            onClick={() => setActiveAlertTab('acciones')}
          >
            Acciones
          </button>
          <button 
            className={`alert-tab-btn ${activeAlertTab === 'estadoProceso' ? '' : ''}`}
            onClick={() => setActiveAlertTab('estadoProceso')}
          >
            Estado Proceso
          </button>
        </div>

        {activeAlertTab === 'asignacion' && (
          <div className="alerts-content">
            <div className="alert-header">
              <div className="alert-type-selector">
                <span>Tipo de Alerta</span>
                <select className="action-select alert-select">
                  <option>Informativa</option>
                  <option>Preventiva</option>
                  <option>Advertencia</option>
                  <option>Critica / Emergencia</option>
                </select>
              </div>
              <div className="alert-meta">
                <div className="meta-item">
                  <span>Ticket #</span>
                  <span className="meta-value">xxxx</span>
                </div>
                <div className="meta-item">
                  <span>FECHA</span>
                  <span className="meta-value">xxxx</span>
                </div>
                <div className="meta-item">
                  <span>HORA</span>
                  <span className="meta-value">xxxx</span>
                </div>
              </div>
            </div>

            <div className="alert-details">
              <div className="alert-user-data">
                <div className="form-field">
                  <label>Nombres</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" className="wireframe-input" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Apellidos</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" className="wireframe-input" />
                  </div>
                </div>
                <div className="form-field">
                  <label>ID</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" className="wireframe-input" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Edad</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" className="wireframe-input" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Grado</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" className="wireframe-input" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Usuario</label>
                  <span>:</span>
                  <div className="input-wrapper">
                    <input type="text" className="wireframe-input" />
                  </div>
                </div>
              </div>

              <div className="alert-description">
                <p><strong>ORDEN DE ACCION:</strong> Se le solicita de manera inmediata al funcionario tomar acciones con el fin de identificar la conducta y prevenir cualquier alteración de la usuaria.</p>
              </div>
            </div>

            <div className="alert-footer">
              <div className="footer-items">
                <div className="footer-item">
                  <span>Plazo</span>
                  <span className="footer-value">xxxx</span>
                </div>
                <div className="footer-item">
                  <span>Asignado a:</span>
                  <span className="footer-value"></span>
                </div>
              </div>
              <button className="remit-btn">Remitir</button>
            </div>
          </div>
        )}

        {activeAlertTab !== 'asignacion' && (
          <div className="alerts-content empty">
            <p className="empty-message">Contenido en desarrollo para {activeAlertTab === 'alertas' ? 'Alertas' : activeAlertTab === 'acciones' ? 'Acciones' : 'Estado Proceso'}</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default AdminDashboard
