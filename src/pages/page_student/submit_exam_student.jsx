import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EXAM = {
  nombre: "Cálculo Diferencial - Parcial 2",
  curso: "Matemática II",
  docente: "Dr. Roberto Salas",
  duracion: 90,
};

const STUDENT = { nombre: "María", apellido: "Gonzáles" };

const ANSWER_SUMMARY = {
  total: 20,
  respondidas: 18,
  sinResponder: 2,
};

const SESSION_LOG = [
  { label: "Inicio del examen", time: "09:00:14", icon: "▶️" },
  { label: "Verificación de cámara exitosa", time: "09:00:08", icon: "📷" },
  { label: "Incidencias detectadas", time: "2 alertas menores", icon: "⚠️" },
  { label: "Envío del examen", time: "10:24:51", icon: "✅" },
];

// Estados del flujo: confirming (antes de enviar) -> submitting -> submitted | error
export default function EduverifySubmitExam() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("confirming");
  const [progress, setProgress] = useState(0);
  const [confirmationCode] = useState("EV-483921");

  useEffect(() => {
    if (phase !== "submitting") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "submitting" && progress >= 100) {
      const t = setTimeout(() => setPhase("submitted"), 400);
      return () => clearTimeout(t);
    }
  }, [phase, progress]);

  const handleConfirmSubmit = () => {
    setProgress(0);
    setPhase("submitting");
  };

  const handleRetry = () => {
    setPhase("confirming");
  };

  // Escenario alterno: simular fallo de envío (problema de red, por ejemplo)
  const simulateError = () => {
    setProgress(0);
    setPhase("submitting");
    setTimeout(() => setPhase("error"), 1400);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-wrap{min-height:100vh;background:#f5f4f1;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif;}
        .ev-card{width:100%;max-width:520px;background:#fff;border-radius:22px;border:1px solid #ececec;box-shadow:0 20px 60px rgba(0,0,0,0.06);overflow:hidden;}

        /* CONFIRMING PHASE */
        .ev-confirm-header{background:#12213f;padding:2rem 2rem 1.6rem;text-align:center;position:relative;overflow:hidden;}
        .ev-confirm-header::before{content:'';position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(79,124,255,0.15);top:-80px;right:-50px;}
        .ev-confirm-icon{font-size:40px;margin-bottom:10px;position:relative;z-index:2;}
        .ev-confirm-header h1{font-family:'Lora',serif;font-size:20px;font-weight:500;color:#fff;margin-bottom:4px;position:relative;z-index:2;}
        .ev-confirm-header p{font-size:12.5px;color:#9bb0d6;position:relative;z-index:2;}

        .ev-body{padding:1.8rem 2rem;}

        .ev-progress-summary{display:flex;gap:10px;margin-bottom:1.4rem;}
        .ev-psum-card{flex:1;background:#fafbfc;border:1px solid #ececec;border-radius:13px;padding:1rem 0.6rem;text-align:center;}
        .ev-psum-value{font-family:'Lora',serif;font-size:22px;font-weight:600;color:#12213f;line-height:1;margin-bottom:4px;}
        .ev-psum-label{font-size:10.5px;color:#8c92a4;text-transform:uppercase;letter-spacing:.03em;}
        .ev-psum-card.warn .ev-psum-value{color:#e08a00;}

        .ev-warn-box{background:#fff6e0;border:1px solid #ffe1a3;border-radius:12px;padding:12px 14px;margin-bottom:1.3rem;display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:#8a6200;line-height:1.6;}

        .ev-exam-recap{background:#fafbfc;border:1px solid #ececec;border-radius:13px;padding:1rem 1.1rem;margin-bottom:1.4rem;}
        .ev-recap-title{font-size:14px;font-weight:500;color:#12213f;margin-bottom:3px;}
        .ev-recap-meta{font-size:12px;color:#8c92a4;}

        .ev-btn-row{display:flex;gap:10px;}
        .ev-btn-back{flex:1;height:48px;background:#f3f4f7;color:#5a607a;border:none;border-radius:11px;font-size:13.5px;font-weight:500;cursor:pointer;transition:background .2s;}
        .ev-btn-back:hover{background:#e8eaf0;}
        .ev-btn-submit{flex:1.4;height:48px;background:#12213f;color:#fff;border:none;border-radius:11px;font-size:13.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,transform .1s;}
        .ev-btn-submit:hover{background:#1e3260;}
        .ev-btn-submit:active{transform:scale(.98);}

        .ev-dev-note{text-align:center;margin-top:1rem;font-size:10.5px;color:#c4c8d4;cursor:pointer;background:none;border:none;text-decoration:underline;}

        /* SUBMITTING PHASE */
        .ev-submitting{padding:3rem 2rem;text-align:center;}
        .ev-submitting-icon{font-size:44px;margin-bottom:1.2rem;animation:floaty 1.6s ease-in-out infinite;}
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .ev-submitting h2{font-family:'Lora',serif;font-size:18px;font-weight:500;color:#12213f;margin-bottom:6px;}
        .ev-submitting p{font-size:13px;color:#8c92a4;margin-bottom:1.6rem;}
        .ev-progress-track{height:8px;background:#f0f1f4;border-radius:8px;overflow:hidden;margin-bottom:8px;}
        .ev-progress-fill{height:100%;background:linear-gradient(90deg,#4f7cff,#22b865);border-radius:8px;transition:width .1s linear;}
        .ev-progress-pct{font-size:11.5px;color:#b0b5c4;}

        /* SUBMITTED PHASE */
        .ev-submitted{padding:2.2rem 2rem;text-align:center;}
        .ev-check-circle{width:76px;height:76px;border-radius:50%;background:#eafff3;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 1.2rem;animation:popIn .4s ease;}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0;}70%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;}}
        .ev-submitted h2{font-family:'Lora',serif;font-size:21px;font-weight:500;color:#12213f;margin-bottom:6px;}
        .ev-submitted p{font-size:13.5px;color:#8c92a4;margin-bottom:1.6rem;line-height:1.6;}

        .ev-receipt{background:#fafbfc;border:1px solid #ececec;border-radius:13px;padding:1.1rem 1.2rem;margin-bottom:1.5rem;text-align:left;}
        .ev-receipt-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f1f4;font-size:12.5px;}
        .ev-receipt-row:last-child{border-bottom:none;}
        .ev-receipt-label{color:#8c92a4;}
        .ev-receipt-value{color:#12213f;font-weight:500;}

        .ev-log-title{font-size:12px;font-weight:500;color:#5a607a;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px;text-align:left;}
        .ev-log-list{text-align:left;margin-bottom:1.6rem;}
        .ev-log-item{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:12.5px;color:#5a607a;}
        .ev-log-icon{width:24px;height:24px;border-radius:50%;background:#f0f4ff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;}
        .ev-log-time{margin-left:auto;color:#b0b5c4;font-size:11px;white-space:nowrap;}

        .ev-btn-finish{width:100%;height:48px;background:#12213f;color:#fff;border:none;border-radius:11px;font-size:14px;font-weight:500;cursor:pointer;transition:background .2s;}
        .ev-btn-finish:hover{background:#1e3260;}

        /* ERROR PHASE */
        .ev-error-phase{padding:2.2rem 2rem;text-align:center;}
        .ev-error-circle{width:76px;height:76px;border-radius:50%;background:#fdeaea;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 1.2rem;}
        .ev-error-phase h2{font-family:'Lora',serif;font-size:20px;font-weight:500;color:#12213f;margin-bottom:6px;}
        .ev-error-phase p{font-size:13px;color:#8c92a4;margin-bottom:1.5rem;line-height:1.6;}
        .ev-btn-retry{width:100%;height:48px;background:#e05252;color:#fff;border:none;border-radius:11px;font-size:14px;font-weight:500;cursor:pointer;transition:background .2s;margin-bottom:10px;}
        .ev-btn-retry:hover{background:#c84545;}
        .ev-note-saved{font-size:11.5px;color:#8c92a4;background:#f3f4f7;border-radius:9px;padding:9px 12px;}
      `}</style>

      <div className="ev-wrap">
        <div className="ev-card">

          {phase === "confirming" && (
            <>
              <div className="ev-confirm-header">
                <div className="ev-confirm-icon">📝</div>
                <h1>¿Enviar examen?</h1>
                <p>Esta acción no se puede deshacer</p>
              </div>

              <div className="ev-body">
                <div className="ev-progress-summary">
                  <div className="ev-psum-card">
                    <div className="ev-psum-value">{ANSWER_SUMMARY.total}</div>
                    <div className="ev-psum-label">Preguntas</div>
                  </div>
                  <div className="ev-psum-card">
                    <div className="ev-psum-value">{ANSWER_SUMMARY.respondidas}</div>
                    <div className="ev-psum-label">Respondidas</div>
                  </div>
                  <div className="ev-psum-card warn">
                    <div className="ev-psum-value">{ANSWER_SUMMARY.sinResponder}</div>
                    <div className="ev-psum-label">Sin responder</div>
                  </div>
                </div>

                {ANSWER_SUMMARY.sinResponder > 0 && (
                  <div className="ev-warn-box">
                    ⚠️ <span>Tienes <b>{ANSWER_SUMMARY.sinResponder} preguntas sin responder</b>. Si envías ahora, quedarán marcadas como no respondidas.</span>
                  </div>
                )}

                <div className="ev-exam-recap">
                  <div className="ev-recap-title">{EXAM.nombre}</div>
                  <div className="ev-recap-meta">{EXAM.curso} · {EXAM.docente}</div>
                </div>

                <div className="ev-btn-row">
                  <button className="ev-btn-back" onClick={() => navigate("/student/camera-check")}>← Volver al examen</button>
                  <button className="ev-btn-submit" onClick={handleConfirmSubmit}>
                    ✓ Enviar examen
                  </button>
                </div>

                <button className="ev-dev-note" onClick={simulateError}>Simular error de envío (demo)</button>
              </div>
            </>
          )}

          {phase === "submitting" && (
            <div className="ev-submitting">
              <div className="ev-submitting-icon">📤</div>
              <h2>Enviando tu examen...</h2>
              <p>No cierres ni recargues esta ventana</p>
              <div className="ev-progress-track">
                <div className="ev-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="ev-progress-pct">{progress}%</div>
            </div>
          )}

          {phase === "submitted" && (
            <div className="ev-submitted">
              <div className="ev-check-circle">✅</div>
              <h2>¡Examen enviado con éxito!</h2>
              <p>Tu sesión fue registrada correctamente. Tu docente recibirá tus respuestas junto con el reporte de supervisión.</p>

              <div className="ev-receipt">
                <div className="ev-receipt-row">
                  <span className="ev-receipt-label">Examen</span>
                  <span className="ev-receipt-value">{EXAM.nombre}</span>
                </div>
                <div className="ev-receipt-row">
                  <span className="ev-receipt-label">Estudiante</span>
                  <span className="ev-receipt-value">{STUDENT.nombre} {STUDENT.apellido}</span>
                </div>
                <div className="ev-receipt-row">
                  <span className="ev-receipt-label">Preguntas respondidas</span>
                  <span className="ev-receipt-value">{ANSWER_SUMMARY.respondidas} / {ANSWER_SUMMARY.total}</span>
                </div>
                <div className="ev-receipt-row">
                  <span className="ev-receipt-label">Código de confirmación</span>
                  <span className="ev-receipt-value">{confirmationCode}</span>
                </div>
              </div>

              <div className="ev-log-title">Registro de la sesión</div>
              <div className="ev-log-list">
                {SESSION_LOG.map((log) => (
                  <div className="ev-log-item" key={log.label}>
                    <span className="ev-log-icon">{log.icon}</span>
                    <span>{log.label}</span>
                    <span className="ev-log-time">{log.time}</span>
                  </div>
                ))}
              </div>

              <button className="ev-btn-finish" onClick={() => navigate("/student")}>Volver a mi panel</button>
            </div>
          )}

          {phase === "error" && (
            <div className="ev-error-phase">
              <div className="ev-error-circle">⚠️</div>
              <h2>No se pudo enviar el examen</h2>
              <p>Hubo un problema de conexión al enviar tus respuestas. Tus respuestas se guardaron localmente y puedes reintentar el envío.</p>
              <button className="ev-btn-retry" onClick={handleRetry}>↻ Reintentar envío</button>
              <div className="ev-note-saved">💾 Tus respuestas están guardadas. No las perderás.</div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
