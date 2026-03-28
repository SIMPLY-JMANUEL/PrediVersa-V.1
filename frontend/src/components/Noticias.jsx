import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

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
    <main className="main-responsive-container" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem' }}>
      
      {/* BOTÓN REGRESO ESTANDARIZADO */}
      <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} className="back-button-global">
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* HERO DATA-DRIVEN */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', color: '#3A6F85', fontWeight: 800, marginBottom: '1.5rem' }}>
            Contexto <span className="highlight" style={{ color: '#8ECFEA' }}>Global & Nacional</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '850px', margin: '0 auto', lineHeight: '1.7' }}>
            La violencia escolar no es un fenómeno aislado; es una <strong>crisis global de salud pública</strong> que exige una respuesta tecnológica y humana sin precedentes.
          </p>
        </div>

        {/* NAVEGACIÓN DE ANÁLISIS PROFESIONAL */}
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
                borderRadius: '50px',
                padding: '0.8rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {tab === 'global' ? 'Crisis Global' : tab === 'colombia' ? 'Foco Colombia' : tab === 'risk' ? 'Riesgos & Impacto' : 'Normatividad'}
            </button>
          ))}
        </div>

        {/* CONTENIDO ACTUALIZADO */}
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px', minHeight: '500px' }}>
          
          {/* SECCIÓN MUNDO */}
          {activeTab === 'global' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🌍 La violencia estructural en el mundo
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {globalStats.map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid #e2e8f0' : 'none' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3A6F85' }}>{stat.value}</div>
                    <h4 style={{ color: '#2A4E5F', margin: '0.5rem 0' }}>{stat.label}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{stat.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f0f9ff', padding: '2rem', borderRadius: '18px', borderLeft: '8px solid #8ECFEA' }}>
                <h4 style={{ color: '#3A6F85', display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Insight Clave:</h4>
                <p style={{ margin: '0.8rem 0 0 0', fontStyle: 'italic', color: '#1e293b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  "La violencia escolar ya no es solo física: se ha desplazado hacia lo digital, siendo persistente, invisible y extremadamente difícil de detectar por métodos tradicionales."
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN COLOMBIA */}
          {activeTab === 'colombia' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '1rem' }}>🇨🇴 Colombia: Un Foco Crítico</h2>
              <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                Colombia se sitúa entre los <strong>11 países con mayor prevalencia de bullying</strong> en el mundo. La subnotificación oculta una realidad aún más severa.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {colombiaContext.map((stat, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '2rem', background: '#f8fafc' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C53030', marginBottom: '0.5rem' }}>{stat.value}</div>
                    <h4 style={{ color: '#2A4E5F', marginBottom: '0.5rem' }}>{stat.label}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff5f5', padding: '2rem', borderRadius: '18px', border: '1px solid #feb2b2' }}>
                <h4 style={{ color: '#C53030' }}>📈 Tendencias Recientes (Bogotá):</h4>
                <p style={{ marginTop: '0.5rem', color: '#9B2C2C', fontSize: '1.1rem' }}>
                  Aumento del <strong>51%</strong> en incidentes violentos en solo un año. Más de 5.800 agresiones físicas registradas en la capital.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN RIESGOS */}
          {activeTab === 'risk' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2.5rem' }}>⚠️ Factores de Riesgo e Impacto Psicológico</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '20px' }}>
                  <h4 style={{ color: '#3A6F85', marginBottom: '1.5rem' }}>Poblaciones de Alto Riesgo:</h4>
                  <ul style={{ color: '#4A5568', lineHeight: '2.2' }}>
                    <li><b>Diversidad:</b> 82% de niños con discapacidad sufren acoso.</li>
                    <li><b>Ciclo Crítico:</b> Transición entre grados 6° y 8°.</li>
                    <li><b>Brecha de Género:</b> El ciberacoso afecta desproporcionadamente a mujeres.</li>
                  </ul>
                </div>
                <div style={{ padding: '2rem', background: '#2D3748', color: 'white', borderRadius: '20px' }}>
                  <h4 style={{ color: '#8ECFEA', marginBottom: '1.5rem' }}>Efectos Estructurales:</h4>
                  <p style={{ opacity: 0.9, lineHeight: '1.6' }}>
                    El bullying incrementa <strong>18 veces</strong> la probabilidad de trastornos de ansiedad y depresión severa, vinculándose directamente con la deserción escolar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN NORMATIVIDAD */}
          {activeTab === 'norm' && (
            <div className="fade-in">
              <h2 style={{ color: '#2A4E5F', marginBottom: '2rem' }}>⚖️ Marco Normativo y Futuro Predictivo</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#3A6F85' }}>Ley 1620 de 2013</h4>
                  <p style={{ color: '#64748b', marginTop: '1rem', lineHeight: '1.7' }}>
                    Crea el Sistema Nacional de Convivencia Escolar para prevención y seguimiento. Sin embargo, la falta de analítica predictiva sigue siendo el eslabón débil.
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#3A6F85' }}>Hacia lo Predictivo</h4>
                  <p style={{ color: '#64748b', marginTop: '1rem', lineHeight: '1.7' }}>
                    La tendencia global migra hacia la Inteligencia Artificial y el monitoreo continuo de datos para reducir incidentes hasta en un <strong>67%</strong>.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(142,207,234,0.1)', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ color: '#2A4E5F', fontWeight: 600 }}>
                  PrediVersa alinea la normatividad con la tecnología para una intervención en tiempo real.
                </p>
              </div>
            </div>
          )}

        </div>

      </section>

      <footer style={{ marginTop: '5rem', textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Centro de Analítica e Inteligencia Institucional.
      </footer>
    </main>
  );
}

export default Noticias;
