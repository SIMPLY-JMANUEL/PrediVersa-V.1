import React from 'react';
import { UserCircle } from 'lucide-react';

const AdminSidebar = ({ photo, user }) => {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-card profile-card">
        <div className="profile-photo">
          {photo ? (
            <img src={photo} alt="Perfil" className="profile-photo-img" />
          ) : (
            <UserCircle size={64} color="#8ECFEA" />
          )}
        </div>
        <div className="profile-details">
          <div className="detail-item">
            <span className="label">Nombre:</span>
            <span className="value">{user?.name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Rol:</span>
            <span className="value">{user?.role}</span>
          </div>
          <div className="detail-item">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card academic-card">
        <h3 className="card-title">PANEL GENERAL</h3>
        <p className="text-muted">Centro de Control y Gestión Evalúa.</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
