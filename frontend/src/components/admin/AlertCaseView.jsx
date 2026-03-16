import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, Send, Clock, CheckSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import AlertDetails from './AlertDetails';
import AlertAssignment from './AlertAssignment';
import CaseTimeline from './CaseTimeline';

const TABS = [
  { id: 'la-alerta',     label: 'La Alerta',            icon: AlertTriangle },
  { id: 'informacion',   label: 'Información del Caso',  icon: FileText },
  { id: 'analisis',      label: 'Análisis y Remisión',   icon: Send },
  { id: 'seguimiento',   label: 'Seguimiento',           icon: Clock },
  { id: 'control-final', label: 'Control Final',         icon: CheckSquare },
];

const AlertCaseView = ({ selectedAlert, onBack, fetchAlerts, token }) => {
  const [activeTab, setActiveTab] = useState('la-alerta');
  const [caseStatus, setCaseStatus] = useState(selectedAlert?.status || 'Pendiente');
  const [closingNotes, setClosingNotes] = useState('');
  const [closingMsg, setClosingMsg] = useState('');
  const [closingLoading, setClosingLoading] = useState(false);

  useEffect(() => {
    setCaseStatus(selectedAlert?.status || 'Pendiente');
    setActiveTab('la-alerta');
  }, [selectedAlert?.id]);

  if (!selectedAlert) return null;

  const isVersa = selectedAlert.ticketNumber?.includes('CHT') || selectedAlert.ticketNumber?.includes('CRIT');

  const getBadgeStyle = (type) => {
    const map = {
      'Critica':    { bg: '#fef2f2', border: '#ef4444', color: '#dc2626' },
      'Advertencia':{ bg: '#fffbeb', border: '#f59e0b', color: '#d97706' },
      'Preventiva': { bg: '#eff6ff', border: '#3b82f6', color: '#2563eb' },
      'Informativa':{ bg: '#f0fdf4', border: '#22c55e', color: '#16a34a' },
    };
    return map[type] || { bg: '#f8fafc', border: '#94a3b8', color: '#64748b' };
  };
  const colors = getBadgeStyle(selectedAlert.alertType);

  const handleCloseCase = async () => {
    if (!closingNotes.trim()) { setClosingMsg('⚠️ Escriba las observaciones de cierre.'); return; }
    setClosingLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/alerts/${selectedAlert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Cerrada', description: selectedAlert.description + `\n\n[CIERRE: ${closingNotes}]` })
      });
      const data = await res.json();
      if (data.success) {
        setClosingMsg('✅ Caso cerrado exitosamente.');
        setCaseStatus('Cerrada');
        setTimeout(() => { fetchAlerts(); onBack(); }, 2000);
      } else { setClosingMsg('❌ Error al cerrar el caso.'); }
    } catch { setClosingMsg('❌ Error de conexión.'); }
    finally { setClosingLoading(false); }
  };

  /* ─── Helpers de estilo ─────────────────────────────────── */
  const sectionTitle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '14px',
  };
  const card = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '18px 22px',
    marginBottom: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  };
  const fieldLabel = { fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginBottom: '2px' };
  const fieldValue = { fontSize: '0.85rem', color: '#1e293b', fontWeight: '600' };

  return (
    <div className="alert-case-view animate-fade-in">

      {/* ── Header del caso ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            className="btn-secondary-pro"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.75rem', fontWeight: '600', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}
          >
            <ArrowLeft size={13} /> Volver al listado
          </button>

          <span style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, borderRadius: '8px', padding: '4px 12px', color: colors.color, fontWeight: '700', fontSize: '0.75rem' }}>
            {selectedAlert.alertType}
          </span>

          <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 12px', color: '#64748b', fontWeight: '600', fontSize: '0.75rem' }}>
            #{selectedAlert.ticketNumber}
          </span>

          <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '700' }}>
            {caseStatus}
          </span>

          {isVersa && (
            <span style={{ background: '#ede9fe', color: '#7c3aed', borderRadius: '8px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '700' }}>
              🤖 Versa IA
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
          👤 {selectedAlert.studentName}
        </span>
      </div>

      {/* ── Barra de pestañas ── */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                border: 'none',
                borderBottom: isActive ? '3px solid #0c4a6e' : '3px solid transparent',
                background: isActive ? '#f0f9ff' : 'transparent',
                color: isActive ? '#0c4a6e' : '#64748b',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s',
                marginBottom: '-2px',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '18px', height: '18px', borderRadius: '50%',
                background: isActive ? '#0c4a6e' : '#e2e8f0',
                color: isActive ? '#fff' : '#94a3b8',
                fontSize: '0.6rem', fontWeight: '800', flexShrink: 0
              }}>{index + 1}</span>
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── 1. LA ALERTA ── */}
      {activeTab === 'la-alerta' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ ...card, background: colors.bg, borderColor: colors.border }}>
              <p style={sectionTitle}>Tipo de Alerta Detectada</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: colors.color, marginBottom: '4px' }}>{selectedAlert.alertType}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{isVersa ? '🤖 Detectada por Versa IA' : '✍️ Registro Manual'}</p>
            </div>
            <div style={card}>
              <p style={sectionTitle}>Identificación del Caso</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div><span style={fieldLabel}>Ticket</span><p style={fieldValue}>{selectedAlert.ticketNumber}</p></div>
                <div><span style={fieldLabel}>Fecha y Hora</span><p style={fieldValue}>{selectedAlert.alertDate} {selectedAlert.alertTime}</p></div>
                <div><span style={fieldLabel}>Estado</span><p style={{ ...fieldValue, color: '#0369a1' }}>{caseStatus}</p></div>
              </div>
            </div>
          </div>

          <div style={card}>
            <p style={sectionTitle}>Descripción del Evento</p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', fontSize: '0.85rem', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {selectedAlert.description}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button onClick={() => setActiveTab('informacion')} className="btn-primary-pro">
              Información del Caso →
            </button>
          </div>
        </div>
      )}

      {/* ── 2. INFORMACIÓN DEL CASO ── */}
      {activeTab === 'informacion' && (
        <div className="animate-fade-in">
          <AlertDetails selectedAlert={selectedAlert} onBack={() => setActiveTab('la-alerta')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button onClick={() => setActiveTab('analisis')} className="btn-primary-pro">
              Análisis y Remisión →
            </button>
          </div>
        </div>
      )}

      {/* ── 3. ANÁLISIS Y REMISIÓN ── */}
      {activeTab === 'analisis' && (
        <div className="animate-fade-in">
          <AlertAssignment selectedAlert={selectedAlert} fetchAlerts={fetchAlerts} onBack={() => setActiveTab('informacion')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button onClick={() => setActiveTab('seguimiento')} className="btn-primary-pro">
              Ver Seguimiento →
            </button>
          </div>
        </div>
      )}

      {/* ── 4. SEGUIMIENTO ── */}
      {activeTab === 'seguimiento' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '14px' }}>
            <p style={sectionTitle}>Línea de Vida del Caso</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Historial cronológico de todas las acciones registradas sobre este caso.</p>
          </div>
          <div style={card}>
            <CaseTimeline alertId={selectedAlert.id} token={token} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button onClick={() => setActiveTab('control-final')} className="btn-primary-pro">
              Control Final →
            </button>
          </div>
        </div>
      )}

      {/* ── 5. CONTROL FINAL ── */}
      {activeTab === 'control-final' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '14px' }}>
            <p style={sectionTitle}>Control Final del Caso</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Cierre oficial y observaciones de aprendizaje institucional.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={card}>
              <p style={sectionTitle}>Resumen Ejecutivo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['Ticket', selectedAlert.ticketNumber],
                  ['Estudiante', selectedAlert.studentName],
                  ['Tipo', selectedAlert.alertType],
                  ['Asignado a', selectedAlert.assignedTo || 'Sin asignar'],
                  ['Estado actual', caseStatus],
                ].map(([label, val]) => (
                  <div key={label}><span style={fieldLabel}>{label}</span><p style={fieldValue}>{val}</p></div>
                ))}
              </div>
            </div>

            <div style={card}>
              <p style={sectionTitle}>Estado de Resolución</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {['Pendiente', 'En Proceso', 'Resuelta', 'Cerrada'].map(status => {
                  const isCurrent = caseStatus === status;
                  return (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: isCurrent ? '#0c4a6e' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isCurrent && <CheckCircle size={11} color="#fff" />}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: isCurrent ? '#0c4a6e' : '#94a3b8', fontWeight: isCurrent ? '700' : '400' }}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {caseStatus !== 'Cerrada' ? (
            <div style={card}>
              <p style={sectionTitle}>Observaciones de Cierre</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '12px' }}>Documente el resultado final antes de cerrar el caso oficialmente.</p>
              <textarea
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="Ej: El estudiante recibió atención psicológica durante 3 sesiones y se reintegró al aula..."
                rows={4}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.83rem', lineHeight: '1.6', resize: 'vertical', outline: 'none', color: '#334155', background: '#f8fafc', fontFamily: 'inherit' }}
              />
              {closingMsg && (
                <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: closingMsg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: closingMsg.includes('✅') ? '#16a34a' : '#dc2626', fontWeight: '600', fontSize: '0.8rem' }}>
                  {closingMsg}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button onClick={handleCloseCase} disabled={closingLoading} className="btn-primary-pro">
                  {closingLoading ? 'Cerrando...' : '🔒 Cerrar Caso Oficialmente'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...card, background: '#f0fdf4', borderColor: '#bbf7d0', textAlign: 'center', padding: '36px' }}>
              <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#15803d', fontWeight: '800', fontSize: '0.95rem' }}>Caso Oficialmente Cerrado</h3>
              <p style={{ color: '#166534', fontSize: '0.8rem', marginTop: '6px' }}>Este caso ha sido cerrado y archivado en el historial institucional.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertCaseView;
