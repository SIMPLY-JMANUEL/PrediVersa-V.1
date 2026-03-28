import React from 'react';
import './Main.css';

function QuienesSomos() {
  return (
    <main className="main" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      <section className="about-section" style={{ width: '100%', maxWidth: '1000px', padding: '2rem 1rem' }}>
        
        {/* HERO COMPACTO */}
        <div style={{ textAlign: 'center', margin: '0 0 3rem 0' }}>
          <h1 style={{ fontSize: '3.2rem', color: '#3A6F85', marginBottom: '0.8rem', fontWeight: 800 }}>
            Transformamos datos en <span className="highlight" style={{ color: '#8ECFEA' }}>prevención</span>.
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Plataforma tecnológica líder en análisis preventivo. Identificamos tempranamente tendencias de convivencia y bienestar para que las instituciones tomen decisiones informadas y eviten riesgos psicosociales.
          </p>
        </div>

        {/* VALORES (GRID COMPACTO) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🧠</div>
            <h3 style={{ color: '#2A4E5F', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Enfoque Analítico</h3>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Convertimos datos institucionales crudos en indicadores claros e interpretables a través de modelos predictivos.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>💎</div>
            <h3 style={{ color: '#2A4E5F', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Ética & Privacidad</h3>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Cumplimiento normativo estricto y anonimización de datos. Usamos la tecnología para proteger, no para invadir.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🤝</div>
            <h3 style={{ color: '#2A4E5F', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Poder Humano</h3>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
              La IA no reemplaza; <b>potencia</b>. Entregamos las herramientas para que tu equipo actúe con mayor rapidez y precisión.
            </p>
          </div>

        </div>

        {/* ADN CORPORATIVO (MISIÓN/VISIÓN CONDENSADA) */}
        <div className="value-proposition" style={{ padding: '2.5rem', margin: '0', borderRadius: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            
            <div>
              <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.8rem', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Nuestra Misión</h4>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Desarrollar soluciones tecnológicas que permitan el análisis responsable de información escolar o corporativa, facilitando decisiones orientadas estrictamente a la prevención y el bienestar humano.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.8rem', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Objetivos Principales</h4>
              <ul style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: '1.6', paddingLeft: '1.2rem', margin: 0 }}>
                <li>Identificar patrones y factores de riesgo.</li>
                <li>Generar dashboards de decisión temprana.</li>
                <li>Apoyar estrategias de bienestar institucional confiables.</li>
              </ul>
            </div>

          </div>
        </div>

      </section>
    </main>
  );
}

export default QuienesSomos;
