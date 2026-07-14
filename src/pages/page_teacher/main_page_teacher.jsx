import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useExams } from "../../hooks/useExams.js";
import { TEACHER_STATUS_META } from "../../data/mockExams.js";
import TopBar from "../../components/TopBar.jsx";
import StatCard from "../../components/StatCard.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";

const ALERTS = [
  { id: 1, examenId: 1, estudiante: "Carlos Mendoza", tipo: "Ausencia de rostro", hora: "09:14", severidad: "alta" },
  { id: 2, examenId: 1, estudiante: "Ana Torres", tipo: "Pérdida de conexión", hora: "09:21", severidad: "media" },
  { id: 3, examenId: 1, estudiante: "Diego Vargas", tipo: "Múltiples rostros detectados", hora: "09:33", severidad: "alta" },
  { id: 4, examenId: 1, estudiante: "Valeria Quispe", tipo: "Ausencia de rostro", hora: "09:40", severidad: "media" },
  { id: 5, examenId: 4, estudiante: "Jorge Lima", tipo: "Múltiples rostros detectados", hora: "10:18", severidad: "alta" },
];

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
  const { user } = useAuth();
  const { exams } = useExams();
  // Fallback por si se entra por URL directa sin login (no hay rutas
  // protegidas todavía, ver plan del refactor).
  const teacher = user || { nombre: "Invitado", apellido: "", institucion: "Eduverify" };
  const [filter, setFilter] = useState("todos");
  const [monitorExam, setMonitorExam] = useState(undefined);

  const filtered = exams.filter((e) => filter === "todos" || e.estado === filter);
  const enCurso = exams.filter((e) => e.estado === "en_curso").length;
  const programados = exams.filter((e) => e.estado === "programado").length;
  const totalInscritos = exams.reduce((a, e) => a + e.inscritos, 0);
  const totalAlertas = exams.reduce((a, e) => a + e.alertas, 0);

  const examAlerts = monitorExam ? ALERTS.filter((a) => a.examenId === monitorExam.id) : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-app{min-height:100vh;background:var(--ev-bg-page);font-family:var(--ev-font-sans);}

        .ev-main{max-width:1140px;margin:0 auto;padding:2rem;}
        .ev-welcome-row{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:1.75rem;gap:14px;flex-wrap:wrap;}
        .ev-welcome h1{font-family:'Lora',serif;font-size:26px;font-weight:500;color:#12213f;margin-bottom:5px;}
        .ev-welcome p{font-size:14px;color:#8c92a4;}

        .ev-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:2rem;}

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
        <TopBar roleLabel="Docente" />

        <div className="ev-main">
          {/* WELCOME */}
          <div className="ev-welcome-row">
            <div className="ev-welcome">
              <h1>Hola, {teacher.nombre}</h1>
              <p>{teacher.institucion} — Panel de control de tus evaluaciones</p>
            </div>
            <Button variant="primary" size="md" icon="ti-plus" onClick={() => navigate("/teacher/create-exam")}>Crear examen</Button>
          </div>

          {/* STATS (HU-15) */}
          <div className="ev-stats">
            <StatCard icon="ti-broadcast" iconColor="#22b865" iconBg="#eafff3" value={enCurso} label="Exámenes en curso" />
            <StatCard icon="ti-calendar-event" iconColor="#4f7cff" iconBg="#f0f4ff" value={programados} label="Programados" />
            <StatCard icon="ti-users" iconColor="#8c92a4" iconBg="#f3f4f7" value={totalInscritos} label="Estudiantes inscritos" />
            <StatCard icon="ti-alert-triangle" iconColor="#e05252" iconBg="#fdeaea" value={totalAlertas} label="Incidencias totales" />
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
                  const meta = TEACHER_STATUS_META[exam.estado];
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
                        <div className="ev-mini-stat"><i className="ti ti-users" /> <b>{exam.inscritos}</b> inscritos</div>
                        <div className="ev-mini-stat"><i className="ti ti-wifi" /> <b>{exam.conectados}</b> conectados</div>
                        <div className={`ev-mini-stat${exam.alertas > 0 ? " alert" : ""}`}><i className="ti ti-alert-triangle" /> <b>{exam.alertas}</b> alertas</div>
                        <div className="ev-exam-actions">
                          {exam.estado === "en_curso" && (
                            <button className="ev-btn-monitor" onClick={() => setMonitorExam(exam)}>
                              <i className="ti ti-video" /> Monitorear
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
        <Modal
          open
          onClose={() => setMonitorExam(undefined)}
          title={`Monitoreo en vivo — ${monitorExam.nombre}`}
          subtitle={`${monitorExam.conectados} de ${monitorExam.inscritos} estudiantes conectados`}
          maxWidth={680}
        >
            <div className="ev-monitor-section-title">Transmisión de estudiantes</div>
            <div className="ev-monitor-grid">
              {["Carlos Mendoza", "Ana Torres", "Diego Vargas", "Valeria Quispe", "Luis Herrera", "Camila Ríos"].map((name) => {
                const hasAlert = examAlerts.some((a) => a.estudiante === name);
                return (
                  <div className={`ev-cam-tile${hasAlert ? " warn" : ""}`} key={name}>
                    {hasAlert && <span className="ev-cam-warn-badge">ALERTA</span>}
                    <i className={`ti ev-cam-icon ${hasAlert ? "ti-alert-triangle" : "ti-camera"}`} />
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
        </Modal>
      )}
    </>
  );
}
