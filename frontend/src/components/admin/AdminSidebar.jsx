import React, { useState } from 'react';
import { UserCircle, ShieldCheck } from 'lucide-react';
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

      <div 
        className="dashboard-card clickable-card" 
        onClick={() => setActiveTab && setActiveTab('dashboard')}
        style={{ 
          padding: '1.5rem', 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0c4a6e', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
          <ShieldCheck size={18} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>PANEL DE CONTROL</h4>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
             <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0, fontWeight: '700' }}>USUARIOS</p>
             <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0ea5e9', margin: 0 }}>{stats?.totalUsers || 0}</p>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
             <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0, fontWeight: '700' }}>ALERTAS</p>
             <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f43f5e', margin: 0 }}>{stats?.totalAlerts || 0}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: '1.3' }}>Gestión integral de la plataforma: Usuarios, Alertas y Auditoría.</p>
        <p style={{ fontSize: '0.7rem', color: '#0ea5e9', marginTop: '12px', fontWeight: '800', borderTop: '1px solid #f1f5f9', paddingTop: '8px', textAlign: 'center' }}>
          VER DASHBOARD COMPLETO →
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
