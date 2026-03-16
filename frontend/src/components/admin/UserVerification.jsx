import React from 'react';

const UserVerification = ({ 
  searchTerm, 
  setSearchTerm, 
  paginatedUsers, 
  currentPage, 
  totalPages, 
  setCurrentPage, 
  handleEdit, 
  handleDelete, 
  exportToCSV, 
  filteredUsers,
  fetchUsers
}) => {
  return (
    <div className="verification-section">
      <div className="search-box" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email, ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="search-input" 
            style={{ width: '100%', paddingRight: '40px' }}
          />
        </div>
        <button 
          className="mgmt-tab active" 
          onClick={fetchUsers}
          style={{ 
            borderRadius: '10px', 
            padding: '10px 25px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.9rem'
          }}
        >
          🔍 BUSCAR EN BD
        </button>
        <button className="export-btn" onClick={() => exportToCSV(filteredUsers)}>📥 Exportar CSV</button>
      </div>
      <div className="users-list-section">
        <div className="users-table full-list">
          <div className="users-table-header">
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {paginatedUsers.length === 0 ? (
            <div className="p-4 text-center">No se encontraron usuarios</div>
          ) : (
            paginatedUsers.map(u => (
              <div key={u.id} className="users-table-row">
                <span>{u.name}</span>
                <span>{u.email}</span>
                <span>{u.role}</span>
                <span className={`status-${u.status?.toLowerCase()}`}>{u.status}</span>
                <span>
                  <button className="action-btn-small edit" onClick={() => handleEdit(u)}>Editar</button>
                  <button className="action-btn-small delete" onClick={() => handleDelete(u.id)}>Eliminar</button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            className="page-btn"
          >Anterior</button>
          <span className="page-info">Página {currentPage} de {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            className="page-btn"
          >Siguiente</button>
        </div>
      )}
    </div>
  );
};

export default UserVerification;
