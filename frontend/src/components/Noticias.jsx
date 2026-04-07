import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Main.css';

function Noticias() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('global'); // 'global', 'colombia', 'risk', 'norm'

  const globalStats = [
    { label: 'Acoso Escolar', value: '1 de cada 3', desc: 'estudiantes en el mundo sufren acoso sistemático.' },
    { label: 'Peleas Físicas', value: '36%', desc: 'de los estudiantes han participado en conflictos violentos.' },
    { label: 'Ciberacoso', value: '10%', desc: 'de los niños se ven afectados por hostigamiento digital.' },
    { label: 'Acoso en Línea (Mujeres)', value: '58%', desc: 'de las jóvenes han sufrido acoso en redes sociales.' }
  ];

  const colombiaContext = [
    { label: 'Bullying recurrente', value: '23%', desc: 'lo sufre de forma constante en Colombia.' },
    { label: 'Casos Oficiales', value: '+11.000', desc: 'reportes anuales registrados formalmente.' },
    { label: 'Ranking Mundial', value: 'Top 11', desc: 'Colombia está entre los países con más bullying del mundo.' }
  ];

  return (
    <main className="page-internal-standard">
      {/* BOTÓN REGRESO ESTANDARIZADO */}
      <div className="back-button-holder">
        <button onClick={() => navigate('/')} className="back-button-global">
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <div className="page-content-wrapper">
        {/* HERO DATA-DRIVEN */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', color: '#3A6F85', fontWeight: 800, marginBottom: '1.5rem' }}>
            Sala de <span className="highlight" style={{ color: '#8ECFEA' }}>Noticias & Datos</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '850px', margin: '0 auto', lineHeight: '1.7' }}>
            La violencia escolar es una crisis transversal que exige respuestas basadas en inteligencia y datos.
          </p>
        </div>

        {/* NAVEGACIÓN PROFESIONAL */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '2rem', justifyContent: 'center' }}>
          {['global', 'colombia', 'risk', 'norm'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="cta-btn"
              style={{ 
                minWidth: '160px', 
                background: activeTab === tab ? '#3A6F85' : 'white', 
                color: activeTab === tab ? 'white' : '#3A6F85', 
                border: '2px solid #3A6F85',
                borderRadius: '50px', padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              {tab === 'global' ? 'Crisis Global' : tab === 'colombia' ? 'Foco Colombia' : tab === 'risk' ? 'Riesgos' : 'Normatividad'}
            </button>
          ))}
        </div>

        {/* CONTENIDO ACTUALIZADO */}
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px' }}>
          {/* SECCIÓN MUNDO */}
          {activeTab === 'global' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2rem' }}>🌍 Contexto Global</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                {globalStats.map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3A6F85' }}>{stat.value}</div>
                    <h4 style={{ color: '#2A4E5F' }}>{stat.label}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN COLOMBIA */}
          {activeTab === 'colombia' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2rem' }}>🇨🇴 Análisis en Colombia</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {colombiaContext.map((stat, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C53030' }}>{stat.value}</div>
                    <h4 style={{ color: '#2A4E5F' }}>{stat.label}</h4>
                    <p style={{ fontSize: '0.85rem' }}>{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2rem' }}>⚠️ Impacto & Riesgos</h2>
              <div className="glass-panel" style={{ background: '#2D3748', color: 'white', padding: '2.5rem' }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                  El bullying incrementa <strong>18 veces</strong> la probabilidad de depresión severa. PrediVersa aplica analítica predictiva para reducir incidentes hasta en un <strong>67%</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'norm' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2rem' }}>⚖️ Marco Legal</h2>
              <p style={{ lineHeight: '1.7', color: '#555' }}>
                Cumplimiento con la <strong>Ley 1620 de 2013</strong> y el Sistema de Convivencia Escolar (SIUCE), integrando tecnologías para eliminar el subregistro de casos.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer style={{ marginTop: 'auto', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Centro de Inteligencia Institucional.
      </footer>
    </main>
  );
}

export default Noticias;
