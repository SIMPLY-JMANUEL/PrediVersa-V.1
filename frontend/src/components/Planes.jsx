import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Planes() {
  const navigate = useNavigate();

  const planes = [
    {
      name: 'Semilla / Básico',
      price: 'Consultar',
      features: [
        'Análisis de datos base',
        'Hasta 500 estudiantes',
        'Dashboard estándar',
        'Soporte por email'
      ],
      recommended: false
    },
    {
      name: 'Institucional Pro',
      price: 'Más Popular',
      features: [
        'IA Predictiva Versa 2.0',
        'Estudiantes ilimitados',
        'Alertas Críticas 24/7',
        'Dashboard Interactivo Pro',
        'Soporte Prioritario'
      ],
      recommended: true
    },
    {
      name: 'Élite / Gubernamental',
      price: 'Personalizado',
      features: [
        'Múltiples sedes/colegios',
        'Integración API SIUCE',
        'Modelos IA personalizados',
        'Consultoría estratégica',
        'Gerente dedicado'
      ],
      recommended: false
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
        <section style={{ textAlign: 'center' }}>
          
          <div style={{ marginBottom: '4rem' }}>
            <h1 className="responsive-title" style={{ fontSize: '3rem', color: '#3A6F85', fontWeight: 800, marginBottom: '1rem' }}>
              Planes de <span className="highlight" style={{ color: '#8ECFEA' }}>Prevención</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
              Escoge la solución que mejor se adapte a las necesidades de tu institución.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
            {planes.map((plan, index) => (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  padding: '3rem 2rem', 
                  position: 'relative', 
                  border: plan.recommended ? '2px solid #8ECFEA' : '1px solid rgba(255,255,255,0.5)',
                  transform: plan.recommended ? 'scale(1.05)' : 'none',
                  boxShadow: plan.recommended ? '0 20px 40px rgba(142,207,234,0.2)' : 'none'
                }}
              >
                {plan.recommended && (
                  <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#8ECFEA', color: 'white', padding: '5px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>
                    RECOMENDADO
                  </div>
                )}
                <h3 style={{ color: '#2A4E5F', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{plan.name}</h3>
                <div style={{ fontSize: '1.2rem', color: '#3A6F85', fontWeight: 700, marginBottom: '2.5rem' }}>{plan.price}</div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', textAlign: 'left' }}>
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} style={{ padding: '0.8rem 0', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: '1rem', display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#8ECFEA', fontWeight: 800 }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>

                <button className="cta-btn" style={{ width: '100%', borderRadius: '50px', padding: '1.1rem' }}>
                  Pedir Información
                </button>
              </div>
            ))}
          </div>

        </section>
      </div>

      <footer style={{ marginTop: 'auto', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Precios Institucionales 2026.
      </footer>
    </main>
  );
}

export default Planes;
