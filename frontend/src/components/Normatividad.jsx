import React, { useState } from 'react';
import { BookOpen, ShieldCheck, UserCheck, AlertOctagon, ChevronDown, ChevronUp } from 'lucide-react';
import './Normatividad.css';

export default function Normatividad() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      title: "1. Derechos de los Estudiantes",
      icon: <ShieldCheck size={24} className="text-emerald-500" />,
      content: [
        "Recibir un trato digno, respetuoso y libre de toda forma de discriminación por razones de raza, género u orientación.",
        "Gozar de un ambiente escolar sano, seguro y protector que garantice su bienestar integral y psicológico.",
        "Ser escuchado, orientado y presentar peticiones respetuosas a las autoridades y orientadores de la institución.",
        "Conocer el Manual de Convivencia y las normas claras que rigen la vida institucional académica.",
        "Recibir atención integral y prioritaria en casos de acoso escolar, violencia o vulneración de derechos.",
        "Garantía absoluta del debido proceso en cualquier actuación o investigación disciplinaria."
      ]
    },
    {
      title: "2. Deberes y Obligaciones",
      icon: <UserCheck size={24} className="text-blue-500" />,
      content: [
        "Respetar la dignidad, intimidad y derechos de todos los miembros de la comunidad educativa (estudiantes y personal).",
        "Cumplir con el Manual de Convivencia y acatar las orientaciones del cuerpo docente, de orientación y directivo.",
        "No crear, tolerar, ni encubrir o participar en actos de acoso escolar (bullying), agresiones o ciberacoso.",
        "Cuidar y proteger activamente las instalaciones, materiales educativos y recursos tecnológicos del colegio.",
        "Mantener un comportamiento ético, rechazando cualquier forma de fraude o deshonestidad académica en las evaluaciones."
      ]
    },
    {
      title: "3. Protocolos de Convivencia (Ruta de Atención Institucional)",
      icon: <BookOpen size={24} className="text-indigo-500" />,
      content: [
        "Situaciones Tipo I (Faltas leves): Conflictos manejados inadecuadamente o esporádicos. Se abordan mediante mediación inmediata, diálogo y compromisos formativos con el profesor.",
        "Situaciones Tipo II (Faltas graves): Situaciones repetitivas de agresión, acoso o ciberacoso que no causen daño físico o psicológico permanente. Implican atención obligatoria en bienestar, remisión psicológica y posibles medidas disciplinarias preventivas.",
        "Situaciones Tipo III (Faltas gravísimas): Situaciones que sean presuntos delitos penales (abuso sexual, violencia física grave, drogas o porte de armas). El colegio activa inmediatamente la alerta y remite el caso al ICBF o Policía de Infancia y Adolescencia."
      ]
    },
    {
      title: "4. Sanciones y Medidas Formativas",
      icon: <AlertOctagon size={24} className="text-red-500" />,
      content: [
        "Importante: Las medidas aplicadas en la institución no tienen un fin netamente punitivo, sino formativo y restaurativo.",
        "Llamado de atención verbal o escrito (Amonestación) en la hoja de vida para reflexionar sobre la falta cometida.",
        "Trabajos o acciones pedagógicas de reparación para resarcir formalmente el daño causado a la comunidad o a un compañero afectado.",
        "Suspensión temporal o condicionamiento de matrícula ante la rectoría en casos de reincidencia o faltas catalogadas como graves.",
        "Expulsión o cancelación de matrícula únicamente como la última y máxima medida legal aplicada frente a faltas de extrema gravedad comprobadas."
      ]
    }
  ];

  return (
    <div className="norma-container animate-fade-in">
      <div className="norma-header">
        <div className="norma-icon-wrapper">
          <BookOpen size={30} />
        </div>
        <div>
          <h3>Guía de Normatividad Institucional</h3>
          <p>Consulta tus derechos, deberes y el marco legal para tu protección.</p>
        </div>
      </div>

      <div className="norma-content">
        <p className="norma-intro">
          El <strong>Manual de Convivencia y Normatividad</strong> de nuestra institución no es solo un reglamento disciplinario; 
          es un pacto de respeto mutuo creado detalladamente para proteger la integridad física y mental de ti y la de 
          todos los estudiantes. Conocerlo es fundamental para garantizar un ambiente seguro.
        </p>

        <div className="norma-accordion">
          {sections.map((sec, i) => (
            <div key={i} className={`norma-card ${openSection === i ? 'open' : ''}`}>
              <button type="button" className="norma-card-header" onClick={() => toggleSection(i)}>
                <div className="norma-title-wrap">
                  {sec.icon}
                  <h4>{sec.title}</h4>
                </div>
                {openSection === i ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              
              <div className="norma-card-body">
                <ul>
                  {sec.content.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="norma-footer">
          <p>
            ⚠️ <strong>¿Sientes que alguno de tus derechos ha sido vulnerado o presenciaste un acto indebido?</strong><br/>
            Recuerda que dispones de la herramienta segura de <em>Denuncia Fácil</em> o de nuestro sistema de 
            ayuda por <em>Chatbot</em> para canalizar tus casos de manera inmediata al Área de Bienestar.
          </p>
        </div>
      </div>
    </div>
  );
}
