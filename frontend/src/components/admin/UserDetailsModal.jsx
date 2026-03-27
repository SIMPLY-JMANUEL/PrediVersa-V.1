import React from 'react';

const UserDetailsModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalles del Usuario</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Nombre:</span>
            <span className="detail-value">{user.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Documento:</span>
            <span className="detail-value">{user.documentId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rol:</span>
            <span className="detail-value">{user.role}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Teléfono:</span>
            <span className="detail-value">{user.phone || 'No registrado'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Dirección:</span>
            <span className="detail-value">{user.address || 'No registrada'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fecha de Nac.:</span>
            <span className="detail-value">{user.birthDate ? user.birthDate.split('T')[0] : 'No registrada'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Edad:</span>
            <span className="detail-value">{user.edad || 'No registrada'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Lugar de Nac.:</span>
            <span className="detail-value">{user.lugarNacimiento || 'No registrado'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Nombre Padre:</span>
            <span className="detail-value">{user.nombrePadre || 'No registrado'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Nombre Madre:</span>
            <span className="detail-value">{user.nombreMadre || 'No registrado'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Grado:</span>
            <span className="detail-value">{user.grado || 'No registrado'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Estado:</span>
            <span className={`detail-value status-${user.status?.toLowerCase()}`}>{user.status}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Creado:</span>
            <span className="detail-value">{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'No disponible'}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="action-btn" onClick={() => { onClose(); onEdit(user); }}>Editar Usuario</button>
          <button className="action-btn cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
