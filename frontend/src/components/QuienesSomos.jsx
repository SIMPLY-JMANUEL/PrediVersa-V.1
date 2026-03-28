import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function QuienesSomos() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const cardsData = [
    {
      id: 1,
      icon: '🧠',
      title: 'Enfoque Analítico',
      summary: 'Análisis profundo de datos institucionales.',
      detail: 'Convertimos datos institucionales crudos en indicadores claros e interpretables a través de modelos predictivos que detectan patrones invisibles al ojo humano, permitiendo una intervención oportuna y basada en evidencia.'
    },
    {
      id: 2,
      icon: '💎',
      title: 'Ética & Privacidad',
      summary: 'Seguridad y anonimato garantizado.',
      detail: 'Garantizamos el cumplimiento normativo estricto y la anonimización de datos sensibles. En PrediVersa, usamos la tecnología para proteger la integridad y el bienestar del individuo, nunca para invadir su privacidad.'
    },
    {
      id: 3,
      icon: '🤝',
      title: 'Poder Humano',
      summary: 'La tecnología potencia al equipo.',
      detail: 'Nuestra inteligencia artificial no reemplaza la labor del profesional escolar; la potencia. Entregamos las herramientas y reportes necesarios para que el equipo orientador actúe con mayor rapidez, precisión y confianza.'
    }
  ];

  return (
    <main className="main" style={{ minHeight: '90vh', backgroundColor: '#f9fbfd' }}>
      
      {/* BOTÓN REGRESO */}
      <div style={{ position: 'sticky', top: '20px', left: '20px', zIndex: 100, padding: '10px' }}>
        <button 
          onClick={() => navigate('/')}
          className="cta-btn"
          style={{ 
            background: 'white', 
            color: '#3A6F85', 
            border: '2px solid #8ECFEA', 
            boxShadow: '0 4px 12px rgba(142,207,234,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <section className="about-section" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
        
        {/* HERO COMPACTO */}
        <div style={{ textAlign: 'center', margin: '3rem 0' }}>
          <h1 style={{ fontSize: '3rem', color: '#3A6F85', marginBottom: '1rem', fontWeight: 800 }}>
            Transformamos datos en <span className="highlight" style={{ color: '#8ECFEA' }}>prevención</span>.
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            Explora los pilares de nuestra metodología. Haz clic en las tarjetas para descubrir nuestra esencia técnica y humana.
          </p>
        </div>

        {/* VALORES (GRID INTERACTIVO) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          
          {cardsData.map((card) => (
            <div 
              key={card.id}
              onClick={() => toggleCard(card.id)}
              className={`glass-panel ${expandedCard === card.id ? 'card-expanded' : ''}`}
              style={{ 
                padding: '2rem', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                maxHeight: expandedCard === card.id ? '500px' : '220px'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{card.icon}</div>
              <h3 style={{ color: '#2A4E5F', marginBottom: '0.5rem', fontSize: '1.4rem' }}>{card.title}</h3>
              <p style={{ color: '#666', fontSize: '1rem', transition: 'opacity 0.3s' }}>{card.summary}</p>
              
              {/* DETALLE EXPANDIBLE */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid rgba(0,0,0,0.05)',
                opacity: expandedCard === card.id ? 1 : 0,
                transform: expandedCard === card.id ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s ease'
              }}>
                <p style={{ color: '#444', lineHeight: '1.6', fontSize: '0.95rem' }}>{card.detail}</p>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                right: '20px', 
                fontSize: '0.8rem', 
                color: '#8ECFEA', 
                fontWeight: 600 
              }}>
                {expandedCard === card.id ? 'Cerrar [-]' : 'Ver más [+]'}
              </div>
            </div>
          ))}

        </div>

        {/*ADN CORPORATIVO */}
        <div className="value-proposition" style={{ padding: '3rem', borderRadius: '25px', boxShadow: '0 20px 40px rgba(42,78,95,0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span> Nuestra Misión
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8' }}>
                Desarrollar soluciones tecnológicas que permitan el análisis responsable de información institucional, facilitando la toma de decisiones estratégicas orientadas estrictamente a la prevención efectiva y el bienestar sustancial del entorno escolar y corporativo.
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>📊</span> Retos & Objetivos
              </h4>
              <ul style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.9', paddingLeft: '1.5rem' }}>
                <li>Identificar patrones críticos de riesgo en tiempo real.</li>
                <li>Generar visualizaciones de datos interpretables.</li>
                <li>Garantizar la seguridad ética del tratamiento digital.</li>
                <li>Optimizar la respuesta de los equipos de convivencia.</li>
              </ul>
            </div>

          </div>
        </div>

      </section>
      
      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '0.9rem' }}>
        © 2026 PrediVersa - Tecnología para un entorno seguro.
      </footer>
    </main>
  );
}

export default QuienesSomos;
