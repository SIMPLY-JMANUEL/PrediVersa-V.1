import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, ShieldAlert, TrendingUp, PieChart as PieIcon, Brain, AlertTriangle, Zap } from 'lucide-react';
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

  if (!stats) return (
    <div className="analytics-loading-container">
      <div className="analytics-loader"></div>
      <p>Iniciando Motor de Inteligencia Predictiva...</p>
    </div>
  );

  const trendData = stats.alertsTrend || [];
  const typeData = Object.entries(stats.alertsByType || {}).map(([name, value]) => ({
    name: name.replace('Violencia ', ''),
    value
  })).sort((a, b) => b.value - a.value).slice(0, 6);
  const riskDistData = (Array.isArray(aiStats.distribution) ? aiStats.distribution : []).map(d => ({
    name: (d.risk || 'BAJO').toUpperCase(),
    value: d.count || 0
  }));

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#ef4444', '#10b981'];
  const RISK_COLORS = { 'ALTO': '#ef4444', 'MEDIO': '#f97316', 'BAJO': '#10b981' };

  // Calcular eficiencia de forma segura
  const efficiency = (stats.totalAlerts && stats.totalAlerts > 0)
    ? Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100) 
    : 0;

  return (
    <div className="analytics-container animate-fade-in shadow-premium">
      <div className="analytics-header">
        <div className="header-icon-wrapper">
          <Brain size={32} color="#8b5cf6" />
        </div>
        <div className="header-text">
          <h2>Inteligencia Prediversa v1.1</h2>
          <p>Visión analítica alimentada por Amazon Bedrock y Lex.</p>
        </div>
        <div className="ai-badge">
          <Zap size={14} fill="#fbbf24" color="#fbbf24" />
          <span>HÍBRIDO ACTIVO</span>
        </div>
      </div>

      {/* KPI CARDS - Premium Look */}
      <div className="stats-summary">
        <div className="stat-card glass">
          <div className="stat-icon"><Activity size={20} color="#6366f1" /></div>
          <div className="stat-data">
            <span className="stat-value">{stats.totalAlerts || 0}</span>
            <span className="stat-label">Alertas Generales</span>
          </div>
        </div>
        <div className="stat-card glass alert-critical">
          <div className="stat-icon"><ShieldAlert size={20} color="#ef4444" /></div>
          <div className="stat-data">
            <span className="stat-value">{stats.pendingAlerts || 0}</span>
            <span className="stat-label">Riesgo Extremo</span>
          </div>
        </div>
        <div className="stat-card glass ai-brain">
          <div className="stat-icon"><Brain size={20} color="#8b5cf6" /></div>
          <div className="stat-data">
            <span className="stat-value">
              {aiStats.trends && aiStats.trends.length > 0 ? aiStats.trends[0].avg_risk : '---'}
            </span>
            <span className="stat-label">Indice Riesgo (AI)</span>
          </div>
        </div>
        <div className="stat-card glass success">
          <div className="stat-icon"><TrendingUp size={20} color="#10b981" /></div>
          <div className="stat-data">
            <span className="stat-value">{efficiency}%</span>
            <span className="stat-label">Puntaje Operativo</span>
          </div>
        </div>
      </div>

      <div className="charts-grid-main">
        {/* TENDENCIA DE RIESGO AI - Gráfico Deslumbrante */}
        <div className="chart-wrapper glass span-2" style={{ minHeight: '350px' }}>
          <div className="chart-header">
            <h3><TrendingUp size={18} /> Tendencia de Bienestar Emocional (Risk Index v2)</h3>
            <span className="badge-pro">Actualizado: TR</span>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={Array.isArray(aiStats.trends) ? [...aiStats.trends].reverse() : []}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(str) => str?.split('T')[0] || str} 
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                   itemStyle={{ color: '#f43f5e', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="avg_risk" name="Score Promedio" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISTRIBUCIÓN DE RIESGO CHATBOT - Pie Pro */}
        <div className="chart-wrapper glass" style={{ minHeight: '320px' }}>
          <div className="chart-header">
            <h3><PieIcon size={18} /> Clasificación IA de Mensajes</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riskDistData.length > 0 ? riskDistData : [{name: 'SIN DATOS', value: 1}]} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#6366f1'} />
                  ))}
                  {!riskDistData.length && <Cell fill="#334155" />}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESTUDIANTES CRÍTICOS - Lista de alto impacto */}
        <div className="chart-wrapper glass">
          <div className="chart-header">
            <h3><AlertTriangle size={18} color="#ef4444" /> Detecciones de Riesgo Inmediato</h3>
          </div>
          <div className="critical-students-scroll">
            {Array.isArray(aiStats.critical) && aiStats.critical.length > 0 ? aiStats.critical.map((s, i) => (
              <div key={i} className="student-alert-item pulse-red">
                <div className="student-info">
                  <span className="id-label">SESIÓN ID</span>
                  <span className="id-value">{s.student_id ? s.student_id.substring(0, 12).toUpperCase() : '---'}</span>
                </div>
                <div className="risk-score-badge">
                  <span className="score-val">{s.max_risk}</span>
                  <span className="score-unit">SC</span>
                </div>
              </div>
            )) : (
              <div className="no-critical-data">
                <ShieldAlert size={40} color="#10b981" style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>Monitoreo activo. No hay riesgos críticos detectados.</p>
              </div>
            )}
          </div>
        </div>

        {/* HISTORICO DE ALERTAS INSTITUCIONALES */}
        <div className="chart-wrapper glass span-2" style={{ minHeight: '300px' }}>
           <div className="chart-header">
            <h3><ShieldAlert size={18} /> Concentración de Alertas por Categoría</h3>
          </div>
          <div className="chart-content">
             <ResponsiveContainer width="100%" height={240}>
              <BarChart data={typeData.length > 0 ? typeData : [{name: 'Sin alertas', value: 0}]} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} 
                />
                <Bar dataKey="value" name="Casos Detectados" radius={[6, 6, 0, 0]} fill="#818cf8" barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
