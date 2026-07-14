import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useExams } from "../../hooks/useExams.js";

export default function EduverifyExamAccess() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { getExamById } = useExams();
  const exam = getExamById(examId);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // examId inválido o inexistente (ej. URL editada a mano) → de vuelta al dashboard.
  useEffect(() => {
    if (!exam) navigate("/student");
  }, [exam, navigate]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate(`/student/exam-in-progress/${examId}`), 1400);
    return () => clearTimeout(t);
  }, [success, navigate, examId]);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/\s/g, "");
    setCode(value);
    setError("");
  };

  // Escenarios HU-08: ingreso exitoso, usuario no autorizado, examen no disponible
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Ingresa el código de acceso proporcionado por tu docente");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    setLoading(false);

    // Cada examen tiene su propio código (definido en mockExams.js o
    // generado al crearlo en create_exam_teacher.jsx) — ya no hay un
    // código global único válido para cualquier examen.
    if (code !== exam.codigoAcceso) {
      setError("Código incorrecto. Verifica con tu docente e intenta nuevamente.");
      return;
    }

    setSuccess(true);
  };

  // No renderizar con datos vacíos mientras el useEffect de arriba redirige.
  if (!exam) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-wrap{min-height:100vh;background:linear-gradient(160deg,#0c1426 0%,#12213f 60%,#16294a 100%);display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;}
        .ev-wrap::before{content:'';position:absolute;width:420px;height:420px;border-radius:50%;background:rgba(79,124,255,0.08);top:-160px;right:-120px;}
        .ev-wrap::after{content:'';position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(79,124,255,0.06);bottom:-140px;left:-100px;}

        /* Main card */
        .ev-card{position:relative;z-index:2;width:100%;max-width:460px;background:rgba(18,33,63,0.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:2.2rem;box-shadow:0 30px 80px rgba(0,0,0,0.5);}

        .ev-logo-row{display:flex;align-items:center;gap:10px;margin-bottom:1.6rem;justify-content:center;}
        .ev-logo-box{width:38px;height:38px;background:#4f7cff;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;}
        .ev-logo-name{font-family:'Lora',serif;font-size:17px;font-weight:600;color:#fff;}

        .ev-exam-info{text-align:center;margin-bottom:1.8rem;}
        .ev-exam-tag{display:inline-block;background:rgba(79,124,255,0.15);color:#8fb0ff;font-size:11px;font-weight:500;padding:4px 12px;border-radius:20px;margin-bottom:10px;}
        .ev-exam-name{font-family:'Lora',serif;font-size:21px;font-weight:500;color:#fff;line-height:1.3;margin-bottom:6px;}
        .ev-exam-meta{font-size:12.5px;color:#9bb0d6;}

        .ev-divider{height:1px;background:rgba(255,255,255,0.08);margin:1.6rem 0;}

        .ev-field{margin-bottom:14px;}
        .ev-label{display:block;font-size:11.5px;font-weight:500;color:#9bb0d6;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;text-align:center;}
        .ev-code-input{width:100%;height:58px;text-align:center;font-size:24px;font-weight:600;letter-spacing:0.18em;border:1.5px solid rgba(255,255,255,0.15);border-radius:13px;background:rgba(0,0,0,0.25);color:#fff;outline:none;transition:border-color .15s,box-shadow .15s;font-family:'DM Sans',sans-serif;text-transform:uppercase;}
        .ev-code-input::placeholder{color:rgba(255,255,255,0.25);letter-spacing:0.1em;font-size:15px;font-weight:400;}
        .ev-code-input:focus{border-color:#4f7cff;box-shadow:0 0 0 3px rgba(79,124,255,.2);}
        .ev-code-input.err{border-color:#e05252;}

        .ev-error-msg{font-size:12px;color:#ff9a9a;text-align:center;margin-top:10px;background:rgba(224,82,82,0.1);border:1px solid rgba(224,82,82,0.25);border-radius:9px;padding:9px 12px;}

        .ev-btn-enter{width:100%;height:52px;background:#4f7cff;color:#fff;border:none;border-radius:13px;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;transition:background .2s,transform .1s;margin-top:1.4rem;}
        .ev-btn-enter:hover{background:#3d68e8;}
        .ev-btn-enter:active{transform:scale(.98);}
        .ev-btn-enter:disabled{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ev-spinner{width:17px;height:17px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}

        .ev-help{text-align:center;font-size:11.5px;color:#7a99c8;margin-top:1.2rem;line-height:1.6;}

        /* Success */
        .ev-success{text-align:center;}
        .ev-success-icon{font-size:48px;margin-bottom:14px;}
        .ev-success h2{font-family:'Lora',serif;font-size:20px;font-weight:500;color:#fff;margin-bottom:8px;}
        .ev-success p{font-size:13px;color:#9bb0d6;line-height:1.6;}

        @media (max-width:600px){
          .ev-card{padding:1.7rem 1.4rem;}
          .ev-exam-name{font-size:18px;}
        }
      `}</style>

      <div className="ev-wrap">

        {/* MAIN CARD */}
        <div className="ev-card">
          {!success ? (
            <>
              <div className="ev-logo-row">
                <div className="ev-logo-box">🎓</div>
                <div className="ev-logo-name">Eduverify</div>
              </div>

              <div className="ev-exam-info">
                <span className="ev-exam-tag">{exam.curso}</span>
                <div className="ev-exam-name">{exam.nombre}</div>
                <div className="ev-exam-meta">{exam.docente} · {exam.hora} · {exam.duracion} min</div>
              </div>

              <div className="ev-divider" />

              <form onSubmit={handleSubmit}>
                <div className="ev-field">
                  <label className="ev-label" htmlFor="code">Código de acceso del examen</label>
                  <input
                    id="code"
                    className={`ev-code-input${error ? " err" : ""}`}
                    placeholder="••••••••"
                    value={code}
                    onChange={handleCodeChange}
                    maxLength={10}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {error && <div className="ev-error-msg"><i className="ti ti-alert-circle" /> {error}</div>}

                <button type="submit" className="ev-btn-enter" disabled={loading}>
                  {loading ? <><span className="ev-spinner" /> Verificando código...</> : <>Ingresar al examen <i className="ti ti-arrow-right" /></>}
                </button>
              </form>

              <p className="ev-help">El código de acceso es proporcionado por tu docente al inicio de la evaluación.</p>
            </>
          ) : (
            <div className="ev-success">
              <div className="ev-success-icon"><i className="ti ti-circle-check" style={{ color: "#63F0C6" }} /></div>
              <h2>¡Acceso concedido!</h2>
              <p>Validando tu sesión de examen... serás redirigido a la evaluación en unos segundos.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
