import './Main.css'
import fondo2 from '../assets/images/fondo2.png'
import img2 from '../assets/images/img2.png'

function Main() {
  return (
    <main className="main">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Transformamos datos<br />
            <span className="highlight">en prevención</span>
          </h1>
          <p className="tagline">Anticipar hoy para proteger el mañana</p>
          <p>
            PrediVersa es una plataforma tecnológica que analiza información
            institucional para identificar de forma temprana riesgos relacionados con la
            convivencia y el bienestar, permitiendo a las organizaciones tomar
            decisiones informadas y preventivas.
          </p>
          <button className="cta-btn" onClick={() => {
            const el = document.getElementById('quienes-somos');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>Conocer Más</button>
        </div>
        <div className="hero-image">
          <div className="image-circle">
            <img src={fondo2} alt="PrediVersa plataforma" />
          </div>
          <div className="image-circle">
            <img src={img2} alt="PrediVersa plataforma de análisis predictivo" />
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section id="quienes-somos" className="about-section">
        <div className="about-header">
          <h2>Quiénes somos</h2>
          <div className="section-divider"></div>
          <p className="about-subtitle">
            PrediVersa es una plataforma tecnológica especializada en el análisis preventivo
            de información institucional, diseñada para apoyar a instituciones educativas,
            organizaciones y entidades públicas en la identificación temprana de tendencias
            relacionadas con la convivencia, el bienestar y los riesgos psicosociales.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card glass-panel">
            <div className="card-icon">🧠</div>
            <h3>Enfoque Analítico</h3>
            <p>
              Nuestro enfoque combina analítica de datos, visualización de
              información y modelos predictivos para transformar datos institucionales
              en indicadores claros, interpretables y accionables.
            </p>
          </div>
          <div className="about-card glass-panel">
            <div className="card-icon">🤝</div>
            <h3>Colaboración Humana</h3>
            <p>
              PrediVersa no reemplaza la intervención humana; la potencia mediante
              información estructurada que mejora la toma de decisiones.
            </p>
          </div>
        </div>

        <div className="value-proposition">
          <h3>Nuestra Propuesta de Valor</h3>
          <div className="prop-grid">
            <div className="prop-item">
              <span className="prop-icon">🔐</span>
              <span>Protección de datos personales</span>
            </div>
            <div className="prop-item">
              <span className="prop-icon">⚖️</span>
              <span>Cumplimiento normativo colombiano</span>
            </div>
            <div className="prop-item">
              <span className="prop-icon">🤖</span>
              <span>Uso ético de la tecnología</span>
            </div>
            <div className="prop-item">
              <span className="prop-icon">📊</span>
              <span>Enfoque preventivo basado en datos</span>
            </div>
          </div>
        </div>

        <div className="tabs-structured">
          <div className="tab-pane glass-panel">
            <h4>🎯 Misión</h4>
            <p>
              Desarrollar soluciones tecnológicas que permitan a las instituciones
              comprender su entorno social mediante el análisis responsable de
              información, facilitando la toma de decisiones orientadas a la
              prevención y el bienestar institucional.
            </p>
          </div>
          <div className="tab-pane glass-panel">
            <h4>👁️ Visión</h4>
            <p>
              Ser una plataforma tecnológica líder en América Latina en el análisis
              preventivo de información relacionada con la convivencia y el
              bienestar institucional, consolidando un modelo escalable basado
              en datos y ética digital.
            </p>
          </div>
          <div className="tab-pane glass-panel full-width">
            <h4>🏆 Meta del proyecto</h4>
            <p>
              Consolidar una plataforma tecnológica confiable y escalable que
              permita a instituciones educativas y organizaciones identificar
              tendencias de riesgo y mejorar sus procesos de gestión del bienestar
              institucional.
            </p>
          </div>
        </div>

        <div className="objectives-section">
          <div className="general-objective glass-panel">
            <h4>Objetivo General</h4>
            <p>
              Desarrollar e implementar una plataforma tecnológica que permita analizar
              información institucional para identificar tendencias relacionadas con la
              convivencia, el bienestar y los riesgos psicosociales, apoyando la toma
              de decisiones preventivas.
            </p>
          </div>
          <div className="specific-objectives glass-panel">
            <h4>Objetivos Específicos</h4>
            <ul className="obj-list">
              <li>Diseñar un sistema capaz de analizar información relacionada con la convivencia institucional.</li>
              <li>Generar indicadores que permitan identificar patrones y posibles factores de riesgo.</li>
              <li>Desarrollar dashboards y herramientas de visualización para facilitar la interpretación de datos.</li>
              <li>Apoyar la implementación de estrategias de prevención basadas en información analítica.</li>
              <li>Promover el uso responsable y ético de la tecnología en el tratamiento de información sensible.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Main
