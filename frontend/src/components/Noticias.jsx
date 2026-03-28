import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Noticias() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const newsItems = [
    {
      id: 1,
      source: 'El País',
      title: 'Familiares de víctimas exigen ley contra el bullying',
      date: '6 Nov 2025',
      summary: 'Ante el Congreso, exigen protección real: "¿Cuántos niños tienen que morir?"',
      detail: 'Las familias denuncian la falta de protocolos efectivos y demandan una legislación nacional que obligue a los colegios a reportar y prevenir activamente el acoso escolar.'
    },
    {
      id: 2,
      source: 'Cadena SER',
      title: 'Importancia de la prevención en el Día contra el Acoso',
      date: '6 Nov 2025',
      summary: 'Expertos de APIR remarcan el rol de la detección temprana.',
      detail: 'En el marco del Día Internacional contra la Violencia y el Acoso Escolar, se recalca que el 90% de los casos severos podrían evitarse con sistemas de monitoreo continuo.'
    },
    {
      id: 3,
      source: 'Cadena SER',
      title: 'Las llamadas de auxilio se multiplican por 50',
      date: '15 Nov 2025',
      summary: 'Impacto tras el suicidio de Sandra Peña genera alerta nacional.',
      detail: 'El caso ha disparado las denuncias de familias que antes guardaban silencio, evidenciando una crisis de salud mental que requiere intervención tecnológica urgente.'
    },
    {
      id: 4,
      source: 'El País',
      title: 'Colombia: País con más ataques a colegios en América',
      date: '27 Nov 2025',
      summary: 'Reporte internacional sitúa a Colombia en una situación crítica.',
      detail: 'La inseguridad en los entornos escolares y el aumento de la violencia interna reflejan la vulnerabilidad extrema de los estudiantes en el contexto actual colombiano.'
    }
  ];

  const analysisSections = [
    {
      id: 'a1',
      title: '📈 Violencia escolar en Colombia (2025)',
      content: 'En 2025 se registró un incremento significativo. Solo en Bogotá, las agresiones físicas aumentaron un 51%, alcanzando más de 5.800 incidentes. El 23% de los estudiantes nacionales reporta ser víctima de acoso sistemático.',
      footer: 'Esto evidencia la necesidad crítica de sistemas como PrediVersa para la detección temprana.'
    },
    {
      id: 'a2',
      title: '🌍 Tendencias Globales de Prevención',
      content: 'A nivel internacional, la prevención es prioridad. Programas estructurados han logrado reducir el acoso en un 67% general y un 95% en casos severos. La tendencia apunta a pasar de modelos reactivos a modelos predictivos basados en datos.',
      footer: 'El enfoque actual integra analítica de datos y participación estudiantil activa.'
    },
    {
      id: 'a3',
      title: '⚖️ Normatividad y el rol de SIUCE',
      content: 'La Ley 1620 de 2013 crea el Sistema Nacional de Convivencia Escolar. El sistema SIUCE permite monitorear casos, pero enfrenta desafíos como el subregistro y la detección tardía.',
      footer: 'PrediVersa actúa como la solución tecnológica complementaria para cerrar la brecha de detección.'
    }
  ];

  return (
    <main className="main-responsive-container" style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', padding: '1rem' }}>
      
      {/* BOTÓN REGRESO */}
      <div className="back-button-container" style={{ position: 'sticky', top: '20px', left: '20px', zIndex: 100 }}>
        <button 
          onClick={() => navigate('/')}
          className="cta-btn back-btn"
          style={{ 
            background: 'white', 
            color: '#3A6F85', 
            border: '2px solid #8ECFEA', 
            boxShadow: '0 4px 12px rgba(142,207,234,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '50px',
            padding: '0.6rem 1.2rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <section className="about-section" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '2rem 0' }}>
        
        <div className="about-hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="responsive-title" style={{ color: '#3A6F85', marginBottom: '1rem', fontWeight: 800 }}>
            Sala de <span className="highlight" style={{ color: '#8ECFEA' }}>Noticias & Análisis</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
            Mantente informado sobre la situación de convivencia escolar y los avances en tecnologías preventivas.
          </p>
        </div>

        {/* NOTICIAS FLASH */}
        <h2 style={{ color: '#2A4E5F', marginBottom: '1.5rem', fontSize: '1.8rem', paddingLeft: '10px', borderLeft: '5px solid #8ECFEA' }}>Noticias de Actualidad</h2>
        <div className="about-grid" style={{ marginBottom: '4rem' }}>
          {newsItems.map(item => (
            <div 
              key={item.id}
              onClick={() => toggleSection(item.id)}
              className={`glass-panel interaction-card ${expandedSection === item.id ? 'card-expanded' : ''}`}
              style={{ 
                padding: '2rem', 
                cursor: 'pointer', 
                maxHeight: expandedSection === item.id ? '500px' : '240px',
                transition: 'all 0.4s ease',
                border: expandedSection === item.id ? '2px solid #8ECFEA' : '1px solid rgba(255,255,255,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8ECFEA', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                <span>{item.source}</span>
                <span>{item.date}</span>
              </div>
              <h3 style={{ color: '#3A6F85', marginBottom: '0.8rem', fontSize: '1.2rem', lineHeight: '1.4' }}>{item.title}</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>{item.summary}</p>
              
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid #eee',
                display: expandedSection === item.id ? 'block' : 'none'
              }}>
                <p style={{ color: '#444', lineHeight: '1.6' }}>{item.detail}</p>
              </div>

              <div style={{ position: 'absolute', bottom: '15px', right: '20px', color: '#8ECFEA', fontSize: '0.8rem' }}>
                {expandedSection === item.id ? 'Ver menos' : 'Leer más'}
              </div>
            </div>
          ))}
        </div>

        {/* ANÁLISIS PROFUNDO */}
        <h2 style={{ color: '#2A4E5F', marginBottom: '1.5rem', fontSize: '1.8rem', paddingLeft: '10px', borderLeft: '5px solid #8ECFEA' }}>Análisis & Tendencias</h2>
        <div className="analysis-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
          {analysisSections.map(section => (
            <div 
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`glass-panel interaction-card ${expandedSection === section.id ? 'card-expanded' : ''}`}
              style={{ 
                padding: '2.5rem', 
                cursor: 'pointer',
                textAlign: 'left',
                maxHeight: expandedSection === section.id ? '600px' : '130px',
                overflow: 'hidden',
                transition: 'all 0.3s'
              }}
            >
              <h3 style={{ color: '#2A4E5F', marginBottom: '1rem' }}>{section.title}</h3>
              <div style={{ display: expandedSection === section.id ? 'block' : 'none' }}>
                <p style={{ color: '#555', lineHeight: '1.8', marginBottom: '1rem', fontSize: '1.1rem' }}>{section.content}</p>
                <div style={{ background: 'rgba(142,207,234,0.1)', padding: '1rem', borderRadius: '10px', color: '#3A6F85', fontWeight: 600 }}>
                  👉 {section.footer}
                </div>
              </div>
              {expandedSection !== section.id && <p style={{ color: '#aaa' }}>Haz clic para profundizar el análisis...</p>}
            </div>
          ))}
        </div>

        {/* ENLACES RELEVANTES */}
        <div className="value-proposition" style={{ padding: '3rem', borderRadius: '25px' }}>
          <h3 style={{ marginBottom: '2rem', color: '#fff' }}>🔗 Recursos & Enlaces Oficiales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <a href="http://siuce.mineducacion.gov.co/siuce-angular2/" target="_blank" rel="noreferrer" className="glass-panel" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              <h4>Sistema SIUCE (Mineducación)</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Monitoreo nacional de convivencia escolar en Colombia.</p>
            </a>
            <a href="https://www.colombiaaprende.edu.co" target="_blank" rel="noreferrer" className="glass-panel" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              <h4>Colombia Aprende</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Portal con recursos pedagógicos de prevención oficial.</p>
            </a>
          </div>
        </div>

      </section>

      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', color: '#99b', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Centro de Información Preventiva.
      </footer>
    </main>
  );
}

export default Noticias;
