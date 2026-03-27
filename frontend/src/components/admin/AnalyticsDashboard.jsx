import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Activity, ShieldAlert, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ stats }) => {
  if (!stats) return <div className="analytics-loading">Cargando inteligencia de datos...</div>;

  // Transformación de datos para Recharts
  const trendData = stats.alertsTrend || [];
  
  const typeData = Object.entries(stats.alertsByType || {}).map(([name, value]) => ({
    name: name.replace('Violencia ', ''),
    value
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const statusData = Object.entries(stats.alertsByStatus || {}).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#ef4444', '#10b981'];
  const STATUS_COLORS = {
    'Pendiente': '#ef4444',
    'En Proceso': '#f97316',
    'Resuelto': '#10b981',
    'Resuelta': '#10b981'
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <Activity size={32} color="#6366f1" />
        <h2>Analítica Predictiva de Bienestar</h2>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-value">{stats.totalAlerts || 0}</span>
          <span className="stat-label">Alertas Totales</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" style={{ color: '#ef4444' }}>{stats.pendingAlerts || 0}</span>
          <span className="stat-label">Casos Críticos</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" style={{ color: '#10b981' }}>{stats.resolvedAlerts || 0}</span>
          <span className="stat-label">Casos Resueltos</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" style={{ color: '#8b5cf6' }}>
            {Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100 || 0)}%
          </span>
          <span className="stat-label">Eficiencia Operativa</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* TENDENCIA TEMPORAL */}
        <div className="chart-card">
          <h3><TrendingUp size={18} /> Línea de Vida Institucional</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RADAR DE TIPOLOGÍAS */}
        <div className="chart-card">
          <h3><PieIcon size={18} /> Top 5 Riesgos Detectados</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESTADO DE RESOLUCIÓN */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3><ShieldAlert size={18} /> Estado Progresivo de Casos</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
            * Estos datos son analizados proactivamente por el Motor Versa 2.0 en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
