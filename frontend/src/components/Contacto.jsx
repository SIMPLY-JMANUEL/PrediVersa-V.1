import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function Contacto() {
  const navigate = useNavigate();

  return (
    <main className="main-responsive-container" style={{ minHeight: '90vh', background: '#f8fafc', padding: '1rem' }}>
      
      {/* BOTÓN REGRESO ESTANDARIZADO */}
      <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} className="back-button-global">
          <span>←</span> Regresar al Inicio
        </button>
      </div>

      <section style={{ maxWidth: '900px', margin: '1rem auto' }}>
        
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ color: '#3A6F85', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Contáctanos</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Estamos aquí para apoyarte en la transformación de tu institución.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            
            {/* FORMULARIO */}
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3A6F85', fontWeight: 600 }}>Nombre Completo</label>
                <input type="text" placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3A6F85', fontWeight: 600 }}>Correo Electrónico</label>
                <input type="email" placeholder="juan@institucion.edu.co" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3A6F85', fontWeight: 600 }}>Mensaje</label>
                <textarea rows="4" placeholder="¿Cómo podemos ayudarte?" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'none' }}></textarea>
              </div>
              <button className="cta-btn" type="button" style={{ width: '100%', padding: '1rem', borderRadius: '50px' }}>
                Enviar Mensaje
              </button>
            </form>

            {/* INFO DE CONTACTO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h4 style={{ color: '#2A4E5F', marginBottom: '0.5rem' }}>📍 Ubicación</h4>
                <p style={{ color: '#64748b' }}>Bogotá D.C., Colombia</p>
              </div>
              <div>
                <h4 style={{ color: '#2A4E5F', marginBottom: '0.5rem' }}>📧 Email Directo</h4>
                <p style={{ color: '#64748b' }}>contacto@prediversa.com</p>
              </div>
              <div>
                <h4 style={{ color: '#2A4E5F', marginBottom: '0.5rem' }}>📞 Teléfono</h4>
                <p style={{ color: '#64748b' }}>+57 320 670 8788</p>
              </div>
              <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(142,207,234,0.1)', borderRadius: '15px' }}>
                <p style={{ color: '#3A6F85', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  "Atención prioritaria para instituciones educativas y entidades de bienestar social."
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

      <footer style={{ marginTop: '5rem', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} PrediVersa • Soporte Técnico & Administrativo.
      </footer>
    </main>
  );
}

export default Contacto;
