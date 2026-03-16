import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';

const AdminStats = ({ stats }) => {
  return (
    <div className="stats-section">
      <h3 className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Estadísticas de Usuarios
      </h3>
      <div className="stats-grid">
        <div className="stat-card-large">
          <span className="stat-icon">
            <Users size={28} />
          </span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
        </div>
        <div className="stat-card-large success">
          <span className="stat-icon" style={{color: '#16a34a'}}>
            <UserCheck size={28} />
          </span>
          <div className="stat-info">
            <span className="stat-value">{stats.activos}</span>
            <span className="stat-label">Usuarios Activos</span>
          </div>
        </div>
        <div className="stat-card-large danger">
          <span className="stat-icon" style={{color: '#dc2626'}}>
            <UserX size={28} />
          </span>
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
  );
};

export default AdminStats;
