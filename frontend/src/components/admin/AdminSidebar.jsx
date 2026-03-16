import React, { useState } from 'react';
import { UserCircle, ShieldCheck, Database, Globe, UserCheck, Bell, Users, LayoutDashboard, Activity, Zap } from 'lucide-react';
import { useUserPhoto } from '../../hooks/useUserPhoto';

const AdminSidebar = ({ user, setActiveTab, stats }) => {
  const [photo, setPhoto] = useUserPhoto();
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      await setPhoto(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const activePercent = stats?.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0;

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-card profile-card">
        <div className="profile-photo">
          {photo ? (
            <img src={photo} alt="Perfil" className="profile-photo-img" />
          ) : (
            <UserCircle size={80} color="#94a3b8" strokeWidth={1} />
          )}
          {isUploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              fontSize: '0.75rem', fontWeight: 'bold'
            }}>Cargando...</div>
          )}
        </div>
        <label style={{
          background: '#f1f5f9', color: '#475569', padding: '8px 16px',
          borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
          cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}>
          <input type="file" onChange={handlePhotoChange} accept="image/*" hidden />
          {photo ? 'Cambiar Foto' : 'Subir Foto'}
        </label>

        <div className="profile-details">
          <h3 className="user-name">{user?.name}</h3>
          <p className="user-role">{user?.role}</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      {/* PANEL DE CONTROL REDISEÑADO - SOLO ESTA CASILLA */}
      <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)', 
          padding: '1rem', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} className="icon-pulse" />
            <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>PANEL DE CONTROL</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
             <div title="DB" style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats?.dbConnected ? '#10b981' : '#f43f5e', border: '1px solid rgba(255,255,255,0.2)' }}></div>
             <div title="System" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9', border: '1px solid rgba(255,255,255,0.2)' }}></div>
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {/* MÉTRICAS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
               <p style={{ fontSize: '0.6rem', color: '#64748b', margin: '0 0 4px 0', fontWeight: '800' }}>USUARIOS</p>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                 <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>{stats?.totalUsers || 0}</span>
                 <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>{Math.round(activePercent)}% Act</span>
               </div>
            </div>
            <div style={{ background: '#fff1f2', padding: '10px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
               <p style={{ fontSize: '0.6rem', color: '#be123c', margin: '0 0 4px 0', fontWeight: '800' }}>ALERTAS</p>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                 <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#e11d48' }}>{stats?.totalAlerts || 0}</span>
                 <Bell size={10} color="#e11d48" />
               </div>
            </div>
          </div>

          {/* BARRA DE PROGRESO IA */}
          <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '8px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#475569' }}>VALIDACIÓN IA</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#6366f1' }}>{stats?.verifiedUsers || 0} OK</span>
             </div>
             <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(stats?.verifiedUsers / stats?.totalUsers) * 100 || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', transition: 'width 1s ease-out' }}></div>
             </div>
          </div>

          {/* MINI-ROLLS */}
          <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
             <div style={{ fontSize: '0.7rem', color: '#475569' }}><Users size={10} /> Est: <strong>{stats?.usersByRole?.Estudiante || 0}</strong></div>
             <div style={{ fontSize: '0.7rem', color: '#475569' }}><ShieldCheck size={10} /> Psi: <strong>{stats?.usersByRole?.Psicología || 0}</strong></div>
             <div style={{ fontSize: '0.7rem', color: '#475569' }}><LayoutDashboard size={10} /> Col: <strong>{stats?.usersByRole?.Colaboradores || 0}</strong></div>
             <div style={{ fontSize: '0.7rem', color: '#475569' }}><Database size={10} /> Adm: <strong>{stats?.usersByRole?.Administrador || 0}</strong></div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
             <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Sincronización: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
