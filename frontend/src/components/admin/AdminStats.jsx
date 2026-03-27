import React from 'react';
import { Users, UserCheck, UserX, Globe, Database, Bell, ShieldCheck } from 'lucide-react';

const AdminStats = ({ stats }) => {
  return (
    <div className="stats-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Database size={20} color="#0ea5e9" />
          Estadísticas del Sistema
        </h3>
        
        {/* ESTADO DE LA RED / SISTEMA */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: stats.dbConnected ? '#10b981' : '#ef4444', background: stats.dbConnected ? '#ecfdf5' : '#fef2f2', padding: '4px 10px', borderRadius: '20px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.dbConnected ? '#10b981' : '#ef4444' }} />
            BD CONECTADA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#0ea5e9', background: '#f0f9ff', padding: '4px 10px', borderRadius: '20px' }}>
            <Globe size={12} />
            SISTEMA EN LÍNEA
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        
        {/* USUARIOS TOTALES */}
        <div className="stat-card-large">
          <span className="stat-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
            <Users size={24} />
          </span>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUsers || stats.total}</span>
            <span className="stat-label">Usuarios Totales</span>
          </div>
        </div>

        {/* USUARIOS ACTIVOS */}
        <div className="stat-card-large success">
          <span className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <UserCheck size={24} />
          </span>
          <div className="stat-info">
            <span className="stat-value">{stats.activeUsers || stats.activos}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>

        {/* ALERTAS TOTALES */}
        <div className="stat-card-large warning" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Bell size={24} />
          </span>
          <div className="stat-info">
            <span className="stat-value">{stats.totalAlerts || 0}</span>
            <span className="stat-label">Alertas de IA</span>
          </div>
        </div>

        {/* USUARIOS VERIFICADOS */}
        <div className="stat-card-large info" style={{ borderLeft: '4px solid #6366f1' }}>
          <span className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
            <ShieldCheck size={24} />
          </span>
          <div className="stat-info">
            <span className="stat-value">{stats.verifiedUsers || 0}</span>
            <span className="stat-label">Verificados</span>
          </div>
        </div>
      </div>

      {/* DESGLOSE POR ROL */}
      <div style={{ marginTop: '1.5rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribución por Roles</span>
        <div className="roles-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="role-item" style={{ borderRight: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Estudiantes</span>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{stats.usersByRole?.Estudiante || stats.porRol?.Estudiante}</strong>
          </div>
          <div className="role-item" style={{ borderRight: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Colaboradores</span>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{stats.usersByRole?.Colaboradores || stats.porRol?.Colaboradores}</strong>
          </div>
          <div className="role-item" style={{ borderRight: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Psicología</span>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{stats.usersByRole?.Psicología || stats.porRol?.Psicología}</strong>
          </div>
          <div className="role-item">
            <span style={{ color: '#64748b' }}>Admin</span>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{stats.usersByRole?.Administrador || stats.porRol?.Administrador}</strong>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Última sincronización: {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'En tiempo real'}</span>
      </div>
    </div>
  );
};

export default AdminStats;
