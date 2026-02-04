import './Main.css'
import fondo2 from '../assets/images/fondo2.png'
import img2 from '../assets/images/img2.png'

function Main() {
  return (
    <main className="main">
      <section className="hero">
        <div className="hero-content">
          <h1>
            PrediVersa<br />
            <span className="highlight">Predicción inteligente para decisiones seguras</span>
          </h1>
          <p className="tagline">Anticipar hoy para proteger el mañana</p>
          <p>
            PrediVersa es una plataforma de inteligencia artificial que analiza datos y lenguaje
            para <strong>anticipar riesgos</strong>, activar alertas tempranas y apoyar la toma
            de decisiones en instituciones educativas y organizaciones.
          </p>
          <button className="cta-btn">Explorar PrediVersa</button>
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
