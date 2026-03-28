import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Planes() {
  const navigate = useNavigate();

  const planes = [
    {
      name: 'Básico / Semilla',
      price: 'Consultar',
      features: [
        'Análisis de datos base',
        'Hasta 500 estudiantes',
        'Dashboard estándar',
        'Reportes mensuales',
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
        'Alertas SMS/Email 24/7',
        'Dashboard interactivo Pro',
        'Capacitación de equipo',
        'Soporte Prioritario'
      ],
      recommended: true
    },
    {
      name: 'Gubernamental / Élite',
      price: 'Personalizado',
      features: [
        'Múltiples sedes/colegios',
        'Integración API SIUCE',
        'Modelos IA personalizados',
        'Consultoría estratégica',
        'Analítica de big data',
        'Gerente de cuenta dedicado'
      ],
      recommended: false
    }
  ];

  return (
    <main className="main-responsive-container" style={{ minHeight: '90vh', background: '#f8fafc', padding: '1rem' }}>
      
      {/* BOTÓN REGRESO ESTANDARIZADO */}
      <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} className="back-button-global">
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <section style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', color: '#3A6F85', fontWeight: 800, marginBottom: '1rem' }}>
            Planes de <span className="highlight" style={{ color: '#8ECFEA' }}>Prevención</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Escoge la solución que mejor se adapte al tamaño y necesidades de tu institución.
          </p>
        </div>

        {/* GRID DE PLANES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {planes.map((plan, index) => (
            <div 
              key={index} 
              className="glass-panel" 
              style={{ 
                padding: '3rem 2rem', 
                position: 'relative', 
                border: plan.recommended ? '2px solid #8ECFEA' : '1px solid rgba(255,255,255,0.5)',
                transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
                zIndex: plan.recommended ? 2 : 1,
                boxShadow: plan.recommended ? '0 20px 40px rgba(142,207,234,0.2)' : 'none'
              }}
            >
              {plan.recommended && (
                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#8ECFEA', color: 'white', padding: '5px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>
                  RECOMENDADO
                </div>
              )}
              <h3 style={{ color: '#2A4E5F', fontSize: '1.5rem', marginBottom: '1rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '1.2rem', color: '#3A6F85', fontWeight: 700, marginBottom: '2rem' }}>{plan.price}</div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', textAlign: 'left' }}>
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} style={{ padding: '0.8rem 0', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: '0.95rem', display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#8ECFEA' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button className="cta-btn" style={{ width: '100%', borderRadius: '50px', padding: '1rem' }}>
                Solicitar Cotización
              </button>
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(58,111,133,0.05)', border: 'none' }}>
          <p style={{ color: '#3A6F85', fontWeight: 600 }}>¿Necesitas una solución a medida?</p>
          <button style={{ background: 'none', border: 'none', color: '#8ECFEA', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }} onClick={() => navigate('/')}>
            Contacta con un asesor especializado →
          </button>
        </div>

      </section>

      <footer style={{ marginTop: '5rem', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Precios corporativos e institucionales.
      </footer>
    </main>
  );
}

export default Planes;
