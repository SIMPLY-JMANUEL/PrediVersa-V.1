import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Noticias() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('news');
  const [expandedId, setExpandedId] = useState(null);

  const newsItems = [
    { id: 1, source: 'El País', date: '06.11.2025', title: 'Exigencia de Ley Anti-Bullying', detail: 'Familiares de víctimas demandan al Congreso acciones inmediatas tras aumento de casos fatales.' },
    { id: 2, source: 'Cadena SER', date: '06.11.2025', title: 'Prevención Escolar Activa', detail: 'Se destaca la analítica de datos como pilar preventivo en el Día Internacional contra el Acoso.' },
    { id: 3, source: 'Cadena SER', date: '15.11.2025', title: 'Alerta Nacional: Caso Sandra Peña', detail: 'Las peticiones de ayuda institucional se multiplican exponencialmente tras suicidios recientes.' },
    { id: 4, source: 'El País', date: '27.11.2025', title: 'Crisis de Seguridad en Colegios', detail: 'Colombia lidera trágica estadística de ataques a entornos escolares en Latinoamérica.' }
  ];

  const analysisItems = [
    { id: 'a1', title: '📈 Alza del 51% en Bogotá', content: 'Solo en 2025, las agresiones físicas en colegios capitalinos escalaron drásticamente, evidenciando un problema de convivencia estructural.' },
    { id: 'a2', title: '🌍 Estándar Global 67%', content: 'Implementar sistemas predictivos reduce el acoso general en un 67% y los casos severos en un 95%.' },
    { id: 'a3', title: '⚖️ Desafío SIUCE', content: 'Aunque existe la Ley 1620, el subregistro de casos sigue siendo el mayor obstáculo para la intervención oportuna.' }
  ];

  return (
    <main className="main-responsive-container" style={{ minHeight: '90vh', background: '#f8fafc', paddingBottom: '3rem' }}>
      
      {/* BOTÓN REGRESO MINIMALISTA */}
      <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
          <span>←</span> Regresar
        </button>
      </div>

      <section className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0', overflow: 'hidden', borderRadius: '24px' }}>
        
        {/* HEADER COMPACTO */}
        <div style={{ background: 'linear-gradient(90deg, #3A6F85 0%, #2A4E5F 100%)', padding: '2.5rem 2rem', color: 'white' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>Sala de Prensa</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', marginTop: '0.5rem' }}>Información estratégica para la seguridad institucional.</p>
        </div>

        {/* SELECTOR DE PESTAÑAS (INTUITIVO) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
          <button 
            onClick={() => setActiveTab('news')}
            style={{ 
              flex: 1, padding: '1.2rem', background: 'none', border: 'none', 
              borderBottom: activeTab === 'news' ? '3px solid #8ECFEA' : 'none',
              color: activeTab === 'news' ? '#3A6F85' : '#94a3b8',
              fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem'
            }}
          >
            Últimas Noticias
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            style={{ 
              flex: 1, padding: '1.2rem', background: 'none', border: 'none', 
              borderBottom: activeTab === 'analysis' ? '3px solid #8ECFEA' : 'none',
              color: activeTab === 'analysis' ? '#3A6F85' : '#94a3b8',
              fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem'
            }}
          >
            Análisis & Datos
          </button>
        </div>

        {/* CONTENIDO DINÁMICO */}
        <div style={{ padding: '2rem' }}>
          
          {activeTab === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {newsItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  style={{ 
                    padding: '1.5rem', borderRadius: '15px', border: '1px solid #f1f5f9', 
                    cursor: 'pointer', background: expandedId === item.id ? '#f0f9ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8ECFEA', fontWeight: 800, fontSize: '0.8rem' }}>{item.source}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{item.date}</span>
                  </div>
                  <h4 style={{ color: '#1e293b', fontSize: '1.1rem', margin: '0' }}>{item.title}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem', display: expandedId === item.id ? 'block' : 'none' }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {analysisItems.map(item => (
                <div key={item.id} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '15px', borderLeft: '4px solid #3A6F85' }}>
                  <h4 style={{ color: '#3A6F85', marginBottom: '0.8rem' }}>{item.title}</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>{item.content}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </section>

      {/* ENLACES RÁPIDOS */}
      <div style={{ maxWidth: '1000px', margin: '2rem auto', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="http://siuce.mineducacion.gov.co/" target="_blank" rel="noreferrer" style={{ padding: '0.8rem 1.5rem', background: 'white', borderRadius: '50px', border: '1px solid #e2e8f0', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          Portal SIUCE 🔗
        </a>
        <a href="https://www.colombiaaprende.edu.co" target="_blank" rel="noreferrer" style={{ padding: '0.8rem 1.5rem', background: 'white', borderRadius: '50px', border: '1px solid #e2e8f0', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          Colombia Aprende 🔗
        </a>
      </div>

    </main>
  );
}

export default Noticias;
