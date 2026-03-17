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
  fetchUsers,
  onViewDetails
}) => {
  return (
    <div className="verification-section">
      <div className="search-box" style={{ 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center', 
        background: '#fff', 
        padding: '12px 20px', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        marginBottom: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email, ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="search-input" 
            style={{ 
              width: '100%', 
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>
        <button 
          className="btn-primary-pro" 
          onClick={fetchUsers}
        >
          🔍 BUSCAR EN BD
        </button>
        <button 
          className="btn-primary-pro" 
          onClick={() => exportToCSV(filteredUsers)}
          style={{
            background: '#10b981',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
          }}
        >
          📥 Exportar CSV
        </button>
      </div>

      <div className="users-list-section" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="users-table full-list">
          <div className="users-table-header" style={{ 
            display: 'grid', 
            gridTemplateColumns: '2.5fr 2fr 1.5fr 1fr 1.5fr', 
            background: '#f8fafc', 
            padding: '15px 20px', 
            fontWeight: '800', 
            fontSize: '0.85rem', 
            color: '#475569', 
            borderBottom: '2px solid #f1f5f9',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Estado</span>
            <span style={{ textAlign: 'center' }}>Acciones</span>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {paginatedUsers.length === 0 ? (
              <div style={{ padding: '20px', textAlignment: 'center', color: '#64748b', fontWeight: '600', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ opacity: 0.5, marginBottom: '10px', fontSize: '2rem' }}>📂</div>
                No se encontraron usuarios
              </div>
            ) : (
              paginatedUsers.map(u => (
                <div key={u.id} className="users-table-row" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2.5fr 2fr 1.5fr 1fr 1.5fr', 
                  padding: '15px 20px', 
                  fontSize: '0.85rem', 
                  borderBottom: '1px solid #f1f5f9', 
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{u.name}</span>
                  <span style={{ color: '#64748b' }}>{u.email}</span>
                  <span>
                    <span style={{ 
                      background: u.role === 'Administrador' ? '#fef2f2' : u.role === 'Estudiante' ? '#eff6ff' : '#f0fdf4',
                      color: u.role === 'Administrador' ? '#991b1b' : u.role === 'Estudiante' ? '#1e40af' : '#166534',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {u.role}
                    </span>
                  </span>
                  <span>
                    <span style={{ 
                      color: u.status === 'Activo' ? '#166534' : '#991b1b',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'Activo' ? '#22c55e' : '#ef4444' }}></span>
                      {u.status}
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      className="view-btn-s" 
                      onClick={() => onViewDetails(u)}
                      style={{ background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                    >
                      Detalles
                    </button>
                    <button 
                      className="edit-btn-s" 
                      onClick={() => handleEdit(u)}
                      style={{ background: '#f8fafc', color: '#0ea5e9', border: '1.5px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                    >
                      Editar
                    </button>
                    <button 
                      className="delete-btn-s" 
                      onClick={() => handleDelete(u.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fee2e2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
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
