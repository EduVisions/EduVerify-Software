import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const EXAM = {
  nombre: "Cálculo Diferencial - Parcial 2",
  curso: "Matemática II",
  docente: "Dr. Roberto Salas",
  duracion: 90,
  hora: "09:00",
};

const STUDENT = { nombre: "María", apellido: "Gonzáles" };

// Código válido simulado — en producción vendría del backend (HU-08)
const VALID_CODE = "MATH2026";

export default function EduverifyExamAccess() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [camState, setCamState] = useState("idle"); // idle | requesting | granted | denied | notfound
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setCamState("requesting");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamState("notfound");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamState("granted");
    } catch (err) {
      if (err && err.name === "NotFoundError") setCamState("notfound");
      else if (err && err.name === "NotAllowedError") setCamState("denied");
      else setCamState("notfound");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(requestCamera, 0);
    return () => {
      clearTimeout(t);
      stopStream();
    };
  }, [requestCamera, stopStream]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/student/camera-check"), 1400);
    return () => clearTimeout(t);
  }, [success, navigate]);

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
    if (camState !== "granted") {
      setError("Debes habilitar tu cámara antes de ingresar al examen");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    setLoading(false);

    if (code !== VALID_CODE) {
      setError("Código incorrecto. Verifica con tu docente e intenta nuevamente.");
      return;
    }

    stopStream();
    setSuccess(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-wrap{min-height:100vh;background:linear-gradient(160deg,#0c1426 0%,#12213f 60%,#16294a 100%);display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;}
        .ev-wrap::before{content:'';position:absolute;width:420px;height:420px;border-radius:50%;background:rgba(79,124,255,0.08);top:-160px;right:-120px;}
        .ev-wrap::after{content:'';position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(79,124,255,0.06);bottom:-140px;left:-100px;}

        /* Floating camera - top left of viewport */
        .ev-cam-float{position:fixed;top:24px;left:24px;width:200px;border-radius:16px;overflow:hidden;background:#06090f;border:2px solid #1e2f52;box-shadow:0 12px 30px rgba(0,0,0,0.4);z-index:20;transition:border-color .3s;}
        .ev-cam-float.granted{border-color:#22b865;}
        .ev-cam-float.denied,.ev-cam-float.notfound{border-color:#e05252;}
        .ev-cam-float-video-box{position:relative;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;}
        .ev-cam-float-video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);}
        .ev-cam-float-placeholder{display:flex;flex-direction:column;align-items:center;gap:6px;color:#5a6d94;text-align:center;padding:0.8rem;}
        .ev-cam-float-icon{font-size:22px;}
        .ev-cam-float-placeholder p{font-size:9.5px;line-height:1.4;}
        .ev-cam-float-badge{position:absolute;top:7px;left:7px;background:rgba(34,184,101,0.18);border:1px solid #22b865;color:#5fe0a0;font-size:9px;font-weight:500;padding:3px 8px;border-radius:14px;display:flex;align-items:center;gap:5px;}
        .ev-cam-float-rec{width:5px;height:5px;border-radius:50%;background:#e05252;animation:pulse 1.4s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .ev-cam-float-footer{padding:8px 10px;background:#0e1c38;display:flex;align-items:center;justify-content:space-between;gap:8px;}
        .ev-cam-float-name{font-size:10.5px;color:#fff;font-weight:500;}
        .ev-cam-float-status{font-size:9px;font-weight:500;}
        .ev-cam-float-status.ok{color:#5fe0a0;}
        .ev-cam-float-status.bad{color:#ff9a9a;}
        .ev-cam-float-retry{background:none;border:none;color:#7a99c8;font-size:13px;cursor:pointer;line-height:1;padding:0;}

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
        .ev-cam-warning{font-size:12px;color:#ffcb6b;text-align:center;margin-top:10px;background:rgba(240,165,0,0.1);border:1px solid rgba(240,165,0,0.25);border-radius:9px;padding:9px 12px;}

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
          .ev-cam-float{width:130px;top:14px;left:14px;}
          .ev-card{padding:1.7rem 1.4rem;}
          .ev-exam-name{font-size:18px;}
        }
      `}</style>

      <div className="ev-wrap">

        {/* FLOATING CAMERA — top left */}
        <div className={`ev-cam-float${camState === "granted" ? " granted" : ""}${camState === "denied" || camState === "notfound" ? " denied" : ""}`}>
          <div className="ev-cam-float-video-box">
            {camState === "granted" ? (
              <>
                <video ref={videoRef} className="ev-cam-float-video" autoPlay playsInline muted />
                <span className="ev-cam-float-badge"><span className="ev-cam-float-rec" /> EN VIVO</span>
              </>
            ) : (
              <div className="ev-cam-float-placeholder">
                <span className="ev-cam-float-icon">
                  {camState === "requesting" ? "⏳" : camState === "denied" ? "🚫" : "⚠️"}
                </span>
                <p>
                  {camState === "requesting" && "Solicitando cámara..."}
                  {camState === "denied" && "Permiso denegado"}
                  {camState === "notfound" && "Sin cámara"}
                  {camState === "idle" && "Cámara inactiva"}
                </p>
              </div>
            )}
          </div>
          <div className="ev-cam-float-footer">
            <span className="ev-cam-float-name">{STUDENT.nombre} {STUDENT.apellido[0]}.</span>
            {camState === "granted" ? (
              <span className="ev-cam-float-status ok">● Activa</span>
            ) : (
              <button className="ev-cam-float-retry" onClick={requestCamera} aria-label="Reintentar cámara">↻</button>
            )}
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="ev-card">
          {!success ? (
            <>
              <div className="ev-logo-row">
                <div className="ev-logo-box">🎓</div>
                <div className="ev-logo-name">Eduverify</div>
              </div>

              <div className="ev-exam-info">
                <span className="ev-exam-tag">{EXAM.curso}</span>
                <div className="ev-exam-name">{EXAM.nombre}</div>
                <div className="ev-exam-meta">{EXAM.docente} · {EXAM.hora} · {EXAM.duracion} min</div>
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

                {error && <div className="ev-error-msg">⚠️ {error}</div>}
                {camState !== "granted" && !error && (
                  <div className="ev-cam-warning">📷 Habilita tu cámara para poder ingresar al examen.</div>
                )}

                <button type="submit" className="ev-btn-enter" disabled={loading}>
                  {loading ? <><span className="ev-spinner" /> Verificando código...</> : <>Ingresar al examen →</>}
                </button>
              </form>

              <p className="ev-help">El código de acceso es proporcionado por tu docente al inicio de la evaluación.</p>
            </>
          ) : (
            <div className="ev-success">
              <div className="ev-success-icon">✅</div>
              <h2>¡Acceso concedido!</h2>
              <p>Validando tu sesión de examen... serás redirigido a la evaluación en unos segundos.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
