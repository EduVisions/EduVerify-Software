import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useExams } from "../../hooks/useExams.js";
import { STUDENT_STATUS_META } from "../../data/mockExams.js";
import TopBar from "../../components/TopBar.jsx";
import StatCard from "../../components/StatCard.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "disponible", label: "Disponibles" },
  { id: "proximo", label: "Próximos" },
  { id: "finalizado", label: "Finalizados" },
];

export default function EduverifyStudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exams } = useExams();
  // Fallback por si se entra por URL directa sin login (no hay rutas
  // protegidas todavía, ver plan del refactor).
  const student = user || { nombre: "Invitado", apellido: "", institucion: "Eduverify" };
  const [filter, setFilter] = useState("todos");
  const [cameraTestOpen, setCameraTestOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | requesting | granted | denied | notfound
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setCameraStatus("requesting");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus("notfound");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraStatus("granted");
    } catch (err) {
      if (err && err.name === "NotFoundError") setCameraStatus("notfound");
      else if (err && err.name === "NotAllowedError") setCameraStatus("denied");
      else setCameraStatus("notfound");
    }
  }, []);

  useEffect(() => {
    if (!cameraTestOpen) return;
    const t = setTimeout(requestCamera, 0);
    return () => {
      clearTimeout(t);
      stopStream();
    };
  }, [cameraTestOpen, requestCamera, stopStream]);

  const filtered = exams.filter((e) => filter === "todos" || STUDENT_STATUS_META[e.estado].key === filter);
  const disponibles = exams.filter((e) => STUDENT_STATUS_META[e.estado].key === "disponible").length;
  const proximos = exams.filter((e) => STUDENT_STATUS_META[e.estado].key === "proximo").length;
  const finalizados = exams.filter((e) => STUDENT_STATUS_META[e.estado].key === "finalizado");
  const promedio = finalizados.length
    ? (finalizados.reduce((a, e) => a + e.nota, 0) / finalizados.length).toFixed(1)
    : "—";

  const openCameraTest = () => {
    setCameraTestOpen(true);
    setCameraStatus("idle");
  };

  const closeCameraTest = () => setCameraTestOpen(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-app{min-height:100vh;background:var(--ev-bg-page);font-family:var(--ev-font-sans);}

        .ev-main{max-width:1080px;margin:0 auto;padding:2rem;}
        .ev-welcome{margin-bottom:1.75rem;}
        .ev-welcome h1{font-family:var(--ev-font-serif);font-size:26px;font-weight:500;color:var(--ev-navy);margin-bottom:5px;}
        .ev-welcome p{font-size:14px;color:var(--ev-text-muted);}

        .ev-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:2rem;}

        .ev-banner{background:linear-gradient(135deg,#12213f,#1e3260);border-radius:16px;padding:1.4rem 1.6rem;margin-bottom:2rem;display:flex;align-items:center;justify-content:space-between;color:#fff;position:relative;overflow:hidden;gap:16px;}
        .ev-banner::before{content:'';position:absolute;width:160px;height:160px;border-radius:50%;background:rgba(79,124,255,0.18);top:-60px;right:-30px;}
        .ev-banner-text{position:relative;z-index:2;}
        .ev-banner-text h3{font-family:'Lora',serif;font-size:16px;font-weight:500;margin-bottom:4px;}
        .ev-banner-text p{font-size:12.5px;color:#9bb0d6;max-width:380px;line-height:1.5;}

        .ev-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;}
        .ev-section-head h2{font-family:'Lora',serif;font-size:18px;font-weight:500;color:#12213f;}
        .ev-tabs{display:flex;gap:6px;background:#fff;border:1px solid #ececec;border-radius:10px;padding:3px;}
        .ev-tab{padding:7px 13px;border:none;background:transparent;border-radius:7px;font-size:12.5px;color:#8c92a4;cursor:pointer;transition:all .15s;}
        .ev-tab.active{background:#12213f;color:#fff;font-weight:500;}

        .ev-exam-grid{display:flex;flex-direction:column;gap:10px;margin-bottom:2.5rem;}
        .ev-exam-card{background:#fff;border-radius:14px;padding:1.1rem 1.3rem;border:1px solid #ececec;display:flex;align-items:center;gap:16px;transition:box-shadow .15s,border-color .15s;flex-wrap:wrap;}
        .ev-exam-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.06);border-color:#dadde6;}
        .ev-exam-date{width:54px;text-align:center;flex-shrink:0;}
        .ev-exam-date-day{font-family:'Lora',serif;font-size:20px;font-weight:600;color:#12213f;line-height:1.1;}
        .ev-exam-date-month{font-size:11px;color:#8c92a4;text-transform:uppercase;letter-spacing:.04em;}
        .ev-exam-info{flex:1;min-width:200px;}
        .ev-exam-title{font-size:14.5px;font-weight:500;color:#12213f;margin-bottom:3px;}
        .ev-exam-meta{font-size:12px;color:#8c92a4;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
        .ev-exam-meta span:not(:last-child)::after{content:'•';margin-left:6px;color:#d4d7e0;}
        .ev-status-badge{font-size:11px;font-weight:500;padding:5px 11px;border-radius:20px;white-space:nowrap;}
        .ev-nota-chip{background:#eafff3;color:#22b865;font-weight:600;font-size:13px;padding:8px 14px;border-radius:9px;}

        .ev-empty{text-align:center;padding:3rem 1rem;color:#b0b5c4;font-size:13.5px;background:#fff;border-radius:14px;border:1px dashed #e4e7ef;}

        .ev-camera-box{background:#0d1730;border-radius:12px;height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;margin-bottom:1.2rem;color:#7a99c8;font-size:13px;text-align:center;padding:1rem;transition:background .2s,color .2s;position:relative;overflow:hidden;}
        .ev-camera-box.granted{background:#0a1f15;color:#5fe0a0;padding:0;}
        .ev-camera-box.denied{background:#2a1212;color:#ff8585;}
        .ev-camera-icon{font-size:34px;}
        .ev-camera-icon.ti-loader-2{animation:spin .8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ev-camera-video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);}
        .ev-camera-live-badge{position:absolute;top:8px;left:8px;background:rgba(34,184,101,0.18);border:1px solid #22b865;color:#5fe0a0;font-size:10px;font-weight:600;padding:3px 9px;border-radius:14px;display:flex;align-items:center;gap:5px;}
        .ev-camera-live-dot{width:6px;height:6px;border-radius:50%;background:#e05252;animation:pulse 1.2s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .ev-modal-btns{display:flex;gap:10px;}

        @media (max-width:760px){
          .ev-stats{grid-template-columns:repeat(2,1fr);}
          .ev-banner{flex-direction:column;align-items:flex-start;}
        }
      `}</style>

      <div className="ev-app">
        <TopBar roleLabel="Estudiante" />

        <div className="ev-main">
          {/* WELCOME */}
          <div className="ev-welcome">
            <h1>Hola, {student.nombre}</h1>
            <p>{student.institucion} — Este es el resumen de tus evaluaciones</p>
          </div>

          {/* STATS */}
          <div className="ev-stats">
            <StatCard icon="ti-circle-check" iconColor="#22b865" iconBg="#eafff3" value={disponibles} label="Disponibles ahora" />
            <StatCard icon="ti-calendar-event" iconColor="#4f7cff" iconBg="#f0f4ff" value={proximos} label="Próximos exámenes" />
            <StatCard icon="ti-file-text" iconColor="#8c92a4" iconBg="#f3f4f7" value={finalizados.length} label="Exámenes finalizados" />
            <StatCard icon="ti-star" iconColor="#e08a00" iconBg="#fff4e0" value={promedio} label="Promedio general" />
          </div>

          {/* CAMERA CHECK BANNER (HU-04) */}
          <div className="ev-banner">
            <div className="ev-banner-text">
              <h3>Verifica tu cámara antes de un examen</h3>
              <p>Necesitamos confirmar el acceso a tu cámara web para habilitar la supervisión durante tus evaluaciones.</p>
            </div>
            <Button variant="primary" size="sm" icon="ti-camera" onClick={openCameraTest} style={{ background: "#4f7cff", zIndex: 2, position: "relative" }}>
              Probar cámara
            </Button>
          </div>

          {/* EXAMS SECTION (HU-08) */}
          <div className="ev-section-head">
            <h2>Mis exámenes</h2>
            <div className="ev-tabs">
              {FILTERS.map((t) => (
                <button
                  key={t.id}
                  className={`ev-tab${filter === t.id ? " active" : ""}`}
                  onClick={() => setFilter(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ev-exam-grid">
            {filtered.length === 0 && (
              <div className="ev-empty">No tienes exámenes en esta categoría.</div>
            )}
            {filtered.map((exam) => {
              const d = new Date(exam.fecha + "T00:00:00");
              const meta = STUDENT_STATUS_META[exam.estado];
              return (
                <div className="ev-exam-card" key={exam.id}>
                  <div className="ev-exam-date">
                    <div className="ev-exam-date-day">{d.getDate()}</div>
                    <div className="ev-exam-date-month">{d.toLocaleDateString("es-PE", { month: "short" })}</div>
                  </div>
                  <div className="ev-exam-info">
                    <div className="ev-exam-title">{exam.nombre}</div>
                    <div className="ev-exam-meta">
                      <span>{exam.curso}</span>
                      <span>{exam.docente}</span>
                      <span>{exam.hora} · {exam.duracion} min</span>
                    </div>
                  </div>
                  <span className="ev-status-badge" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                  <div>
                    {meta.key === "disponible" && (
                      <Button variant="primary" size="sm" icon="ti-arrow-right" iconPosition="right" onClick={() => navigate(`/student/camera-check/${exam.id}`)}>
                        Ingresar
                      </Button>
                    )}
                    {meta.key === "proximo" && (
                      <Button variant="ghost" size="sm" disabled>
                        No disponible
                      </Button>
                    )}
                    {meta.key === "finalizado" && (
                      <span className="ev-nota-chip">Nota: {exam.nota}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CAMERA TEST MODAL (HU-04) */}
      <Modal
        open={cameraTestOpen}
        onClose={closeCameraTest}
        title="Verificación de cámara"
        subtitle="Eduverify necesita acceso a tu cámara web para la supervisión del examen."
      >
            <div className={`ev-camera-box${cameraStatus === "granted" ? " granted" : ""}${cameraStatus === "denied" || cameraStatus === "notfound" ? " denied" : ""}`}>
              <video
                ref={videoRef}
                className="ev-camera-video"
                autoPlay
                playsInline
                muted
                style={{ display: cameraStatus === "granted" ? "block" : "none" }}
              />
              {cameraStatus === "idle" && <><i className="ti ti-camera ev-camera-icon" /><span>Preparando cámara...</span></>}
              {cameraStatus === "requesting" && <><i className="ti ti-loader-2 ev-camera-icon" /><span>Solicitando permiso de cámara en tu navegador...</span></>}
              {cameraStatus === "granted" && (
                <span className="ev-camera-live-badge"><span className="ev-camera-live-dot" /> EN VIVO</span>
              )}
              {cameraStatus === "denied" && <><i className="ti ti-camera-off ev-camera-icon" /><span>Permiso denegado. La cámara es necesaria para la supervisión.</span></>}
              {cameraStatus === "notfound" && <><i className="ti ti-alert-triangle ev-camera-icon" /><span>No se encontró un dispositivo de cámara compatible.</span></>}
            </div>

        {(cameraStatus === "denied" || cameraStatus === "notfound") && (
          <div style={{ display: "flex", marginBottom: "1.2rem" }}>
            <Button variant="ghost" size="sm" fullWidth icon="ti-refresh" onClick={requestCamera}>Reintentar</Button>
          </div>
        )}

        <div className="ev-modal-btns">
          <Button variant="ghost" size="sm" onClick={closeCameraTest} style={{ flex: 1 }}>Cancelar</Button>
          <Button
            variant="primary"
            size="sm"
            disabled={cameraStatus !== "granted"}
            style={{ flex: 1 }}
            onClick={() => {
              stopStream();
              closeCameraTest();
            }}
          >
            Listo
          </Button>
        </div>
      </Modal>
    </>
  );
}
