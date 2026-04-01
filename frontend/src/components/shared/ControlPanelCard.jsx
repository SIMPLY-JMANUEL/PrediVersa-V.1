import React from 'react';
import { Activity, Bell, Users, ShieldCheck, LayoutDashboard, Database } from 'lucide-react';
import './ControlPanelCard.css';

const ControlPanelCard = ({ stats }) => {
  const activePercent = stats?.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0;
  const iaProgress = stats?.totalUsers > 0 ? (stats.verifiedUsers / stats.totalUsers) * 100 : 0;

  return (
    <div className="dashboard-card control-panel-card">
      <div className="cp-header">
        <div className="cp-title-group">
          <Activity size={18} className="icon-pulse-accent" />
          <span className="cp-tag">PANEL DE CONTROL</span>
        </div>
        <div className="cp-status-dots">
          <div className={`dot-status ${stats?.dbConnected ? 'online' : 'offline'}`} title="Base de Datos"></div>
          <div className="dot-status system" title="Sistema Online"></div>
        </div>
      </div>

      <div className="cp-body">
        {/* MÉTRICAS PRINCIPALES */}
        <div className="cp-metrics-grid">
          <div className="cp-metric-box">
            <p className="cp-label">USUARIOS</p>
            <div className="cp-value-row">
              <span className="cp-number">{stats?.totalUsers || 0}</span>
              <span className="cp-trend up">{Math.round(activePercent)}% Act</span>
            </div>
          </div>
          <div className="cp-metric-box alerts">
            <p className="cp-label">ALERTAS</p>
            <div className="cp-value-row">
              <span className="cp-number danger">{stats?.totalAlerts || 0}</span>
              <Bell size={10} className="icon-vibrate" />
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO IA DINÁMICA */}
        <div className="cp-progress-section">
          <div className="cp-progress-labels">
            <span className="cp-label-sm">VALIDACIÓN IA</span>
            <span className="cp-value-sm">{stats?.verifiedUsers || 0} VERIFICADOS</span>
          </div>
          <div className="cp-progress-track">
            <div 
              className="cp-progress-fill" 
              style={{ width: `${iaProgress}%` }}
            >
              <div className="cp-progress-glow"></div>
            </div>
          </div>
        </div>

        {/* DISTRIBUCIÓN POR ROLES */}
        <div className="cp-roles-mini">
          <div className="cp-role-item"><Users size={10} /> Est: <strong>{stats?.usersByRole?.Estudiante || 0}</strong></div>
          <div className="cp-role-item"><ShieldCheck size={10} /> Psi: <strong>{stats?.usersByRole?.Psicología || 0}</strong></div>
          <div className="cp-role-item"><LayoutDashboard size={10} /> Col: <strong>{stats?.usersByRole?.Colaboradores || 0}</strong></div>
          <div className="cp-role-item"><Database size={10} /> Adm: <strong>{stats?.usersByRole?.Administrador || 0}</strong></div>
        </div>

        <div className="cp-footer">
          <span className="cp-time">Sincronización: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanelCard;
