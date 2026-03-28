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
    </main>
  )
}

export default Main
