import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Contacto() {
  const navigate = useNavigate();

  return (
    <main className="page-internal-standard">
      {/* BOTÓN REGRESO ESTANDARIZADO */}
      <div className="back-button-holder">
        <button onClick={() => navigate('/')} className="back-button-global">
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <div className="page-content-wrapper">
        <section style={{ margin: '1rem auto' }}>
          
          <div className="glass-panel" style={{ padding: '3.5rem', borderRadius: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h1 className="responsive-title" style={{ color: '#3A6F85', fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                Hablemos en <span className="highlight" style={{ color: '#8ECFEA' }}>PrediVersa</span>
              </h1>
              <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Estamos aquí para apoyarte en la transformación de tu institución.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
              
              {/* FORMULARIO */}
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.6rem', color: '#3A6F85', fontWeight: 700 }}>Nombre Completo</label>
                  <input type="text" placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.6rem', color: '#3A6F85', fontWeight: 700 }}>Correo Electrónico</label>
                  <input type="email" placeholder="juan@institucion.edu.co" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.6rem', color: '#3A6F85', fontWeight: 700 }}>Mensaje</label>
                  <textarea rows="5" placeholder="¿Cómo podemos ayudarte?" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'none' }}></textarea>
                </div>
                <button className="cta-btn" type="button" style={{ width: '100%', padding: '1.2rem', borderRadius: '50px' }}>
                  Enviar Mensaje
                </button>
              </form>

              {/* INFO DE CONTACTO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                  <h4 style={{ color: '#2A4E5F', marginBottom: '0.8rem', fontSize: '1.3rem' }}>📍 Ubicación</h4>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Bogotá D.C., Colombia</p>
                </div>
                <div>
                  <h4 style={{ color: '#2A4E5F', marginBottom: '0.8rem', fontSize: '1.3rem' }}>📧 Email Institucional</h4>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>contacto@prediversa.com</p>
                </div>
                <div>
                  <h4 style={{ color: '#2A4E5F', marginBottom: '0.8rem', fontSize: '1.3rem' }}>📞 Teléfono</h4>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>+57 320 670 8788</p>
                </div>
                <div style={{ marginTop: 'auto', padding: '2rem', background: 'rgba(142,207,234,0.1)', borderRadius: '24px' }}>
                  <p style={{ color: '#3A6F85', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.7' }}>
                    "Toda la información es manejada bajo estrictos protocolos de ética y privacidad institucional."
                  </p>
                </div>
              </div>

            </div>
          </div>

        </section>
      </div>

      <footer style={{ marginTop: 'auto', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Centro de Soporte Administrativo.
      </footer>
    </main>
  );
}

export default Contacto;
