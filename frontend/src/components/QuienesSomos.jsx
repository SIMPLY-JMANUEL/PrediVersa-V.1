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
    <main className="main-responsive-container" style={{ minHeight: '100vh', backgroundColor: '#f9fbfd', padding: '1rem' }}>
      
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
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <section className="about-section" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '2rem 0' }}>
        
        {/* HERO COMPACTO */}
        <div className="about-hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="responsive-title" style={{ color: '#3A6F85', marginBottom: '1rem', fontWeight: 800 }}>
            Transformamos datos en <span className="highlight" style={{ color: '#8ECFEA' }}>prevención</span>.
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6', padding: '0 1rem' }}>
            Explora los pilares de la metodología PrediVersa. Diseñado para la seguridad y bienestar institucional.
          </p>
        </div>

        {/* VALORES (GRID INTERACTIVO) */}
        <div className="about-grid interactive-grid" style={{ marginBottom: '4rem' }}>
          
          {cardsData.map((card) => (
            <div 
              key={card.id}
              onClick={() => toggleCard(card.id)}
              className={`glass-panel interaction-card ${expandedCard === card.id ? 'card-expanded' : ''}`}
              style={{ 
                padding: '2rem', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                maxHeight: expandedCard === card.id ? '600px' : '230px',
                border: expandedCard === card.id ? '2px solid #8ECFEA' : '1px solid rgba(255,255,255,0.5)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{card.icon}</div>
              <h3 style={{ color: '#2A4E5F', marginBottom: '0.8rem', fontSize: '1.4rem' }}>{card.title}</h3>
              <p style={{ color: '#666', fontSize: '1rem' }}>{card.summary}</p>
              
              {/* DETALLE EXPANDIBLE */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid rgba(0,0,0,0.05)',
                opacity: expandedCard === card.id ? 1 : 0,
                transform: expandedCard === card.id ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s ease',
                display: expandedCard === card.id ? 'block' : 'none'
              }}>
                <p style={{ color: '#444', lineHeight: '1.7', fontSize: '1rem' }}>{card.detail}</p>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                right: '25px', 
                fontSize: '0.85rem', 
                color: '#8ECFEA', 
                fontWeight: 600 
              }}>
                {expandedCard === card.id ? 'Cerrar [-]' : 'Saber más [+]'}
              </div>
            </div>
          ))}

        </div>

        {/* ADN CORPORATIVO REFRESCADO */}
        <div className="value-proposition responsive-adn" style={{ padding: '3rem 2rem', borderRadius: '30px' }}>
          <div className="adn-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '1.2rem', fontWeight: 700 }}>
                🎯 Nuestra Misión
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.95)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                Codificamos soluciones tecnológicas innovadoras para el análisis preventivo, facilitando entornos seguros y decisiones ágiles basadas en la ética digital.
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '1.2rem', fontWeight: 700 }}>
                📊 Objetivos Estratégicos
              </h4>
              <ul style={{ color: 'rgba(255,255,255,0.95)', lineHeight: '2', paddingLeft: '1.5rem', fontSize: '1rem' }}>
                <li>Predicción de riesgos en tiempo real.</li>
                <li>Visualización de datos interpretables.</li>
                <li>Tratamiento ético de la información.</li>
                <li>Fortalecimiento del bienestar institucional.</li>
              </ul>
            </div>

          </div>
        </div>

      </section>
      
      <footer style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', color: '#99b', fontSize: '0.9rem', borderTop: '1px solid #eee' }}>
        © {new Date().getFullYear()} PrediVersa • Inteligencia para la Convivencia.
      </footer>
    </main>
  );
}

export default QuienesSomos;
