import React from 'react';
import UniversalSidebar from '../shared/UniversalSidebar';
import { LayoutDashboard, Users, Bell, Settings } from 'lucide-react';

const AdminSidebar = ({ user, setActiveTab, stats }) => {
  return (
    <UniversalSidebar user={user} stats={stats}>
      {/* SECCIÓN DE NAVEGACIÓN RÁPIDA (OPCIONAL EN SIDEBAR) */}
      <div className="dashboard-card" style={{ padding: '1rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={18} /> NAVEGACIÓN
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'usuarios', label: 'Gestión Usuarios', icon: <Users size={16} /> },
            { id: 'alertas', label: 'Centro Alertas', icon: <Bell size={16} /> },
            { id: 'configuracion', label: 'Estructura', icon: <Settings size={16} /> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                border: 'none', background: 'transparent', borderRadius: '10px',
                cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#3A6F85' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </UniversalSidebar>
  );
};

export default AdminSidebar;
