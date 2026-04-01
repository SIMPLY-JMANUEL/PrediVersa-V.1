import { useState } from 'react';
import { ShieldAlert, Info, UploadCloud, CheckCircle2 } from 'lucide-react';
import './DenunciaFacil.css';

import { apiFetch, API_CHATBOT as API } from '../utils/api'; // FIX A-1: Usar utilitario centralizado

export default function DenunciaFacil({ user }) {
  const [anonimo, setAnonimo] = useState(false);
  const [tipoViolencia, setTipoViolencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaHecho, setFechaHecho] = useState('');
  const [lugar, setLugar] = useState('');
  const [involucrados, setInvolucrados] = useState('');
  
  // Datos de contacto
  const [nombreContacto, setNombreContacto] = useState(user?.name || '');
  const [emailContacto, setEmailContacto] = useState(user?.email || '');
  const [telefonoContacto, setTelefonoContacto] = useState(user?.phone || '');

  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tipoViolencia || !descripcion) {
      alert('El tipo de denuncia y la descripción son obligatorios.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(`${API}/denuncia`, {
        method: 'POST',
        body: JSON.stringify({
          estudiante_id: user?.documentId || user?.id || 'anonimo',
          anonimo,
          tipo_violencia: tipoViolencia,
          descripcion,
          fecha_hecho: fechaHecho,
          lugar,
          involucrados,
          nombre_contacto: anonimo ? '' : nombreContacto,
          email_contacto: anonimo ? '' : emailContacto,
          telefono_contacto: anonimo ? '' : telefonoContacto
        })
      });

      const data = response;
      
      if (data.success) {
        setSuccessTicket(data.ticket);
      } else {
        alert(data.message || 'Error al enviar denuncia');
      }
    } catch (error) {
      console.error('Error enviando denuncia:', error);
      alert('Error de conexión al enviar');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessTicket(null);
    setTipoViolencia('');
    setDescripcion('');
    setFechaHecho('');
    setLugar('');
    setInvolucrados('');
    setAnonimo(false);
  };

  if (successTicket) {
    return (
      <div className="df-success-card animate-fade-in">
        <CheckCircle2 size={60} color="#10b981" className="df-success-icon" />
        <h2>¡Denuncia Enviada con Éxito!</h2>
        <p>Tu reporte ha sido registrado de manera segura en el sistema.</p>
        <div className="df-ticket-box">
          <span>Número de Radicado:</span>
          <strong>{successTicket}</strong>
        </div>
        <p className="df-success-note">Un administrador ha sido notificado al instante y remitirá el caso a un orientador. Guarda tu número de ticket para hacerle seguimiento.</p>
        <button className="btn-primary-pro mt-4" onClick={handleReset}>
          Hacer Nuevo Reporte
        </button>
      </div>
    );
  }

  return (
    <div className="df-container animate-fade-in">
      <div className="df-header">
        <div className="df-icon-wrapper">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h3>Formulario de Denuncia Fácil</h3>
          <p>La información enviada aquí está protegida y es estrictamente confidencial.</p>
        </div>
      </div>

      <form className="df-form" onSubmit={handleSubmit}>
        {/* Toggle Mode */}
        <div className="df-toggle-group">
          <div className="df-info-banner">
            <Info size={16} />
            <span>Puedes realizar esta denuncia identificándote o de forma totalmente anónima.</span>
          </div>
          <div className="df-switch-wrapper">
            <span>Modo de Reporte:</span>
            <div className="df-switch-options">
              <button type="button" className={`df-switch-btn ${!anonimo ? 'active' : ''}`} onClick={() => setAnonimo(false)}>
                Con mis Datos
              </button>
              <button type="button" className={`df-switch-btn ${anonimo ? 'active' : ''}`} onClick={() => setAnonimo(true)}>
                Modo Anónimo
              </button>
            </div>
          </div>
        </div>

        <div className="df-grid">
          {/* Col 1 */}
          <div className="df-col">
            <div className="df-field">
              <label>Tipo de Denuncia <span className="req">*</span></label>
              <select value={tipoViolencia} onChange={(e) => setTipoViolencia(e.target.value)} required className="v-input-pro">
                <option value="">Selecciona una opción...</option>
                <option value="Acoso Escolar (Bullying)">Acoso Escolar (Bullying)</option>
                <option value="Ciberacoso">Ciberacoso (Redes Sociales)</option>
                <option value="Agresión Física">Agresión Física</option>
                <option value="Amenazas">Amenazas</option>
                <option value="Abuso u Acoso Sexual">Abuso u Acoso Sexual</option>
                <option value="Discriminación">Discriminación o Exclusión</option>
                <option value="Fraude Académico">Fraude Académico</option>
                <option value="Problemas Familiares">Violencia en Casa / Problemas Familiares</option>
                <option value="Consumo de Sustancias">Consumo / Venta de Sustancias</option>
                <option value="Otro">Otro Tema de Convivencia</option>
              </select>
            </div>

            <div className="df-row-half">
              <div className="df-field">
                <label>Fecha de Ocurrencia</label>
                <input type="date" value={fechaHecho} onChange={(e) => setFechaHecho(e.target.value)} className="v-input-pro" />
              </div>
              <div className="df-field">
                <label>Lugar o Área</label>
                <input type="text" placeholder="Ej: Pasillo bloque 2, WhatsApp..." value={lugar} onChange={(e) => setLugar(e.target.value)} className="v-input-pro" />
              </div>
            </div>

            <div className="df-field">
              <label>Personas Involucradas (Opcional)</label>
              <input type="text" placeholder="Nombres o grupo (Ej: Juan P. y sus amigos)" value={involucrados} onChange={(e) => setInvolucrados(e.target.value)} className="v-input-pro" />
            </div>

            <div className="df-field">
              <label>Adjuntar Evidencia (Opcional)</label>
              <label className="df-file-upload">
                <UploadCloud size={18} />
                <span>Haz clic para subir imagen o documento</span>
                <input type="file" hidden accept="image/*,.pdf,.doc,.docx" />
              </label>
              <small className="df-small-note">Archivos soportados: JPG, PNG, PDF (Máx. 5MB)</small>
            </div>
          </div>

          {/* Col 2 */}
          <div className="df-col">
            <div className="df-field df-desc-field">
              <label>Descripción de los Hechos <span className="req">*</span></label>
              <textarea 
                placeholder="Narra de la forma más detallada posible qué fue lo que ocurrió, cuándo y cómo..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                className="v-input-pro"
              />
            </div>

            {/* Datos Personales - Hide if Anonimo */}
            <div className={`df-personal-data ${anonimo ? 'hidden' : ''}`}>
              <h4>Información de Contacto</h4>
              <p>Tu información se usará para informarte de la resolución.</p>
              
              <div className="df-field">
                <label>Nombre Completo</label>
                <input type="text" value={nombreContacto} onChange={(e) => setNombreContacto(e.target.value)} className="v-input-pro" />
              </div>
              
              <div className="df-row-half">
                <div className="df-field">
                  <label>Email</label>
                  <input type="email" value={emailContacto} onChange={(e) => setEmailContacto(e.target.value)} className="v-input-pro" />
                </div>
                <div className="df-field">
                  <label>Teléfono (Opcional)</label>
                  <input type="text" value={telefonoContacto} onChange={(e) => setTelefonoContacto(e.target.value)} className="v-input-pro" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="df-footer">
          <p className="df-disclaimer">Al Enviar Reporte, garantizamos que el área directiva actuará basándose en el manual de convivencia escolar.</p>
          <button type="submit" className="btn-primary-pro df-submit-btn" disabled={loading}>
            {loading ? 'Enviando...' : '📄 Registrar Denuncia Oficial'}
          </button>
        </div>
      </form>
    </div>
  );
}
