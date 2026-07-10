import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TEACHER = { nombre: "Roberto", apellido: "Salas", institucion: "Universidad Nacional" };

const EXAMS = [
  { id: 1, nombre: "Cálculo Diferencial - Parcial 2", curso: "Matemática II", fecha: "2026-06-21", hora: "09:00", duracion: 90, estado: "en_curso", inscritos: 32, conectados: 29, alertas: 4 },
  { id: 2, nombre: "Estructuras de Datos - Final", curso: "Programación III", fecha: "2026-06-25", hora: "14:30", duracion: 120, estado: "programado", inscritos: 28, conectados: 0, alertas: 0 },
  { id: 3, nombre: "Bases de Datos - Quiz 3", curso: "Bases de Datos", fecha: "2026-06-28", hora: "11:00", duracion: 45, estado: "programado", inscritos: 25, conectados: 0, alertas: 0 },
  { id: 4, nombre: "Física General - Parcial 1", curso: "Física I", fecha: "2026-06-10", hora: "10:00", duracion: 90, estado: "finalizado", inscritos: 30, conectados: 30, alertas: 7 },
  { id: 5, nombre: "Álgebra Lineal - Quiz 1", curso: "Matemática I", fecha: "2026-06-02", hora: "08:00", duracion: 40, estado: "finalizado", inscritos: 35, conectados: 33, alertas: 2 },
];

const ALERTS = [
  { id: 1, examenId: 1, estudiante: "Carlos Mendoza", tipo: "Ausencia de rostro", hora: "09:14", severidad: "alta" },
  { id: 2, examenId: 1, estudiante: "Ana Torres", tipo: "Pérdida de conexión", hora: "09:21", severidad: "media" },
  { id: 3, examenId: 1, estudiante: "Diego Vargas", tipo: "Múltiples rostros detectados", hora: "09:33", severidad: "alta" },
  { id: 4, examenId: 1, estudiante: "Valeria Quispe", tipo: "Ausencia de rostro", hora: "09:40", severidad: "media" },
  { id: 5, examenId: 4, estudiante: "Jorge Lima", tipo: "Múltiples rostros detectados", hora: "10:18", severidad: "alta" },
];

const STATUS_META = {
  programado: { label: "Programado", color: "#4f7cff", bg: "#f0f4ff" },
  en_curso: { label: "En curso", color: "#22b865", bg: "#eafff3" },
  finalizado: { label: "Finalizado", color: "#8c92a4", bg: "#f3f4f7" },
};

const SEVERITY_META = {
  alta: { color: "#e05252", bg: "#fdeaea", label: "Alta" },
  media: { color: "#f0a500", bg: "#fff6e0", label: "Media" },
};

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "en_curso", label: "En curso" },
  { id: "programado", label: "Programados" },
  { id: "finalizado", label: "Finalizados" },
];

export default function EduverifyTeacherDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("todos");
  const [monitorExam, setMonitorExam] = useState(undefined);

  const filtered = EXAMS.filter((e) => filter === "todos" || e.estado === filter);
  const enCurso = EXAMS.filter((e) => e.estado === "en_curso").length;
  const programados = EXAMS.filter((e) => e.estado === "programado").length;
  const totalInscritos = EXAMS.reduce((a, e) => a + e.inscritos, 0);
  const totalAlertas = EXAMS.reduce((a, e) => a + e.alertas, 0);

  const examAlerts = monitorExam ? ALERTS.filter((a) => a.examenId === monitorExam.id) : [];

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

        .ev-main{max-width:1140px;margin:0 auto;padding:2rem;}
        .ev-welcome-row{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:1.75rem;gap:14px;flex-wrap:wrap;}
        .ev-welcome h1{font-family:'Lora',serif;font-size:26px;font-weight:500;color:#12213f;margin-bottom:5px;}
        .ev-welcome p{font-size:14px;color:#8c92a4;}
        .ev-btn-new{background:#12213f;color:#fff;border:none;border-radius:10px;padding:11px 18px;font-size:13.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:7px;transition:background .2s;white-space:nowrap;}
        .ev-btn-new:hover{background:#1e3260;}

        .ev-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:2rem;}
        .ev-stat-card{background:#fff;border-radius:14px;padding:1.2rem;box-shadow:0 1px 3px rgba(0,0,0,0.04);border:1px solid #ececec;}
        .ev-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;}
        .ev-stat-value{font-family:'Lora',serif;font-size:24px;font-weight:600;color:#12213f;line-height:1;margin-bottom:3px;}
        .ev-stat-label{font-size:12px;color:#8c92a4;}

        .ev-grid-cols{display:grid;grid-template-columns:1.6fr 1fr;gap:1.5rem;align-items:start;}

        .ev-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;}
        .ev-section-head h2{font-family:'Lora',serif;font-size:18px;font-weight:500;color:#12213f;}
        .ev-tabs{display:flex;gap:6px;background:#fff;border:1px solid #ececec;border-radius:10px;padding:3px;}
        .ev-tab{padding:7px 13px;border:none;background:transparent;border-radius:7px;font-size:12.5px;color:#8c92a4;cursor:pointer;transition:all .15s;}
        .ev-tab.active{background:#12213f;color:#fff;font-weight:500;}

        .ev-exam-grid{display:flex;flex-direction:column;gap:10px;}
        .ev-exam-card{background:#fff;border-radius:14px;padding:1.1rem 1.3rem;border:1px solid #ececec;transition:box-shadow .15s,border-color .15s;}
        .ev-exam-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.06);border-color:#dadde6;}
        .ev-exam-top{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
        .ev-exam-date{width:50px;text-align:center;flex-shrink:0;}
        .ev-exam-date-day{font-family:'Lora',serif;font-size:19px;font-weight:600;color:#12213f;line-height:1.1;}
        .ev-exam-date-month{font-size:10.5px;color:#8c92a4;text-transform:uppercase;letter-spacing:.04em;}
        .ev-exam-info{flex:1;min-width:200px;}
        .ev-exam-title{font-size:14.5px;font-weight:500;color:#12213f;margin-bottom:3px;}
        .ev-exam-meta{font-size:12px;color:#8c92a4;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
        .ev-exam-meta span:not(:last-child)::after{content:'•';margin-left:6px;color:#d4d7e0;}
        .ev-status-badge{font-size:11px;font-weight:500;padding:5px 11px;border-radius:20px;white-space:nowrap;}
        .ev-exam-stats-row{display:flex;gap:18px;margin-top:12px;padding-top:12px;border-top:1px solid #f0f1f4;flex-wrap:wrap;}
        .ev-mini-stat{font-size:12px;color:#8c92a4;display:flex;align-items:center;gap:5px;}
        .ev-mini-stat b{color:#12213f;font-weight:600;}
        .ev-mini-stat.alert b{color:#e05252;}
        .ev-exam-actions{margin-left:auto;display:flex;gap:8px;}
        .ev-btn-monitor{background:#12213f;color:#fff;border:none;border-radius:9px;padding:9px 15px;font-size:12.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .2s;white-space:nowrap;}
        .ev-btn-monitor:hover{background:#1e3260;}
        .ev-btn-secondary{background:#f3f4f7;color:#5a607a;border:none;border-radius:9px;padding:9px 14px;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:background .2s;}
        .ev-btn-secondary:hover{background:#e8eaf0;}

        .ev-empty{text-align:center;padding:3rem 1rem;color:#b0b5c4;font-size:13.5px;background:#fff;border-radius:14px;border:1px dashed #e4e7ef;}

        /* Sidebar: incidencias */
        .ev-side-card{background:#fff;border-radius:14px;border:1px solid #ececec;padding:1.3rem;}
        .ev-side-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .ev-side-head h3{font-family:'Lora',serif;font-size:15px;font-weight:500;color:#12213f;}
        .ev-side-badge{background:#fdeaea;color:#e05252;font-size:11px;font-weight:600;padding:3px 9px;border-radius:14px;}
        .ev-alert-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #f3f4f7;}
        .ev-alert-item:last-child{border-bottom:none;}
        .ev-alert-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
        .ev-alert-text{flex:1;}
        .ev-alert-student{font-size:12.5px;font-weight:500;color:#12213f;}
        .ev-alert-type{font-size:11.5px;color:#8c92a4;margin-top:1px;}
        .ev-alert-time{font-size:10.5px;color:#b0b5c4;white-space:nowrap;margin-top:2px;}

        /* Modal monitor */
        .ev-modal-overlay{position:fixed;inset:0;background:rgba(18,33,63,0.55);display:flex;align-items:center;justify-content:center;z-index:50;padding:1.5rem;}
        .ev-modal{background:#fff;border-radius:18px;max-width:680px;width:100%;padding:1.8rem;position:relative;max-height:85vh;overflow-y:auto;}
        .ev-modal-close{position:absolute;top:1.2rem;right:1.3rem;background:none;border:none;font-size:18px;color:#b0b5c4;cursor:pointer;z-index:2;}
        .ev-modal h3{font-family:'Lora',serif;font-size:18px;font-weight:500;color:#12213f;margin-bottom:4px;padding-right:1.6rem;}
        .ev-modal-sub{font-size:13px;color:#8c92a4;margin-bottom:1.3rem;}
        .ev-monitor-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1.3rem;}
        .ev-cam-tile{background:#0d1730;border-radius:10px;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#7a99c8;font-size:11px;position:relative;overflow:hidden;}
        .ev-cam-tile.warn{background:#2a1212;color:#ff9a9a;}
        .ev-cam-tile.off{background:#1a1a1a;color:#666;}
        .ev-cam-icon{font-size:22px;}
        .ev-cam-name{position:absolute;bottom:5px;left:7px;font-size:10px;color:#fff;background:rgba(0,0,0,0.4);padding:2px 7px;border-radius:5px;}
        .ev-cam-warn-badge{position:absolute;top:5px;right:5px;background:#e05252;color:#fff;font-size:9px;font-weight:600;padding:2px 6px;border-radius:5px;}
        .ev-monitor-section-title{font-size:13px;font-weight:500;color:#12213f;margin-bottom:10px;}
        .ev-modal-alert-list{display:flex;flex-direction:column;gap:8px;}
        .ev-empty-small{text-align:center;padding:1.5rem;color:#b0b5c4;font-size:12.5px;background:#fafbfc;border-radius:10px;}

        @media (max-width:900px){
          .ev-grid-cols{grid-template-columns:1fr;}
          .ev-stats{grid-template-columns:repeat(2,1fr);}
        }
        @media (max-width:600px){
          .ev-monitor-grid{grid-template-columns:repeat(2,1fr);}
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
              <div className="ev-avatar">{TEACHER.nombre[0]}{TEACHER.apellido[0]}</div>
              <div>
                <div className="ev-user-name">{TEACHER.nombre} {TEACHER.apellido}</div>
                <div className="ev-user-role">Docente</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ev-main">
          {/* WELCOME */}
          <div className="ev-welcome-row">
            <div className="ev-welcome">
              <h1>Hola, {TEACHER.nombre} 👋</h1>
              <p>{TEACHER.institucion} — Panel de control de tus evaluaciones</p>
            </div>
            <button className="ev-btn-new" onClick={() => navigate("/teacher/create-exam")}>+ Crear examen</button>
          </div>

          {/* STATS (HU-15) */}
          <div className="ev-stats">
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#eafff3" }}>🟢</div>
              <div className="ev-stat-value">{enCurso}</div>
              <div className="ev-stat-label">Exámenes en curso</div>
            </div>
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#f0f4ff" }}>📅</div>
              <div className="ev-stat-value">{programados}</div>
              <div className="ev-stat-label">Programados</div>
            </div>
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#f3f4f7" }}>👥</div>
              <div className="ev-stat-value">{totalInscritos}</div>
              <div className="ev-stat-label">Estudiantes inscritos</div>
            </div>
            <div className="ev-stat-card">
              <div className="ev-stat-icon" style={{ background: "#fdeaea" }}>⚠️</div>
              <div className="ev-stat-value">{totalAlertas}</div>
              <div className="ev-stat-label">Incidencias totales</div>
            </div>
          </div>

          <div className="ev-grid-cols">
            {/* EXAMS LIST (HU-07) */}
            <div>
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
                  <div className="ev-empty">No tienes exámenes registrados en esta categoría.</div>
                )}
                {filtered.map((exam) => {
                  const d = new Date(exam.fecha + "T00:00:00");
                  const meta = STATUS_META[exam.estado];
                  return (
                    <div className="ev-exam-card" key={exam.id}>
                      <div className="ev-exam-top">
                        <div className="ev-exam-date">
                          <div className="ev-exam-date-day">{d.getDate()}</div>
                          <div className="ev-exam-date-month">{d.toLocaleDateString("es-PE", { month: "short" })}</div>
                        </div>
                        <div className="ev-exam-info">
                          <div className="ev-exam-title">{exam.nombre}</div>
                          <div className="ev-exam-meta">
                            <span>{exam.curso}</span>
                            <span>{exam.hora} · {exam.duracion} min</span>
                          </div>
                        </div>
                        <span className="ev-status-badge" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="ev-exam-stats-row">
                        <div className="ev-mini-stat">👥 <b>{exam.inscritos}</b> inscritos</div>
                        <div className="ev-mini-stat">📶 <b>{exam.conectados}</b> conectados</div>
                        <div className={`ev-mini-stat${exam.alertas > 0 ? " alert" : ""}`}>⚠️ <b>{exam.alertas}</b> alertas</div>
                        <div className="ev-exam-actions">
                          {exam.estado === "en_curso" && (
                            <button className="ev-btn-monitor" onClick={() => setMonitorExam(exam)}>
                              🔴 Monitorear
                            </button>
                          )}
                          {exam.estado === "programado" && (
                            <button className="ev-btn-secondary">Editar</button>
                          )}
                          {exam.estado === "finalizado" && (
                            <button className="ev-btn-secondary">Ver reporte</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SIDEBAR: ALERTAS RECIENTES (HU-14) */}
            <div className="ev-side-card">
              <div className="ev-side-head">
                <h3>Alertas recientes</h3>
                <span className="ev-side-badge">{ALERTS.length} nuevas</span>
              </div>
              {ALERTS.map((a) => {
                const sev = SEVERITY_META[a.severidad];
                return (
                  <div className="ev-alert-item" key={a.id}>
                    <span className="ev-alert-dot" style={{ background: sev.color }} />
                    <div className="ev-alert-text">
                      <div className="ev-alert-student">{a.estudiante}</div>
                      <div className="ev-alert-type">{a.tipo}</div>
                    </div>
                    <div className="ev-alert-time">{a.hora}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MONITOR MODAL (HU-13) */}
      {monitorExam !== undefined && (
        <div className="ev-modal-overlay" onClick={() => setMonitorExam(undefined)}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ev-modal-close" onClick={() => setMonitorExam(undefined)}>✕</button>
            <h3>Monitoreo en vivo — {monitorExam.nombre}</h3>
            <p className="ev-modal-sub">{monitorExam.conectados} de {monitorExam.inscritos} estudiantes conectados</p>

            <div className="ev-monitor-section-title">Transmisión de estudiantes</div>
            <div className="ev-monitor-grid">
              {["Carlos Mendoza", "Ana Torres", "Diego Vargas", "Valeria Quispe", "Luis Herrera", "Camila Ríos"].map((name) => {
                const hasAlert = examAlerts.some((a) => a.estudiante === name);
                return (
                  <div className={`ev-cam-tile${hasAlert ? " warn" : ""}`} key={name}>
                    {hasAlert && <span className="ev-cam-warn-badge">ALERTA</span>}
                    <span className="ev-cam-icon">{hasAlert ? "⚠️" : "📷"}</span>
                    <span className="ev-cam-name">{name}</span>
                  </div>
                );
              })}
            </div>

            <div className="ev-monitor-section-title">Incidencias de este examen</div>
            <div className="ev-modal-alert-list">
              {examAlerts.length === 0 && (
                <div className="ev-empty-small">No se han registrado incidencias en este examen.</div>
              )}
              {examAlerts.map((a) => {
                const sev = SEVERITY_META[a.severidad];
                return (
                  <div className="ev-alert-item" key={a.id} style={{ borderBottom: "1px solid #f3f4f7" }}>
                    <span className="ev-alert-dot" style={{ background: sev.color }} />
                    <div className="ev-alert-text">
                      <div className="ev-alert-student">{a.estudiante}</div>
                      <div className="ev-alert-type">{a.tipo}</div>
                    </div>
                    <div className="ev-alert-time">{a.hora}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
