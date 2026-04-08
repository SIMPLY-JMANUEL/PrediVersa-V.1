import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Servicios() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const toggleService = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const servicesData = [
    {
      id: 1,
      name: 'Análisis de Información Institucional',
      desc: 'Procesamiento de datos internos para identificar patrones, tendencias y posibles factores de riesgo en convivencia y bienestar.',
      detail: 'Utilizamos algoritmos avanzados para cruzar variables académicas, disciplinarias y de salud mental, generando un mapa térmico de riesgos en tiempo real para la toma de decisiones informada.'
    },
    {
      id: 2,
      name: 'Generación de Indicadores (KPIs)',
      desc: 'Construcción de métricas clave que permiten evaluar el estado del clima institucional y su evolución en el tiempo.',
      detail: 'Definimos indicadores de gestión de convivencia que ayudan a las directivas a medir el impacto de sus estrategias preventivas y el bienestar general de la comunidad educativa.'
    },
    {
      id: 3,
      name: 'Dashboards Inteligentes',
      desc: 'Visualización de datos en paneles interactivos para facilitar la interpretación por parte de directivos y orientadores.',
      detail: 'Paneles visuales que muestran de forma clara y accesible el estado de convivencia, permitiendo filtrar información por grupos, grados o periodos específicos de tiempo.'
    },
    {
      id: 4,
      name: 'Alertas Preventivas',
      desc: 'Detección temprana de posibles situaciones de riesgo mediante modelos de análisis predictivo.',
      detail: 'El sistema notifica automáticamente a los responsables cuando se detecta un comportamiento o patrón que sugiere una escalada de riesgo en la convivencia escolar.'
    },
    {
      id: 5,
      name: 'Reportes Estratégicos',
      desc: 'Generación de informes estructurados para apoyar la toma de decisiones institucionales.',
      detail: 'Informes ejecutivos listos para presentar ante consejos directivos o comités de convivencia, con data sólida y recomendaciones basadas en el análisis sistémico.'
    },
    {
      id: 6,
      name: 'Implementación y Capacitación',
      desc: 'Acompañamiento en la adopción de la plataforma y formación de usuarios clave.',
      detail: 'Aseguramos que el talento humano de la institución domine la herramienta y sepa interpretar los resultados para una gestión eficiente y humana.'
    }
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
        <section className="about-section">
          
          <div className="about-hero" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="responsive-title" style={{ color: '#3A6F85', marginBottom: '1rem', fontWeight: 800 }}>
              Nuestros <span className="highlight" style={{ color: '#8ECFEA' }}>Servicios</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
              Soluciones integrales para la gestión moderna de la convivencia y el bienestar escolar.
            </p>
          </div>

          <div className="about-grid">
            {servicesData.map((service) => (
              <div 
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`glass-panel interaction-card ${expandedId === service.id ? 'card-expanded' : ''}`}
                style={{ 
                  padding: '2rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.4s ease',
                  maxHeight: expandedId === service.id ? '500px' : '230px',
                  border: expandedId === service.id ? '2px solid #8ECFEA' : '1px solid rgba(255,255,255,0.5)'
                }}
              >
                <div style={{ color: '#8ECFEA', fontWeight: 700, marginBottom: '0.8rem', fontSize: '1rem' }}>Servicio 0{service.id}</div>
                <h3 style={{ color: '#2A4E5F', marginBottom: '1rem', fontSize: '1.3rem' }}>{service.name}</h3>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>{service.desc}</p>
                
                <div style={{ 
                  marginTop: '1.5rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #eee',
                  display: expandedId === service.id ? 'block' : 'none'
                }}>
                  <p style={{ color: '#444', lineHeight: '1.6' }}>{service.detail}</p>
                </div>

                <div style={{ position: 'absolute', bottom: '15px', right: '20px', color: '#8ECFEA', fontSize: '0.8rem', fontWeight: 600 }}>
                  {expandedId === service.id ? 'Ver menos' : 'Conocer más'}
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>

      <footer style={{ marginTop: 'auto', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Soluciones que transforman realidades.
      </footer>
    </main>
  );
}

export default Servicios;
