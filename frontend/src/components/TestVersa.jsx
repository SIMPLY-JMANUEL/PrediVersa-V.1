import React, { useState } from 'react';
import { ClipboardList, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../utils/api'; // FIX A-1: Usar utilitario centralizado
import '../styles/components/TestVersa.css';

export default function TestVersa({ user }) {
  const [activeTestId, setActiveTestId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState({});

  const testsDesc = [
    {
      id: "empatia",
      title: "Test de Empatía",
      questions: [
        "Puedo identificar fácilmente cuando alguien está triste.",
        "Me afecta ver sufrir a otras personas.",
        "Intento comprender los sentimientos de otros antes de juzgar.",
        "Escucho activamente cuando alguien me cuenta un problema.",
        "Me pongo en el lugar de otras personas."
      ]
    },
    {
      id: "etica",
      title: "Test de Ética Personal",
      questions: [
        "Cumplo reglas incluso cuando nadie me observa.",
        "Evito obtener beneficios si perjudican a otros.",
        "Admito mis errores cuando me equivoco.",
        "Considero las consecuencias de mis acciones en otras personas.",
        "Intento actuar con justicia en mis decisiones."
      ]
    },
    {
      id: "simpatia",
      title: "Test de Simpatía / Amabilidad",
      questions: [
        "Las personas suelen sentirse cómodas hablando conmigo.",
        "Me gusta ayudar a otros cuando lo necesitan.",
        "Suelo ser amable con personas desconocidas.",
        "Intento mantener un ambiente positivo con los demás.",
        "Sonrío y saludo con facilidad."
      ]
    },
    {
      id: "soledad",
      title: "Test de Soledad",
      questions: [
        "Siento que tengo pocas personas con quien hablar.",
        "A menudo me siento aislado de los demás.",
        "Me gustaría tener más amigos cercanos.",
        "Siento que nadie me comprende completamente.",
        "Paso mucho tiempo solo aunque no lo desee."
      ]
    },
    {
      id: "tristeza",
      title: "Test de Tristeza",
      questions: [
        "Me siento desanimado gran parte del tiempo.",
        "He perdido interés en cosas que antes disfrutaba.",
        "Me cuesta sentir entusiasmo por el futuro.",
        "A veces siento que nada vale la pena.",
        "Tengo dificultades para mantener un estado de ánimo positivo."
      ]
    },
    {
      id: "paranoia",
      title: "Test de Pensamiento Paranoide",
      questions: [
        "A veces siento que las personas hablan mal de mí.",
        "Me cuesta confiar en las intenciones de otros.",
        "Pienso que algunas personas intentan perjudicarme.",
        "Analizo demasiado lo que otros dicen o hacen.",
        "Me preocupa que los demás oculten algo contra mí."
      ]
    },
    {
      id: "inteligencia",
      title: "Test de Autopercepción de Inteligencia",
      questions: [
        "Aprendo conceptos nuevos con facilidad.",
        "Me gusta resolver problemas complejos.",
        "Analizo situaciones antes de tomar decisiones.",
        "Encuentro soluciones creativas a problemas.",
        "Disfruto aprender cosas nuevas."
      ]
    },
    {
      id: "felicidad",
      title: "Test ¿Qué tan feliz soy?",
      questions: [
        "Siento que mi vida tiene un propósito claro.",
        "Me siento satisfecho/a con lo que he logrado hasta ahora.",
        "Suelo despertar con entusiasmo por el nuevo día.",
        "Tengo relaciones personales que me llenan de alegría.",
        "Río y disfruto genuinamente la mayoría de los días."
      ]
    }
  ];

  const handleAnswerChange = (qIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [qIndex]: parseInt(value)
    }));
  };

  const calculateSingleResult = (testId, testQuestions) => {
    let sum = 0;
    testQuestions.forEach((_, qIndex) => {
      sum += answers[qIndex] || 0;
    });

    let nivel = "";
    let colorClass = "";
    
    if (sum <= 10) {
      nivel = "Bajo";
      colorClass = "rs-bajo";
    } else if (sum >= 11 && sum <= 18) {
      nivel = "Medio";
      colorClass = "rs-medio";
    } else {
      nivel = "Alto";
      colorClass = "rs-alto";
    }

    const isNegativeTrait = ['soledad', 'tristeza', 'paranoia'].includes(testId);
    
    if (isNegativeTrait) {
      if (nivel === "Alto") colorClass = "rs-alto-negativo";
      if (nivel === "Bajo") colorClass = "rs-bajo-positivo"; 
    } else {
      if (nivel === "Alto") colorClass = "rs-alto-positivo"; 
      if (nivel === "Bajo") colorClass = "rs-bajo-negativo"; 
    }

    setResults(prev => ({
      ...prev,
      [testId]: { sum, nivel, colorClass, title: testsDesc.find(t => t.id === testId).title }
    }));
    
    setIsFinished(true);

    // Enviar resultado al Dashboard Administrativo (Backend)
    try {
      apiFetch('/api/chatbot/test-result', {
        method: 'POST',
        body: JSON.stringify({
          estudianteId: user?.documentId || user?.id,
          nombre: user?.name,
          testId: testId,
          testTitle: testsDesc.find(t => t.id === testId).title,
          score: sum,
          nivel: nivel,
          colorClass: colorClass
        })
      });
    } catch (error) {
      console.error('Error al guardar reporte de test:', error);
    }
  };

  const isCurrentTestComplete = (testLength) => {
    for (let i = 0; i < testLength; i++) {
      if (answers[i] === undefined) {
        return false;
      }
    }
    return true;
  };

  const resetCurrentTest = () => {
    setActiveTestId(null);
    setAnswers({});
    setIsFinished(false);
  };

  // Render Grid of Tests if none is active
  if (!activeTestId) {
    return (
      <div className="test-container animate-fade-in">
        <div className="test-header">
          <div className="test-icon-wrapper">
            <ClipboardList size={30} />
          </div>
          <div>
            <h3>Módulo de Evaluación Continua</h3>
            <p>Selecciona un test individual para comenzar. Los resultados se guardarán en tu perfil de bienestar.</p>
          </div>
        </div>

        <div className="test-modules-grid">
          {testsDesc.map(test => {
            const isCompleted = !!results[test.id];
            return (
              <div key={test.id} className={`test-module-card ${isCompleted ? 'completed' : ''}`}>
                <div className="tmc-header">
                  <h4>{test.title}</h4>
                  {isCompleted && <CheckCircle2 size={20} className="text-emerald-500" />}
                </div>
                <p>5 Preguntas de selección.</p>
                <div className="tmc-footer">
                  {isCompleted ? (
                    <div className="tmc-score-badge">
                      Puntaje: {results[test.id].sum} - {results[test.id].nivel}
                    </div>
                  ) : (
                    <button className="btn-primary-pro btn-sm" onClick={() => { setActiveTestId(test.id); setAnswers({}); setIsFinished(false); }}>
                      Iniciar Test
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentTest = testsDesc.find(t => t.id === activeTestId);

  // Render Result for Single Test
  if (isFinished) {
    const res = results[activeTestId];
    return (
      <div className="test-container animate-fade-in">
        <div className="test-header">
          <div className="test-icon-wrapper success">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h3>Resultados: {res.title}</h3>
            <p>Este informe se ha añadido a tu perfil de estudiante.</p>
          </div>
        </div>

        <div className="resultado-card big-res-card animate-fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h4>{res.title}</h4>
          <div className="res-score-wrap">
            <span className="res-number">{res.sum}</span>
            <span className="res-pts">/ 25 pts</span>
          </div>
          <p className="big-res-desc">De acuerdo a tus respuestas, actualmente presentas un nivel <strong>{res.nivel.toUpperCase()}</strong> en esta área.</p>
        </div>

        <div className="test-navigation" style={{ justifyContent: 'center', marginTop: '40px' }}>
          <button className="btn-primary-pro" onClick={resetCurrentTest}>
            Regresar a los Módulos
          </button>
        </div>
      </div>
    );
  }

  // Render Active Test Form
  return (
    <div className="test-container animate-fade-in">
      <div className="test-header">
        <div className="test-icon-wrapper">
          <ClipboardList size={30} />
        </div>
        <div>
          <h3>{currentTest.title}</h3>
          <p>Responde con total sinceridad. Esta prueba solo toma un par de minutos.</p>
        </div>
      </div>

      <div className="test-content">
        <p className="test-instructions">En una escala del 1 (Totalmente en Desacuerdo) al 5 (Totalmente de Acuerdo), valora las siguientes afirmaciones:</p>

        <div className="preguntas-list">
          {currentTest.questions.map((q, qIndex) => (
            <div key={qIndex} className="pregunta-item">
              <p className="pregunta-texto">{qIndex + 1}. {q}</p>
              <div className="opciones-escala">
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} className={`opcion-radio ${answers[qIndex] === val ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`q_${qIndex}`}
                      value={val}
                      checked={answers[qIndex] === val}
                      onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                    />
                    <span>{val}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="test-navigation">
        <button className="btn-outline-pro" onClick={resetCurrentTest}>
          <ArrowLeft size={16} /> Cancelar y Volver
        </button>
        
        <button 
          className="btn-primary-pro nav-btn" 
          onClick={() => calculateSingleResult(currentTest.id, currentTest.questions)} 
          disabled={!isCurrentTestComplete(currentTest.questions.length)}
        >
          Visualizar Resultados
        </button>
      </div>
    </div>
  );
}
