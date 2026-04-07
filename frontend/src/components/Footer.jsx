import '../styles/components/Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <h3>PrediVersa</h3>
        <p>Predicción inteligente para entornos seguros y decisiones confiables.</p>
      </div>

      <div className="footer-contact">
        <p><strong>Email:</strong> prediversa.v1@gmail.com</p>
        <p><strong>Teléfono:</strong> +57 300 000 0000</p>

        <div className="footer-social">
          <a href="#" aria-label="Instagram">Instagram</a>
          <a href="#" aria-label="Facebook">Facebook</a>
        </div>
      </div>

      <div className="footer-copy">
        <p>© 2026 PrediVersa. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
