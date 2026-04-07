import React, { useRef } from 'react';
import { UserCircle, Camera } from 'lucide-react';
import { useUserPhoto } from '../../hooks/useUserPhoto';
import ControlPanelCard from './ControlPanelCard';
import '../../styles/components/UniversalSidebar.css';

const UniversalSidebar = ({ user, stats, children }) => {
  const [photo, setPhoto] = useUserPhoto();
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // Persiste en localStorage y RDS vía hook
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="dashboard-sidebar">
      {/* CARD DE PERFIL CON CARGA DE IMAGEN INTEGRADA */}
      <div className="dashboard-card profile-card-universal">
        <div className="profile-photo-wrapper" onClick={handlePhotoClick}>
          <div className="profile-photo-main">
            {photo ? (
              <img src={photo} alt="Perfil" className="profile-photo-img" />
            ) : (
              <UserCircle size={80} color="#94a3b8" strokeWidth={1} />
            )}
          </div>
          <div className="photo-upload-overlay">
            <Camera size={20} color="#fff" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
        </div>

        <div className="profile-details-universal">
          <h3 className="user-name-pro">{user?.name}</h3>
          <div className="user-role-badge">{user?.role}</div>
          <p className="user-email-pro">{user?.email}</p>
        </div>
      </div>

      {/* PANEL DE CONTROL DINÁMICO REUTILIZABLE */}
      <ControlPanelCard stats={stats} />

      {/* CONTENIDO ESPECÍFICO DE CADA DASHBOARD */}
      {children}
    </aside>
  );
};

export default UniversalSidebar;
