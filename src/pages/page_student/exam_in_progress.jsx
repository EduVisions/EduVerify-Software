import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useExams } from "../../hooks/useExams.js";
// Todos los exámenes comparten el mismo banco de preguntas (no se generó
// contenido distinto por examen); se renombra a QUESTIONS solo por brevedad local.
import { QUESTION_BANK as QUESTIONS } from "../../data/mockExams.js";
import Button from "../../components/Button.jsx";

const INCIDENT_TYPES = [
  { id: "rostro", label: "Rostro no detectado", icon: "ti-eye-off" },
  { id: "multiples", label: "Múltiples personas", icon: "ti-users" },
  { id: "pestana", label: "Cambio de pestaña", icon: "ti-arrows-shuffle" },
  { id: "ruido", label: "Ruido o voz externa", icon: "ti-volume" },
];

export default function EduverifyExamInProgress() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { getExamById } = useExams();
  const exam = getExamById(examId);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  // exam.duracion viene en minutos (mockExams.js); el temporizador es en segundos.
  // Como la ruta usa key={examId} (ver App.jsx), este componente se remonta
  // por completo al cambiar de examen, así que este valor inicial siempre
  // corresponde al examen correcto.
  const [secondsLeft, setSecondsLeft] = useState(() => (exam ? exam.duracion * 60 : 0));
  const [camGranted, setCamGranted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [toast, setToast] = useState(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // examId inválido o inexistente (ej. URL editada a mano) → de vuelta al dashboard.
  useEffect(() => {
    if (!exam) navigate("/student");
  }, [exam, navigate]);

  // Cámara en vivo durante el examen
  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCamGranted(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamGranted(true);
      } catch {
        setCamGranted(false);
      }
    };
    startCamera();
    return () => {
      active = false;
      stopCamera();
    };
  }, []);

  const reportIncident = (incident) => {
    const time = new Date().toLocaleTimeString("es-PE", { hour12: false });
    setIncidents((prev) => [{ ...incident, time }, ...prev]);
    setToast(`Infracción registrada: ${incident.label}`);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  // Temporizador
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(intervalRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timerRed = secondsLeft < 300; // últimos 5 min

  const question = QUESTIONS[currentQ];
  const answered = (qId) => answers[qId] !== undefined && answers[qId] !== "";
  const totalAnswered = QUESTIONS.filter((q) => answered(q.id)).length;

  const setAnswer = (qId, value) => setAnswers((p) => ({ ...p, [qId]: value }));

  const goTo = (index) => {
    if (index >= 0 && index < QUESTIONS.length) setCurrentQ(index);
  };

  // No renderizar con datos vacíos mientras el useEffect de arriba redirige.
  if (!exam) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .ev-app{height:100vh;overflow:hidden;background:#f0ede8;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;}

        /* TOPBAR */
        .ev-topbar{background:#12213f;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;flex-shrink:0;}
        .ev-logo-row{display:flex;align-items:center;gap:9px;}
        .ev-logo-box{width:30px;height:30px;background:#4f7cff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;}
        .ev-logo-name{font-family:'Lora',serif;font-size:14px;font-weight:600;color:#fff;}
        .ev-exam-title{font-size:13px;color:#9bb0d6;font-family:'Lora',serif;}
        .ev-timer{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;font-family:monospace;padding:7px 14px;border-radius:20px;transition:all .3s;}
        .ev-timer.normal{background:#1a2f55;color:#9bb0d6;}
        .ev-timer.urgent{background:#3a1010;color:#ff9a9a;animation:timerPulse 1.5s infinite;}
        @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.7}}
        .ev-timer-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}

        /* LAYOUT */
        .ev-layout{flex:1;display:grid;grid-template-columns:220px 1fr 200px;grid-template-rows:minmax(0,1fr);gap:0;min-height:0;overflow:hidden;}

        /* LEFT — question navigator */
        .ev-nav-panel{background:#fff;border-right:1px solid #ececec;padding:1.2rem;overflow-y:auto;}
        .ev-nav-title{font-size:11px;font-weight:500;color:#8c92a4;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px;}
        .ev-nav-progress{height:5px;background:#f0f1f4;border-radius:5px;overflow:hidden;margin-bottom:14px;}
        .ev-nav-progress-fill{height:100%;background:#4f7cff;border-radius:5px;transition:width .3s;}
        .ev-nav-progress-label{font-size:11px;color:#8c92a4;margin-bottom:12px;margin-top:-8px;}

        .ev-nav-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:1.3rem;}
        .ev-nav-btn{width:100%;aspect-ratio:1;border-radius:8px;border:1.5px solid #e4e7ef;background:#fafbfc;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;color:#8c92a4;}
        .ev-nav-btn:hover{border-color:#b0b7cc;}
        .ev-nav-btn.active{background:#12213f;border-color:#12213f;color:#fff;}
        .ev-nav-btn.answered{background:#eafff3;border-color:#22b865;color:#22b865;}
        .ev-nav-btn.answered.active{background:#12213f;border-color:#12213f;color:#fff;}

        .ev-nav-legend{display:flex;flex-direction:column;gap:8px;font-size:11.5px;color:#8c92a4;}
        .ev-legend-row{display:flex;align-items:center;gap:7px;}
        .ev-legend-box{width:13px;height:13px;border-radius:3px;flex-shrink:0;}

        /* CENTER — question content */
        .ev-question-area{padding:2rem;overflow-y:auto;display:flex;flex-direction:column;}
        .ev-q-header{display:flex;align-items:center;gap:10px;margin-bottom:1.6rem;}
        .ev-q-num-badge{background:#12213f;color:#fff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;}
        .ev-q-type-badge{background:#f0f4ff;color:#4f7cff;font-size:11px;font-weight:500;padding:5px 11px;border-radius:20px;}

        .ev-q-card{background:#fff;border-radius:18px;border:1px solid #ececec;padding:1.8rem;flex:1;}
        .ev-q-text{font-size:16px;color:#12213f;line-height:1.6;margin-bottom:1.6rem;font-weight:400;}

        /* Multiple choice */
        .ev-options-list{display:flex;flex-direction:column;gap:10px;}
        .ev-option-btn{width:100%;padding:13px 16px;border:1.5px solid #e4e7ef;border-radius:12px;background:#fafbfc;text-align:left;font-size:14px;font-family:'DM Sans',sans-serif;color:#5a607a;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:12px;}
        .ev-option-btn:hover{border-color:#b0b7cc;background:#fff;}
        .ev-option-btn.selected{border-color:#4f7cff;background:#f0f4ff;color:#12213f;}
        .ev-option-radio{width:18px;height:18px;border-radius:50%;border:1.5px solid #d0d4e0;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .ev-option-btn.selected .ev-option-radio{border-color:#4f7cff;}
        .ev-option-radio-dot{width:9px;height:9px;border-radius:50%;background:#4f7cff;opacity:0;transition:opacity .15s;}
        .ev-option-btn.selected .ev-option-radio-dot{opacity:1;}

        /* Free text */
        .ev-textarea{width:100%;min-height:160px;padding:14px 16px;border:1.5px solid #e4e7ef;border-radius:12px;font-size:14px;font-family:'DM Sans',sans-serif;color:#12213f;background:#fafbfc;outline:none;resize:vertical;line-height:1.7;transition:border-color .15s,box-shadow .15s;}
        .ev-textarea:focus{border-color:#4f7cff;background:#fff;box-shadow:0 0 0 3px rgba(79,124,255,.1);}
        .ev-textarea-count{font-size:11.5px;color:#b0b5c4;text-align:right;margin-top:7px;}

        /* Navigation buttons */
        .ev-q-nav-row{display:flex;align-items:center;justify-content:space-between;margin-top:1.5rem;}
        .ev-nav-arrow{height:42px;padding:0 18px;border-radius:10px;border:1.5px solid #e4e7ef;background:#fff;font-size:13.5px;color:#5a607a;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s;}
        .ev-nav-arrow:hover{border-color:#b0b5c8;color:#12213f;}
        .ev-nav-arrow:disabled{opacity:.4;cursor:not-allowed;}
        .ev-btn-submit-exam{height:42px;padding:0 20px;border-radius:10px;border:none;background:#12213f;color:#fff;font-size:13.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:7px;transition:background .2s;}
        .ev-btn-submit-exam:hover{background:#1e3260;}

        /* RIGHT — camera + status */
        .ev-right-panel{background:#fff;border-left:1px solid #ececec;padding:1.1rem;display:flex;flex-direction:column;gap:1.1rem;overflow-y:auto;}

        .ev-cam-widget{background:#0c1426;border-radius:14px;overflow:hidden;border:2px solid #22b865;transition:border-color .3s;flex-shrink:0;}
        .ev-cam-widget.off{border-color:#e05252;}
        .ev-cam-preview{position:relative;aspect-ratio:4/3;background:radial-gradient(circle at 50% 38%,#1a2942 0%,#0a0f1c 70%);display:flex;align-items:center;justify-content:center;}
        .ev-cam-video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);}
        .ev-cam-sim-face{position:absolute;border:2.5px solid rgba(95,224,160,0.7);border-radius:12px;width:40%;height:55%;top:15%;left:30%;}
        .ev-cam-live-badge{position:absolute;top:7px;left:7px;background:rgba(34,184,101,0.18);border:1px solid #22b865;color:#5fe0a0;font-size:8.5px;font-weight:600;padding:3px 7px;border-radius:12px;display:flex;align-items:center;gap:4px;}
        .ev-cam-live-dot{width:5px;height:5px;border-radius:50%;background:#e05252;animation:pulse 1.2s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .ev-cam-footer{padding:6px 9px;background:#0e1c38;font-size:9px;color:#9bb0d6;display:flex;align-items:center;justify-content:space-between;}

        /* INCIDENT SIMULATION */
        .ev-incident-grid{display:flex;flex-direction:column;gap:6px;}
        .ev-incident-btn{text-align:left;font-size:11.5px;padding:8px 10px;border-radius:8px;border:1px solid #ffe1a3;background:#fff8e8;color:#8a6200;cursor:pointer;transition:all .15s;}
        .ev-incident-btn:hover{background:#fff0cc;border-color:#f0a500;}
        .ev-incident-log{margin-top:10px;display:flex;flex-direction:column;gap:5px;}
        .ev-incident-log-item{display:flex;justify-content:space-between;gap:6px;font-size:11px;color:#8c92a4;background:#fafbfc;border:1px solid #ececec;border-radius:7px;padding:5px 8px;}
        .ev-incident-log-time{color:#b0b5c4;white-space:nowrap;}

        /* TOAST */
        .ev-toast{position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#3a1010;color:#ff9a9a;border:1px solid #e05252;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;z-index:200;box-shadow:0 10px 30px rgba(0,0,0,.25);}

        .ev-status-section h4{font-size:11px;font-weight:500;color:#8c92a4;text-transform:uppercase;letter-spacing:.04em;margin-bottom:9px;}
        .ev-status-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fafbfc;border:1px solid #ececec;border-radius:10px;margin-bottom:7px;font-size:12px;color:#5a607a;}
        .ev-status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}

        /* SUBMIT MODAL */
        .ev-modal-overlay{position:fixed;inset:0;background:rgba(18,33,63,0.55);display:flex;align-items:center;justify-content:center;z-index:100;padding:1.5rem;}
        .ev-modal{background:#fff;border-radius:20px;max-width:420px;width:100%;padding:1.8rem;position:relative;text-align:center;}
        .ev-modal-icon{font-size:44px;margin-bottom:14px;}
        .ev-modal h2{font-family:'Lora',serif;font-size:20px;font-weight:500;color:#12213f;margin-bottom:8px;}
        .ev-modal p{font-size:13.5px;color:#8c92a4;margin-bottom:1.4rem;line-height:1.6;}
        .ev-modal-summary{display:flex;gap:10px;margin-bottom:1.4rem;}
        .ev-modal-stat{flex:1;background:#fafbfc;border:1px solid #ececec;border-radius:11px;padding:0.8rem 0.5rem;text-align:center;}
        .ev-modal-stat-value{font-family:'Lora',serif;font-size:20px;font-weight:600;color:#12213f;}
        .ev-modal-stat-label{font-size:10px;color:#8c92a4;margin-top:2px;}
        .ev-modal-stat-value.warn{color:#e08a00;}
        .ev-modal-warn{background:#fff6e0;border:1px solid #ffe1a3;border-radius:11px;padding:10px 12px;margin-bottom:1.2rem;font-size:12px;color:#8a6200;line-height:1.5;text-align:left;}
        .ev-modal-btns{display:flex;gap:10px;}

        @media (max-width:900px){
          .ev-layout{grid-template-columns:1fr;}
          .ev-nav-panel,.ev-right-panel{display:none;}
        }
      `}</style>

      <div className="ev-app">
        {/* TOPBAR */}
        <div className="ev-topbar">
          <div className="ev-logo-row">
            <div className="ev-logo-box">🎓</div>
            <div className="ev-logo-name">Eduverify</div>
          </div>
          <span className="ev-exam-title">{exam.nombre}</span>
          <div className={`ev-timer${timerRed ? " urgent" : " normal"}`}>
            <span className="ev-timer-dot" />
            {formatTime(secondsLeft)}
          </div>
        </div>

        <div className="ev-layout">
          {/* LEFT — Question Navigator */}
          <div className="ev-nav-panel">
            <div className="ev-nav-title">Preguntas</div>
            <div className="ev-nav-progress">
              <div className="ev-nav-progress-fill" style={{ width: `${(totalAnswered / QUESTIONS.length) * 100}%` }} />
            </div>
            <div className="ev-nav-progress-label">{totalAnswered} de {QUESTIONS.length} respondidas</div>

            <div className="ev-nav-grid">
              {QUESTIONS.map((q, i) => (
                <button
                  key={q.id}
                  className={`ev-nav-btn${i === currentQ ? " active" : ""}${answered(q.id) ? " answered" : ""}`}
                  onClick={() => goTo(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="ev-nav-legend">
              <div className="ev-legend-row">
                <span className="ev-legend-box" style={{ background: "#eafff3", border: "1.5px solid #22b865" }} />
                <span>Respondida</span>
              </div>
              <div className="ev-legend-row">
                <span className="ev-legend-box" style={{ background: "#fafbfc", border: "1.5px solid #e4e7ef" }} />
                <span>Sin responder</span>
              </div>
              <div className="ev-legend-row">
                <span className="ev-legend-box" style={{ background: "#12213f", border: "1.5px solid #12213f" }} />
                <span>Actual</span>
              </div>
            </div>
          </div>

          {/* CENTER — Question */}
          <div className="ev-question-area">
            <div className="ev-q-header">
              <span className="ev-q-num-badge">Pregunta {currentQ + 1} de {QUESTIONS.length}</span>
              <span className="ev-q-type-badge">
                {question.tipo === "opcion_multiple" ? "Opción múltiple" : "Respuesta libre"}
              </span>
            </div>

            <div className="ev-q-card">
              <div className="ev-q-text">{question.pregunta}</div>

              {question.tipo === "opcion_multiple" && (
                <div className="ev-options-list">
                  {question.opciones.map((op, i) => {
                    const isSelected = answers[question.id] === op;
                    return (
                      <button
                        key={i}
                        className={`ev-option-btn${isSelected ? " selected" : ""}`}
                        onClick={() => setAnswer(question.id, op)}
                      >
                        <div className="ev-option-radio">
                          <span className="ev-option-radio-dot" />
                        </div>
                        {op}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.tipo === "texto_libre" && (
                <>
                  <textarea
                    className="ev-textarea"
                    placeholder="Escribe tu respuesta aquí..."
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswer(question.id, e.target.value)}
                    maxLength={800}
                  />
                  <div className="ev-textarea-count">
                    {(answers[question.id] || "").length}/800 caracteres
                  </div>
                </>
              )}
            </div>

            <div className="ev-q-nav-row">
              <button className="ev-nav-arrow" onClick={() => goTo(currentQ - 1)} disabled={currentQ === 0}>
                <i className="ti ti-arrow-left" /> Anterior
              </button>

              {currentQ < QUESTIONS.length - 1 ? (
                <button className="ev-nav-arrow" onClick={() => goTo(currentQ + 1)}>
                  Siguiente <i className="ti ti-arrow-right" />
                </button>
              ) : (
                <button className="ev-btn-submit-exam" onClick={() => setShowSubmitModal(true)}>
                  <i className="ti ti-check" /> Finalizar examen
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — Camera + Status */}
          <div className="ev-right-panel">
            <div className={`ev-cam-widget${camGranted ? "" : " off"}`}>
              <div className="ev-cam-preview">
                <video
                  ref={videoRef}
                  className="ev-cam-video"
                  autoPlay
                  playsInline
                  muted
                  style={{ display: camGranted ? "block" : "none" }}
                />
                {!camGranted && <div className="ev-cam-sim-face" />}
                <span className="ev-cam-live-badge">
                  <span className="ev-cam-live-dot" /> {camGranted ? "EN VIVO" : "SIN SEÑAL"}
                </span>
              </div>
              <div className="ev-cam-footer">
                <span>María Gonzáles</span>
                <span style={{ color: camGranted ? "#5fe0a0" : "#ff9a9a" }}>{camGranted ? "● Activa" : "● Inactiva"}</span>
              </div>
            </div>

            <div className="ev-status-section">
              <h4>Estado de sesión</h4>
              <div className="ev-status-item">
                <span className="ev-status-dot" style={{ background: "#22b865" }} />
                Conexión estable
              </div>
              <div className="ev-status-item">
                <span className="ev-status-dot" style={{ background: camGranted ? "#22b865" : "#e05252" }} />
                Cámara activa
              </div>
              <div className="ev-status-item">
                <span className="ev-status-dot" style={{ background: camGranted ? "#22b865" : "#e05252" }} />
                Rostro detectado
              </div>
              <div className="ev-status-item">
                <span className="ev-status-dot" style={{ background: "#4f7cff" }} />
                Respuestas guardadas
              </div>
              <div className="ev-status-item">
                <span className="ev-status-dot" style={{ background: incidents.length > 0 ? "#e05252" : "#4f7cff" }} />
                Incidencias registradas: {incidents.length}
              </div>
            </div>

            <div className="ev-status-section">
              <h4>Progreso</h4>
              <div style={{ background: "#fafbfc", border: "1px solid #ececec", borderRadius: "12px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11.5px", color: "#8c92a4" }}>Respondidas</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#22b865" }}>{totalAnswered}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11.5px", color: "#8c92a4" }}>Sin responder</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: QUESTIONS.length - totalAnswered > 0 ? "#e05252" : "#8c92a4" }}>
                    {QUESTIONS.length - totalAnswered}
                  </span>
                </div>
                <div style={{ height: "6px", background: "#f0f1f4", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(totalAnswered / QUESTIONS.length) * 100}%`, background: "#22b865", borderRadius: "6px", transition: "width .3s" }} />
                </div>
              </div>
            </div>

            <div className="ev-status-section">
              <h4>Simular incidencia (demo)</h4>
              <div className="ev-incident-grid">
                {INCIDENT_TYPES.map((inc) => (
                  <button key={inc.id} className="ev-incident-btn" onClick={() => reportIncident(inc)}>
                    <i className={`ti ${inc.icon}`} /> {inc.label}
                  </button>
                ))}
              </div>
              {incidents.length > 0 && (
                <div className="ev-incident-log">
                  {incidents.slice(0, 4).map((inc, i) => (
                    <div className="ev-incident-log-item" key={i}>
                      <span><i className={`ti ${inc.icon}`} /> {inc.label}</span>
                      <span className="ev-incident-log-time">{inc.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="ev-toast"><i className="ti ti-alert-triangle" /> {toast}</div>}

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="ev-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ev-modal-icon"><i className="ti ti-clipboard-check" /></div>
            <h2>¿Enviar tu examen?</h2>
            <p>Esta acción no se puede deshacer. Revisa que hayas respondido todo antes de confirmar.</p>

            <div className="ev-modal-summary">
              <div className="ev-modal-stat">
                <div className="ev-modal-stat-value">{QUESTIONS.length}</div>
                <div className="ev-modal-stat-label">Preguntas</div>
              </div>
              <div className="ev-modal-stat">
                <div className="ev-modal-stat-value">{totalAnswered}</div>
                <div className="ev-modal-stat-label">Respondidas</div>
              </div>
              <div className="ev-modal-stat">
                <div className={`ev-modal-stat-value${QUESTIONS.length - totalAnswered > 0 ? " warn" : ""}`}>
                  {QUESTIONS.length - totalAnswered}
                </div>
                <div className="ev-modal-stat-label">Sin responder</div>
              </div>
            </div>

            {QUESTIONS.length - totalAnswered > 0 && (
              <div className="ev-modal-warn">
                <i className="ti ti-alert-triangle" /> Tienes <b>{QUESTIONS.length - totalAnswered} {QUESTIONS.length - totalAnswered === 1 ? "pregunta" : "preguntas"} sin responder</b>. Si envías ahora quedarán en blanco.
              </div>
            )}

            <div className="ev-modal-btns">
              <Button variant="ghost" size="md" icon="ti-arrow-left" style={{ flex: 1 }} onClick={() => setShowSubmitModal(false)}>
                Volver
              </Button>
              <Button
                variant="primary"
                size="md"
                icon="ti-check"
                style={{ flex: 1.4 }}
                onClick={() => {
                  stopCamera();
                  navigate(`/student/submit-exam/${examId}`);
                }}
              >
                Enviar examen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}