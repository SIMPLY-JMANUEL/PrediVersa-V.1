import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BASE_URL } from '../utils/api';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, XCircle, AlertTriangle, X, Users } from 'lucide-react';
import '../styles/components/ExcelUploader.css';

// Columnas esperadas en el Excel
const EXPECTED_COLUMNS = ['documentId', 'name', 'email', 'role', 'phone', 'address', 'birthDate', 'edad', 'grado', 'lugarNacimiento', 'nombrePadre', 'nombreMadre'];
const REQUIRED_COLUMNS = ['documentId', 'name', 'email', 'role'];
const VALID_ROLES = ['Estudiante', 'Colaboradores', 'Psicología', 'Administrador'];

function ExcelUploader({ onUploadSuccess, onClose }) {
  const [step, setStep] = useState('upload'); // upload | preview | result
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');

  // Descargar plantilla Excel
  const downloadTemplate = () => {
    const templateData = [
      EXPECTED_COLUMNS,
      ['1000123456', 'Juan Pérez García', 'juan.perez@colegio.edu.co', 'Estudiante', '3001234567', 'Calle 10 #20-30', '2008-05-15', '16', '10°', 'Bogotá', 'Carlos Pérez', 'María García'],
      ['1000987654', 'Ana López Torres', 'ana.lopez@colegio.edu.co', 'Estudiante', '3109876543', 'Carrera 5 #15-25', '2009-08-20', '15', '9°', 'Medellín', 'Luis López', 'Rosa Torres'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = EXPECTED_COLUMNS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'plantilla_usuarios_prediversa.xlsx');
  };

  // Leer y parsear el Excel
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });

        if (raw.length === 0) {
          setValidationErrors([{ fila: '-', motivo: 'El archivo está vacío o tiene formato incorrecto' }]);
          setStep('preview');
          return;
        }

        // Validar estructura del archivo
        const errors = [];
        const valid = [];

        raw.forEach((row, idx) => {
          const rowErrors = [];
          const fila = idx + 2; // +2 porque la fila 1 es el encabezado
          
          REQUIRED_COLUMNS.forEach(col => {
            if (!row[col] || String(row[col]).trim() === '') {
              rowErrors.push(`El campo "${col}" es obligatorio`);
            }
          });

          if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            rowErrors.push('Email inválido');
          }

          if (row.role && !VALID_ROLES.includes(row.role)) {
            rowErrors.push(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
          }

          if (rowErrors.length > 0) {
            errors.push({ fila, nombre: row.name || '?', motivo: rowErrors.join(' | ') });
          } else {
            // Normalizar el documentId a string
            valid.push({ ...row, documentId: String(row.documentId || '').trim() });
          }
        });

        setParsedData(valid);
        setValidationErrors(errors);
        setStep('preview');
      } catch (err) {
        setValidationErrors([{ fila: '-', motivo: 'No se pudo leer el archivo. Asegúrate de que sea un .xlsx o .xls válido.' }]);
        setStep('preview');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Enviar al backend
  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/users/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ users: parsedData })
      });

      const data = await response.json();
      setUploadResult(data);
      setStep('result');

      if (data.success && data.results.creados > 0) {
        onUploadSuccess?.();
      }
    } catch (err) {
      setUploadResult({ success: false, message: 'Error de conexión con el servidor.' });
      setStep('result');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setUploadResult(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="excel-uploader-overlay">
      <div className="excel-uploader-modal">
        {/* Header */}
        <div className="eu-header">
          <div className="eu-header-title">
            <FileSpreadsheet size={22} />
            <span>Carga Masiva por Excel</span>
          </div>
          <button className="eu-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Pasos */}
        <div className="eu-steps">
          <div className={`eu-step ${step === 'upload' ? 'active' : (step !== 'upload' ? 'done' : '')}`}>
            <span className="eu-step-num">1</span><span>Subir archivo</span>
          </div>
          <div className="eu-step-line" />
          <div className={`eu-step ${step === 'preview' ? 'active' : (step === 'result' ? 'done' : '')}`}>
            <span className="eu-step-num">2</span><span>Vista previa</span>
          </div>
          <div className="eu-step-line" />
          <div className={`eu-step ${step === 'result' ? 'active' : ''}`}>
            <span className="eu-step-num">3</span><span>Resultado</span>
          </div>
        </div>

        <div className="eu-body">

          {/* PASO 1: SUBIR */}
          {step === 'upload' && (
            <div className="eu-upload-section">
              <button className="eu-template-btn" onClick={downloadTemplate}>
                <Download size={16} />
                Descargar Plantilla Excel
              </button>
              <p className="eu-hint">Descarga y rellena la plantilla antes de subir el archivo.</p>

              <div className="eu-dropzone" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={48} color="#8ECFEA" />
                <p className="eu-dz-title">Haz clic para seleccionar el archivo</p>
                <p className="eu-dz-sub">Formatos aceptados: .xlsx, .xls</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="eu-columns-hint">
                <p><strong>Columnas requeridas:</strong> {REQUIRED_COLUMNS.join(', ')}</p>
                <p><strong>Columnas opcionales:</strong> phone, address, birthDate, edad, grado, lugarNacimiento, nombrePadre, nombreMadre</p>
                <p><strong>Roles válidos:</strong> {VALID_ROLES.join(', ')}</p>
                <p><strong>Contraseña inicial:</strong> <code>Password123</code> (el usuario debe cambiarla)</p>
              </div>
            </div>
          )}

          {/* PASO 2: VISTA PREVIA */}
          {step === 'preview' && (
            <div className="eu-preview-section">
              <div className="eu-preview-summary">
                <div className="eu-summary-chip success">
                  <CheckCircle2 size={16} />
                  <span>{parsedData.length} válidos listos para crear</span>
                </div>
                {validationErrors.length > 0 && (
                  <div className="eu-summary-chip error">
                    <XCircle size={16} />
                    <span>{validationErrors.length} filas con errores</span>
                  </div>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="eu-errors-box">
                  <h4><AlertTriangle size={16} /> Filas con errores (no se cargarán)</h4>
                  <div className="eu-errors-table-wrapper">
                    <table className="eu-table">
                      <thead><tr><th>Fila</th><th>Nombre</th><th>Error</th></tr></thead>
                      <tbody>
                        {validationErrors.map((e, i) => (
                          <tr key={i}>
                            <td>{e.fila}</td>
                            <td>{e.nombre}</td>
                            <td className="eu-error-text">{e.motivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="eu-valid-table-wrapper">
                  <h4><Users size={16} /> Usuarios que se crearán</h4>
                  <table className="eu-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Documento</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Grado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((u, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{u.documentId}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className={`eu-role-badge eu-role-${u.role?.toLowerCase().replace(/\s+/g, '-')}`}>{u.role}</span></td>
                          <td>{u.grado || '-'}</td>
                        </tr>
                      ))}
                      {parsedData.length > 10 && (
                        <tr><td colSpan={6} className="eu-more-rows">... y {parsedData.length - 10} más</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="eu-preview-actions">
                <button className="eu-btn-secondary" onClick={reset}>← Volver</button>
                <button
                  className="eu-btn-primary"
                  onClick={handleUpload}
                  disabled={parsedData.length === 0 || isLoading}
                >
                  {isLoading ? 'Cargando...' : `✔ Crear ${parsedData.length} usuarios`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: RESULTADO */}
          {step === 'result' && uploadResult && (
            <div className="eu-result-section">
              <div className={`eu-result-icon ${uploadResult.success ? 'success' : 'error'}`}>
                {uploadResult.success ? <CheckCircle2 size={56} /> : <XCircle size={56} />}
              </div>
              <h3 className="eu-result-title">{uploadResult.message}</h3>

              {uploadResult.results && (
                <div className="eu-result-grid">
                  <div className="eu-result-stat success">
                    <span className="eu-result-num">{uploadResult.results.creados}</span>
                    <span>Creados</span>
                  </div>
                  <div className="eu-result-stat warning">
                    <span className="eu-result-num">{uploadResult.results.duplicados?.length || 0}</span>
                    <span>Duplicados</span>
                  </div>
                  <div className="eu-result-stat danger">
                    <span className="eu-result-num">{uploadResult.results.errores?.length || 0}</span>
                    <span>Errores</span>
                  </div>
                </div>
              )}

              {uploadResult.results?.duplicados?.length > 0 && (
                <div className="eu-errors-box">
                  <h4>Duplicados (ya existían en la BD)</h4>
                  <table className="eu-table">
                    <thead><tr><th>Nombre</th><th>Email</th><th>Documento</th><th>Motivo</th></tr></thead>
                    <tbody>
                      {uploadResult.results.duplicados.map((d, i) => (
                        <tr key={i}>
                          <td>{d.name}</td><td>{d.email}</td><td>{d.documentId}</td>
                          <td className="eu-error-text">{d.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="eu-preview-actions">
                <button className="eu-btn-secondary" onClick={reset}>Nueva carga</button>
                <button className="eu-btn-primary" onClick={onClose}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcelUploader;
