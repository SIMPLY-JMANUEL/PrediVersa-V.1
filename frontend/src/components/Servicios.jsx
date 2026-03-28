import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Servicios() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const servicesData = [
    {
      id: 1,
      icon: '📊',
      title: 'Análisis de Información Institucional',
      summary: 'Procesamiento de datos internos para identificar patrones.',
      detail: 'Analizamos profundamente el flujo de datos institucionales para detectar tendencias y posibles factores de riesgo en la convivencia y el bienestar de los integrantes.'
    },
    {
      id: 2,
      icon: '📈',
      title: 'Generación de Indicadores',
      summary: 'Métricas clave para evaluar el clima institucional.',
      detail: 'Construimos indicadores y KPIs específicos que permiten medir de forma objetiva la evolución del bienestar institucional a lo largo del tiempo.'
    },
    {
      id: 3,
      icon: '🖥️',
      title: 'Dashboards Inteligentes',
      summary: 'Paneles interactivos de visualización clara.',
      detail: 'Visualización intuitiva de resultados en tiempo real para orientadores, directivos y equipos de talento humano, optimizando la interpretación estratégica.'
    },
    {
      id: 4,
      icon: '🚨',
      title: 'Alertas Preventivas',
      summary: 'Modelos predictivos para detección temprana.',
      detail: 'Implementamos algoritmos que anticipan situaciones críticas, disparando notificaciones inmediatas ante cualquier señal de riesgo detectada por el sistema.'
    },
    {
      id: 5,
      icon: '📄',
      title: 'Reportes Estratégicos',
      summary: 'Informes estructurados para toma de decisiones.',
      detail: 'Generación automatizada de reportes formales listos para sustentar decisiones estratégicas y cumplir con requisitos de auditoría o seguimiento.'
    },
    {
      id: 6,
      icon: '🎓',
      title: 'Implementación y Capacitación',
      summary: 'Acompañamiento integral en la adopción tecnológica.',
      detail: 'Formamos a los equipos internos en el uso ético y efectivo de PrediVersa, asegurando una transición fluida hacia una cultura institucional basada en datos.'
    }
  ];

  return (
    <main className="main-responsive-container" style={{ minHeight: '100vh', backgroundColor: '#fcfdfe', padding: '1rem' }}>
      
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

      <section className="about-section" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
        
        {/* HERO SERVICIOS */}
        <div className="about-hero" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="responsive-title" style={{ color: '#3A6F85', marginBottom: '1.2rem', fontSize: '3.2rem', fontWeight: 800 }}>
            Nuestros <span className="highlight" style={{ color: '#8ECFEA' }}>Servicios</span> Especializados
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7', padding: '0 1rem' }}>
            Potenciamos el bienestar institucional a través de soluciones tecnológicas integrales basadas en analítica predictiva.
          </p>
        </div>

        {/* GRID DE SERVICIOS (INTERACTIVO) */}
        <div className="about-grid interactive-grid" style={{ marginBottom: '4rem' }}>
          
          {servicesData.map((service) => (
            <div 
              key={service.id}
              onClick={() => toggleCard(service.id)}
              className={`glass-panel interaction-card ${expandedCard === service.id ? 'card-expanded' : ''}`}
              style={{ 
                padding: '2.5rem 1.8rem', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                maxHeight: expandedCard === service.id ? '700px' : '280px',
                border: expandedCard === service.id ? '2px solid #8ECFEA' : '1px solid rgba(255,255,255,0.6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>{service.icon}</div>
              <h3 style={{ color: '#2A4E5F', marginBottom: '1rem', fontSize: '1.4rem', lineHeight: '1.3' }}>{service.title}</h3>
              <p style={{ color: '#666', fontSize: '1rem', marginBottom: '1rem' }}>{service.summary}</p>
              
              {/* DETALLE EXPANDIBLE */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1.5rem', 
                borderTop: '1px solid rgba(0,0,0,0.08)',
                opacity: expandedCard === service.id ? 1 : 0,
                transform: expandedCard === service.id ? 'translateY(0)' : 'translateY(25px)',
                transition: 'all 0.3s ease',
                display: expandedCard === service.id ? 'block' : 'none'
              }}>
                <p style={{ color: '#444', lineHeight: '1.8', fontSize: '1.05rem', textAlign: 'left' }}>{service.detail}</p>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                right: '25px', 
                fontSize: '0.9rem', 
                color: '#8ECFEA', 
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}>
                {expandedCard === service.id ? 'Contraer [-]' : 'Ver detalle [+]'}
              </div>
            </div>
          ))}

        </div>

        {/* CTA FINAL */}
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'linear-gradient(135deg, #f0f8ff, #ffffff)', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <h2 style={{ color: '#3A6F85', marginBottom: '1.5rem' }}>¿Listo para transformar tu institución?</h2>
          <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Únete a las organizaciones que ya están previniendo riesgos hoy mismo.
          </p>
          <button className="cta-btn" onClick={() => navigate('/')} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Solicitar Información
          </button>
        </div>

      </section>
      
      <footer style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', color: '#99b', fontSize: '0.9rem', borderTop: '1px solid #eee' }}>
        © {new Date().getFullYear()} PrediVersa • Líderes en Análisis Institucional.
      </footer>
    </main>
  );
}

export default Servicios;
