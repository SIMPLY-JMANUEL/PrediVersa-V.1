import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Activity, ShieldAlert, TrendingUp, PieChart as PieIcon, Brain, Users, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ stats }) => {
  const [aiStats, setAiStats] = useState({ trends: [], critical: [], distribution: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIStats = async () => {
      try {
        const [trends, critical, dist] = await Promise.all([
          apiFetch('/api/dashboard/risk-trends'),
          apiFetch('/api/dashboard/critical-students'),
          apiFetch('/api/dashboard/risk-distribution')
        ]);
        setAiStats({
          trends: trends.data || [],
          critical: critical.data || [],
          distribution: dist.data || []
        });
      } catch (err) {
        console.error("Error cargando métricas de IA:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIStats();
  }, []);

  if (!stats) return <div className="analytics-loading">Cargando inteligencia de datos...</div>;

  const trendData = stats.alertsTrend || [];
  const typeData = Object.entries(stats.alertsByType || {}).map(([name, value]) => ({
    name: name.replace('Violencia ', ''),
    value
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const riskDistData = aiStats.distribution.map(d => ({
    name: d.risk,
    value: d.count
  }));

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#ef4444', '#10b981'];
  const RISK_COLORS = { 'ALTO': '#ef4444', 'MEDIO': '#f97316', 'BAJO': '#10b981' };

  return (
    <div className="analytics-container animate-fade-in">
      <div className="analytics-header">
        <Activity size={32} color="#6366f1" />
        <h2>Analítica Predictiva de Bienestar</h2>
      </div>

      {/* KPI CARDS */}
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
          <span className="stat-value" style={{ color: '#8b5cf6' }}>
            <Brain size={20} style={{ display: 'inline', marginRight: '5px' }} />
            {aiStats.trends.length > 0 ? aiStats.trends[0].avg_risk : 0}
          </span>
          <span className="stat-label">Riesgo Promedio (AI)</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" style={{ color: '#10b981' }}>
            {Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100 || 0)}%
          </span>
          <span className="stat-label">Eficiencia Operativa</span>
        </div>
      </div>

      <div className="charts-grid">
        {/* TENDENCIA DE RIESGO AI */}
        <div className="chart-card" style={{ gridColumn: 'span 2', minHeight: '350px' }}>
          <h3><TrendingUp size={18} /> Tendencia de Riesgo Conversacional (Risk Index v2)</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={[...aiStats.trends].reverse()}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(str) => str.split('T')[0]} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="avg_risk" name="Score Promedio" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISTRIBUCIÓN DE RIESGO CHATBOT */}
        <div className="chart-card">
          <h3><PieIcon size={18} /> Clima Emocional (AI)</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={riskDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESTUDIANTES CRÍTICOS */}
        <div className="chart-card">
          <h3><AlertTriangle size={18} color="#ef4444" /> Focos de Atención Urgente</h3>
          <div className="critical-students-list">
            {aiStats.critical.length > 0 ? aiStats.critical.map((s, i) => (
              <div key={i} className="critical-student-row">
                <span className="student-id">Estudiante ID: {s.student_id ? s.student_id.slice(-6) : '---'}</span>
                <span className="risk-tag alto">Score: {s.max_risk}</span>
              </div>
            )) : <p className="no-data">No se detectan focos críticos hoy.</p>}
          </div>
        </div>

        {/* REPORTES CLÁSICOS (LÍNEA DE VIDA) */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3><ShieldAlert size={18} /> Histórico de Alertas Institucionales</h3>
          <div style={{ width: '100%', height: 250 }}>
             <ResponsiveContainer>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={120} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" name="Casos" radius={[0, 4, 4, 0]} fill="#6366f1" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
