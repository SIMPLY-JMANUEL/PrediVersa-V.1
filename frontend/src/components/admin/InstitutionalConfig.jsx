import React, { useState, useEffect } from 'react';
import { Building2, Shield, FileSearch, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

const API = 'http://localhost:5000/api/config';
const token = () => localStorage.getItem('token');

/* ─── helpers ─────────────────────────────────── */
const sectionTitle = {
  fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px',
};
const card = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
  padding: '18px 22px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '9px',
  border: '1.5px solid #e2e8f0', fontSize: '0.82rem', color: '#1e293b',
  outline: 'none', fontFamily: 'inherit', background: '#f8fafc',
};
const labelStyle = { fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' };

const TABS = [
  { id: 'dependencias',  label: 'Dependencias',   icon: Building2 },
  { id: 'roles',         label: 'Roles y Permisos', icon: Shield },
  { id: 'auditoria',     label: 'Auditoría',       icon: FileSearch },
];

const MODULOS = ['Usuarios', 'Alertas', 'Dependencias', 'Roles', 'Configuración', 'Chatbot'];

/* ═══════════════════════════════════════════════
   DEPENDENCIAS
═══════════════════════════════════════════════ */
const DependenciasTab = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nombre: '', tipo: 'Otro', correo: '', telefono: '', estado: 'Activa' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchItems = async () => {
    const r = await fetch(`${API}/dependencias`, { headers: { Authorization: `Bearer ${token()}` } });
    const d = await r.json();
    if (d.success) setItems(d.dependencias);
  };

  useEffect(() => { fetchItems(); }, []);

  const save = async () => {
    if (!form.nombre.trim()) { setMsg('⚠️ Nombre requerido'); return; }
    const url = editing ? `${API}/dependencias/${editing}` : `${API}/dependencias`;
    const method = editing ? 'PUT' : 'POST';
    const r = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form)
    });
    const d = await r.json();
    setMsg(d.success ? '✅ Guardado correctamente' : `❌ ${d.message}`);
    if (d.success) { resetForm(); fetchItems(); }
    setTimeout(() => setMsg(''), 3000);
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar dependencia?')) return;
    await fetch(`${API}/dependencias/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    fetchItems();
  };

  const startEdit = (dep) => {
    setEditing(dep.id_dependencia);
    setForm({ nombre: dep.nombre, tipo: dep.tipo, correo: dep.correo, telefono: dep.telefono, estado: dep.estado });
  };

  const resetForm = () => { setEditing(null); setForm({ nombre: '', tipo: 'Otro', correo: '', telefono: '', estado: 'Activa' }); };

  return (
    <div>
      {/* Formulario */}
      <div style={card}>
        <p style={sectionTitle}>{editing ? 'Editar Dependencia' : 'Nueva Dependencia'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input style={inputStyle} placeholder="Ej: Coordinación Académica" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select style={inputStyle} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              {['Facultad', 'Coordinación', 'Bienestar', 'Dirección', 'Psicología', 'Otro'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <select style={inputStyle} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              <option>Activa</option><option>Inactiva</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Correo Institucional</label>
            <input style={inputStyle} placeholder="area@prediversa.edu.co" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input style={inputStyle} placeholder="310 000 0000" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
          </div>
        </div>
        {msg && <p style={{ fontSize: '0.8rem', color: msg.includes('✅') ? '#16a34a' : '#dc2626', marginBottom: '10px', fontWeight: '600' }}>{msg}</p>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary-pro" onClick={save}><Plus size={13} /> {editing ? 'Actualizar' : 'Registrar Dependencia'}</button>
          {editing && <button className="btn-secondary-pro" style={{ padding: '8px 16px', fontSize: '0.78rem' }} onClick={resetForm}><X size={13} /> Cancelar</button>}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...card, padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 2fr 1.2fr 1fr 0.8fr', background: '#f8fafc', padding: '12px 18px', borderBottom: '2px solid #f1f5f9' }}>
          {['Nombre', 'Tipo', 'Correo', 'Teléfono', 'Estado', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>
        {items.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No hay dependencias registradas</div>
        ) : items.map(dep => (
          <div key={dep.id_dependencia} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 2fr 1.2fr 1fr 0.8fr', padding: '12px 18px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
            <span style={{ fontSize: '0.83rem', fontWeight: '600', color: '#1e293b' }}>{dep.nombre}</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{dep.tipo}</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{dep.correo || '—'}</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{dep.telefono || '—'}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: dep.estado === 'Activa' ? '#16a34a' : '#dc2626', background: dep.estado === 'Activa' ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', padding: '3px 8px', width: 'fit-content' }}>{dep.estado}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => startEdit(dep)} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '0.72rem' }}><Pencil size={12} /></button>
              <button onClick={() => remove(dep.id_dependencia)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '0.72rem' }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   ROLES Y PERMISOS
═══════════════════════════════════════════════ */
const RolesTab = () => {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre_rol: '', descripcion: '', permisos: {}, estado: 'Activo' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const parsePermisos = (raw) => {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch { return {}; }
  };

  const fetchRoles = async () => {
    try {
      const r = await fetch(`${API}/roles`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setRoles(d.roles);
    } catch (e) { console.error('Error cargando roles:', e); }
  };

  useEffect(() => { fetchRoles(); }, []);

  const togglePerm = (modulo) => {
    setForm(prev => ({ ...prev, permisos: { ...prev.permisos, [modulo]: !prev.permisos[modulo] } }));
  };

  const save = async () => {
    const nombre = form.nombre_rol?.trim();
    if (!nombre) { setMsg('⚠️ Nombre del rol requerido'); return; }
    const url = editing ? `${API}/roles/${editing}` : `${API}/roles`;
    const method = editing ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, nombre_rol: nombre })
      });
      const d = await r.json();
      setMsg(d.success ? '✅ Guardado correctamente' : `❌ ${d.message}`);
      if (d.success) { resetForm(); fetchRoles(); }
    } catch (e) {
      setMsg('❌ Error de conexión');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este rol del sistema?')) return;
    try {
      const r = await fetch(`${API}/roles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) { fetchRoles(); setMsg('✅ Rol eliminado'); setTimeout(() => setMsg(''), 2500); }
      else setMsg('❌ No se pudo eliminar');
    } catch { setMsg('❌ Error de conexión'); }
  };

  const startEdit = (rol) => {
    const perms = parsePermisos(rol.permisos);
    const newForm = {
      nombre_rol: rol.nombre_rol || '',
      descripcion: rol.descripcion || '',
      permisos: perms,
      estado: rol.estado || 'Activo'
    };
    setForm(newForm);
    setEditing(rol.id_rol);
    // Scroll hacia el formulario
    setTimeout(() => {
      document.getElementById('roles-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ nombre_rol: '', descripcion: '', permisos: {}, estado: 'Activo' });
  };

  return (
    <div>
      <div id="roles-form-section" style={{ ...card, border: editing ? '2px solid #bae6fd' : '1px solid #e2e8f0' }}>
        <p style={sectionTitle}>{editing ? '✏️ Editando Rol' : 'Nuevo Rol'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Nombre del Rol *</label>
            <input style={inputStyle} placeholder="Ej: Psicólogo" value={form.nombre_rol} onChange={e => setForm({ ...form, nombre_rol: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <input style={inputStyle} placeholder="Descripción del rol..." value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <select style={inputStyle} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              <option>Activo</option><option>Inactivo</option>
            </select>
          </div>
        </div>

        <label style={{ ...labelStyle, marginBottom: '10px' }}>Permisos por Módulo</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {MODULOS.map(m => (
            <button key={m} type="button" onClick={() => togglePerm(m)} style={{
              display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
              borderRadius: '8px', border: '1.5px solid', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600',
              background: form.permisos[m] ? '#e0f2fe' : '#f8fafc',
              borderColor: form.permisos[m] ? '#7dd3fc' : '#e2e8f0',
              color: form.permisos[m] ? '#0369a1' : '#94a3b8',
            }}>
              {form.permisos[m] ? <Check size={12} /> : null} {m}
            </button>
          ))}
        </div>

        {msg && <p style={{ fontSize: '0.8rem', color: msg.includes('✅') ? '#16a34a' : '#dc2626', marginBottom: '10px', fontWeight: '600' }}>{msg}</p>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary-pro" onClick={save}><Plus size={13} /> {editing ? 'Actualizar Rol' : 'Crear Rol'}</button>
          {editing && <button className="btn-secondary-pro" style={{ padding: '8px 16px', fontSize: '0.78rem' }} onClick={resetForm}><X size={13} /> Cancelar</button>}
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr 1fr 0.8fr', background: '#f8fafc', padding: '12px 18px', borderBottom: '2px solid #f1f5f9' }}>
          {['Nombre', 'Descripción', 'Permisos', 'Estado', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>
        {roles.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No hay roles registrados</div>
        ) : roles.map(rol => {
          const perms = typeof rol.permisos === 'string' ? JSON.parse(rol.permisos || '{}') : (rol.permisos || {});
          const activePerms = Object.entries(perms).filter(([, v]) => v).map(([k]) => k);
          return (
            <div key={rol.id_rol} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr 1fr 0.8fr', padding: '12px 18px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
              <span style={{ fontSize: '0.83rem', fontWeight: '700', color: '#0c4a6e' }}>{rol.nombre_rol}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{rol.descripcion || '—'}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {activePerms.length === 0 ? <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sin permisos</span> :
                  activePerms.map(p => <span key={p} style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '5px', padding: '2px 7px', fontSize: '0.68rem', fontWeight: '700' }}>{p}</span>)}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: rol.estado === 'Activo' ? '#16a34a' : '#dc2626', background: rol.estado === 'Activo' ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', padding: '3px 8px', width: 'fit-content' }}>{rol.estado}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => startEdit(rol)} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer' }}><Pencil size={12} /></button>
                <button onClick={() => remove(rol.id_rol)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer' }}><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   AUDITORÍA
═══════════════════════════════════════════════ */
const AuditoriaTab = () => {
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auditoria`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setRegistros(d.registros); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = registros.filter(r =>
    r.accion?.toLowerCase().includes(filtro.toLowerCase()) ||
    r.modulo?.toLowerCase().includes(filtro.toLowerCase()) ||
    r.usuario_nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div>
      <div style={{ ...card, padding: '12px 18px', marginBottom: '12px' }}>
        <input
          style={{ ...inputStyle, background: '#fff' }}
          placeholder="Filtrar por usuario, acción o módulo..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1.2fr 1.3fr 1fr', background: '#f8fafc', padding: '12px 18px', borderBottom: '2px solid #f1f5f9' }}>
          {['Usuario', 'Acción', 'Módulo', 'Fecha y Hora', 'IP'].map(h => (
            <span key={h} style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Cargando registros...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            {registros.length === 0 ? 'No hay registros de auditoría aún.' : 'Sin resultados para el filtro aplicado.'}
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filtered.map((reg, i) => (
              <div key={reg.id_auditoria || i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1.2fr 1.3fr 1fr', padding: '11px 18px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>{reg.usuario_nombre}</span>
                <span style={{ fontSize: '0.78rem', color: '#334155' }}>{reg.accion}</span>
                <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '5px', padding: '2px 8px', fontWeight: '700', width: 'fit-content' }}>{reg.modulo}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(reg.fecha)}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{reg.ip || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════ */
const InstitutionalConfig = () => {
  const [activeTab, setActiveTab] = useState('dependencias');

  return (
    <div className="animate-fade-in">
      {/* Cabecera */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0c4a6e', marginBottom: '4px' }}>
          Configuración Institucional
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Administre la estructura institucional, permisos del sistema y control de actividades.
        </p>
      </div>

      {/* Pestañas */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        {TABS.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', border: 'none',
                borderBottom: isActive ? '3px solid #0c4a6e' : '3px solid transparent',
                background: isActive ? '#f0f9ff' : 'transparent',
                color: isActive ? '#0c4a6e' : '#64748b',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap',
                borderRadius: '8px 8px 0 0', transition: 'all 0.2s', marginBottom: '-2px',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '18px', height: '18px', borderRadius: '50%',
                background: isActive ? '#0c4a6e' : '#e2e8f0',
                color: isActive ? '#fff' : '#94a3b8',
                fontSize: '0.6rem', fontWeight: '800', flexShrink: 0
              }}>{i + 1}</span>
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'dependencias' && <DependenciasTab />}
      {activeTab === 'roles' && <RolesTab />}
      {activeTab === 'auditoria' && <AuditoriaTab />}
    </div>
  );
};

export default InstitutionalConfig;
