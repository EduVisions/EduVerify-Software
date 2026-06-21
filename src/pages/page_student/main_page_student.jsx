import { useState } from "react";

const STUDENT = { nombre: "María", apellido: "Gonzáles", institucion: "Universidad Nacional" };

const EXAMS = [
  { id: 1, nombre: "Cálculo Diferencial - Parcial 2", curso: "Matemática II", docente: "Dr. Roberto Salas", fecha: "2026-06-22", hora: "09:00", duracion: 90, estado: "disponible" },
  { id: 2, nombre: "Estructuras de Datos - Final", curso: "Programación III", docente: "Ing. Lucía Fernández", fecha: "2026-06-25", hora: "14:30", duracion: 120, estado: "proximo" },
  { id: 3, nombre: "Bases de Datos - Quiz 3", curso: "Bases de Datos", docente: "Mg. Pedro Ramírez", fecha: "2026-06-28", hora: "11:00", duracion: 45, estado: "proximo" },
  { id: 4, nombre: "Física General - Parcial 1", curso: "Física I", docente: "Dr. Andrés Castillo", fecha: "2026-06-10", hora: "10:00", duracion: 90, estado: "finalizado", nota: 17 },
  { id: 5, nombre: "Inglés Técnico - Evaluación 2", curso: "Inglés Técnico", docente: "Lic. Carmen Díaz", fecha: "2026-06-05", hora: "16:00", duracion: 60, estado: "finalizado", nota: 19 },
];

// estado: "disponible" | "proximo" | "finalizado"
const STATUS_META = {
  disponible: { label: "Disponible ahora", color: "#22b865", bg: "#eafff3" },
  proximo: { label: "Próximo", color: "#4f7cff", bg: "#f0f4ff" },
  finalizado: { label: "Finalizado", color: "#8c92a4", bg: "#f3f4f7" },
};

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "disponible", label: "Disponibles" },
  { id: "proximo", label: "Próximos" },
  { id: "finalizado", label: "Finalizados" },
];

export default function EduverifyStudentDashboard() {
  const [filter, setFilter] = useState("todos");
  // cameraModal: undefined = closed | null = generic check | exam object = check before entering that exam
  const [cameraModal, setCameraModal] = useState(undefined);
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | granted | denied | notfound

  const filtered = EXAMS.filter((e) => filter === "todos" || e.estado === filter);
  const disponibles = EXAMS.filter((e) => e.estado === "disponible").length;
  const proximos = EXAMS.filter((e) => e.estado === "proximo").length;
  const finalizados = EXAMS.filter((e) => e.estado === "finalizado");
  const promedio = finalizados.length
    ? (finalizados.reduce((a, e) => a + e.nota, 0) / finalizados.length).toFixed(1)
    : "—";

  const openCameraCheck = (exam) => {
    setCameraModal(exam);
    setCameraStatus("idle");
  };

  const closeModal = () => setCameraModal(undefined);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-app{min-height:100vh;background:#f5f4f1;font-family:'DM Sans',sans-serif;}

        .ev-topbar{background:#12213f;padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;}
        .ev-logo-row{display:flex;align-items:center;gap:10px;}
        .ev-logo-box{width:34px;height:34px;background:#4f7cff;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;}
        .ev-logo-name{font-family:'Lora',serif;font-size:16px;font-weight:600;color:#fff;}
        .ev-topbar-right{display:flex;align-items:center;gap:18px;}
        .ev-bell{width:36px;height:36px;border-radius:50%;background:#1a2f55;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;position:relative;border:none;}
        .ev-bell-dot{position:absolute;top:7px;right:8px;width:7px;height:7px;border-radius:50%;background:#e05252;border:1.5px solid #1a2f55;}
        .ev-user-chip{display:flex;align-items:center;gap:9px;cursor:pointer;}
        .ev-avatar{width:34px;height:34px;border-radius:50%;background:#4f7cff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;}
        .ev-user-name{font-size:13px;color:#fff;font-weight:500;line-height:1.1;}
        .ev-user-role{font-size:11px;color:#7a99c8;}

        .ev-main{max-width:1080px;margin:0 auto;padding:2rem;}
        .ev-welcome{margin-bottom:1.75rem;}
        .ev-welcome h1{font-family:'Lora',serif;font-size:26px;font-weight:500;color:#12213f;margin-bottom:5px;}
        .ev-welcome p{font-size:14px;color:#8c92a4;}

        .ev-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:2rem;}
        .ev-stat-card{background:#fff;border-radius:14px;padding:1.2rem;box-shadow:0 1px 3px rgba(0,0,0,0.04);border:1px solid #ececec;}
        .ev-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;}
        .ev-stat-value{font-family:'Lora',serif;font-size:24px;font-weight:600;color:#12213f;line-height:1;margin-bottom:3px;}
        .ev-stat-label{font-size:12px;color:#8c92a4;}

        .ev-banner{background:linear-gradient(135deg,#12213f,#1e3260);border-radius:16px;padding:1.4rem 1.6rem;margin-bottom:2rem;display:flex;align-items:center;justify-content:space-between;color:#fff;position:relative;overflow:hidden;gap:16px;}
        .ev-banner::before{content:'';position:absolute;width:160px;height:160px;border-radius:50%;background:rgba(79,124,255,0.18);top:-60px;right:-30px;}
        .ev-banner-text{position:relative;z-index:2;}
        .ev-banner-text h3{font-family:'Lora',serif;font-size:16px;font-weight:500;margin-bottom:4px;}
        .ev-banner-text p{font-size:12.5px;color:#9bb0d6;max-width:380px;line-height:1.5;}
        .ev-banner-btn{position:relative;z-index:2;background:#4f7cff;color:#fff;border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:7px;transition:background .2s;}
        .ev-banner-btn:hover{background:#3d68e8;}

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
        .ev-btn-enter{background:#12213f;color:#fff;border:none;border-radius:9px;padding:10px 16px;font-size:12.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .2s;white-space:nowrap;}
        .ev-btn-enter:hover{background:#1e3260;}
        .ev-btn-disabled{background:#f3f4f7;color:#b0b5c4;border:none;border-radius:9px;padding:10px 16px;font-size:12.5px;cursor:not-allowed;white-space:nowrap;}
        .ev-nota-chip{background:#eafff3;color:#22b865;font-weight:600;font-size:13px;padding:8px 14px;border-radius:9px;}

        .ev-empty{text-align:center;padding:3rem 1rem;color:#b0b5c4;font-size:13.5px;background:#fff;border-radius:14px;border:1px dashed #e4e7ef;}

        .ev-modal-overlay{position:fixed;inset:0;background:rgba(18,33,63,0.55);display:flex;align-items:center;justify-content:center;z-index:50;padding:1.5rem;}
        .ev-modal{background:#fff;border-radius:18px;max-width:420px;width:100%;padding:1.8rem;position:relative;}
        .ev-modal h3{font-family:'Lora',serif;font-size:18px;font-weight:500;color:#12213f;margin-bottom:6px;padding-right:1.6rem;}
        .ev-modal-sub{font-size:13px;color:#8c92a4;margin-bottom:1.2rem;}
        .ev-camera-box{background:#0d1730;border-radius:12px;height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;margin-bottom:1.2rem;color:#7a99c8;font-size:13px;text-align:center;padding:1rem;transition:background .2s,color .2s;}
        .ev-camera-box.granted{background:#0a1f15;color:#5fe0a0;}
        .ev-camera-box.denied{background:#2a1212;color:#ff8585;}
        .ev-camera-icon{font-size:34px;}
        .ev-modal-btns{display:flex;gap:10px;}
        .ev-modal-btn{flex:1;height:42px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s;}
        .ev-modal-btn.primary{background:#12213f;color:#fff;}
        .ev-modal-btn.primary:hover{background:#1e3260;}
        .ev-modal-btn.ghost{background:#f3f4f7;color:#5a607a;}
        .ev-modal-btn.ghost:hover{background:#e8eaf0;}
        .ev-modal-close{position:absolute;top:1.2rem;right:1.3rem;background:none;border:none;font-size:18px;color:#b0b5c4;cursor:pointer;}
        .ev-test-row{display:flex;gap:8px;margin-bottom:1.2rem;}
        .ev-test-btn{flex:1;font-size:11px;padding:7px 4px;border-radius:7px;border:1px solid #e4e7ef;background:#fafbfc;color:#8c92a4;cursor:pointer;}
        .ev-test-btn:hover{background:#f0f0f0;}

        @media (max-width:760px){
          .ev-stats{grid-template-columns:repeat(2,1fr);}
          .ev-banner{flex-direction:column;align-items:flex-start;}
        }
      `}</style>

      <div className="ev-app">
        {/* TOPBAR */}
        <div className="ev-topbar">
          <div className="ev-logo-row">
            <div className="ev-logo-box">🎓</div>
            <div className="ev-logo-name">Eduverify</div>
          </div>
          <div className="ev-topbar-right">
            <button className="ev-bell" aria-label="Notificaciones">
              🔔<span className="ev-bell-dot" />
            </button>
            <div className="ev-user-chip">
              <div className="ev-avatar">{STUDENT.nombre[0]}{STUDENT.apellido[0]}</div>
              <div>
                <div className="ev-user-name">{STUDENT.nombre} {STUDENT.apellido}</div>
                <div className="ev-user-role">Estudiante</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ev-main">
          {/* WELCOME */}
          <div className="ev-welcome">
            <h1>Hola, {STUDENT.nombre} 👋</h1>
            <p>{STUDENT.institucion} — Este es el resumen de tus evaluaciones</p>
          </div>

          {/* STATS */}
          <div className="ev-stats">
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#eafff3" }}>✅</div>
              <div className="ev-stat-value">{disponibles}</div>
              <div className="ev-stat-label">Disponibles ahora</div>
            </div>
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#f0f4ff" }}>📅</div>
              <div className="ev-stat-value">{proximos}</div>
              <div className="ev-stat-label">Próximos exámenes</div>
            </div>
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#f3f4f7" }}>📄</div>
              <div className="ev-stat-value">{finalizados.length}</div>
              <div className="ev-stat-label">Exámenes finalizados</div>
            </div>
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#fff4e0" }}>⭐</div>
              <div className="ev-stat-value">{promedio}</div>
              <div className="ev-stat-label">Promedio general</div>
            </div>
          </div>

          {/* CAMERA CHECK BANNER (HU-04) */}
          <div className="ev-banner">
            <div className="ev-banner-text">
              <h3>Verifica tu cámara antes de un examen</h3>
              <p>Necesitamos confirmar el acceso a tu cámara web para habilitar la supervisión durante tus evaluaciones.</p>
            </div>
            <button className="ev-banner-btn" onClick={() => openCameraCheck(null)}>
              📷 Probar cámara
            </button>
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
              const meta = STATUS_META[exam.estado];
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
                    {exam.estado === "disponible" && (
                      <button className="ev-btn-enter" onClick={() => openCameraCheck(exam)}>
                        Ingresar →
                      </button>
                    )}
                    {exam.estado === "proximo" && (
                      <button className="ev-btn-disabled" disabled>
                        No disponible
                      </button>
                    )}
                    {exam.estado === "finalizado" && (
                      <span className="ev-nota-chip">Nota: {exam.nota}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CAMERA CHECK MODAL (HU-04) */}
      {cameraModal !== undefined && (
        <div className="ev-modal-overlay" onClick={closeModal}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ev-modal-close" onClick={closeModal}>✕</button>
            <h3>{cameraModal ? `Acceso a cámara — ${cameraModal.nombre}` : "Verificación de cámara"}</h3>
            <p className="ev-modal-sub">Eduverify necesita acceso a tu cámara web para la supervisión del examen.</p>

            <div className={`ev-camera-box${cameraStatus === "granted" ? " granted" : ""}${cameraStatus === "denied" || cameraStatus === "notfound" ? " denied" : ""}`}>
              {cameraStatus === "idle" && <><span className="ev-camera-icon">📷</span><span>Esperando permiso de cámara...</span></>}
              {cameraStatus === "granted" && <><span className="ev-camera-icon">✅</span><span>Cámara detectada correctamente. Transmisión activa.</span></>}
              {cameraStatus === "denied" && <><span className="ev-camera-icon">🚫</span><span>Permiso denegado. La cámara es necesaria para la supervisión.</span></>}
              {cameraStatus === "notfound" && <><span className="ev-camera-icon">⚠️</span><span>No se encontró un dispositivo de cámara compatible.</span></>}
            </div>

            {/* Botones de prueba: en producción esto vendría del navigator.mediaDevices */}
            <div className="ev-test-row">
              <button className="ev-test-btn" onClick={() => setCameraStatus("granted")}>Simular: Aceptado</button>
              <button className="ev-test-btn" onClick={() => setCameraStatus("denied")}>Simular: Denegado</button>
              <button className="ev-test-btn" onClick={() => setCameraStatus("notfound")}>Simular: Sin cámara</button>
            </div>

            <div className="ev-modal-btns">
              <button className="ev-modal-btn ghost" onClick={closeModal}>Cancelar</button>
              <button
                className="ev-modal-btn primary"
                disabled={cameraStatus !== "granted"}
                style={cameraStatus !== "granted" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                onClick={closeModal}
              >
                {cameraModal ? "Ingresar al examen" : "Listo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}