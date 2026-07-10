import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const EXAM = {
  nombre: "Cálculo Diferencial - Parcial 2",
  curso: "Matemática II",
  docente: "Dr. Roberto Salas",
  duracion: 90,
};

const STUDENT = { nombre: "María", apellido: "Gonzáles" };

// Pasos del checklist previo al examen
const STEPS = [
  { id: "camara", label: "Acceso a cámara" },
  { id: "rostro", label: "Detección de rostro" },
  { id: "entorno", label: "Verificación de entorno" },
];

export default function EduverifyCameraCheck() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [permState, setPermState] = useState("idle"); // idle | requesting | granted | denied | notfound | error
  const [faceDetected, setFaceDetected] = useState(false);
  const [envChecked, setEnvChecked] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const requestCamera = async () => {
    setPermState("requesting");
    setFaceDetected(false);
    setEnvChecked(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermState("notfound");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermState("granted");

      // Simulación de detección facial básica tras unos segundos de captura
      setTimeout(() => setFaceDetected(true), 1800);
      setTimeout(() => setEnvChecked(true), 3000);
    } catch (err) {
      if (err && err.name === "NotFoundError") {
        setPermState("notfound");
      } else if (err && err.name === "NotAllowedError") {
        setPermState("denied");
      } else {
        setPermState("error");
      }
    }
  };

  const allReady = permState === "granted" && faceDetected && envChecked;

  const startCountdown = () => {
    if (!allReady) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      stopStream();
      navigate("/student/submit-exam");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [countdown, stopStream, navigate]);

  const stepStatus = (id) => {
    if (id === "camara") return permState === "granted" ? "done" : permState === "requesting" ? "active" : "pending";
    if (id === "rostro") return faceDetected ? "done" : permState === "granted" ? "active" : "pending";
    if (id === "entorno") return envChecked ? "done" : faceDetected ? "active" : "pending";
    return "pending";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .ev-wrap{min-height:100vh;background:#0c1426;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'DM Sans',sans-serif;}

        .ev-card{width:100%;max-width:920px;background:#12213f;border-radius:22px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,0.45);}

        /* Header */
        .ev-header{padding:1.6rem 2rem;border-bottom:1px solid #1e2f52;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
        .ev-header-left{display:flex;align-items:center;gap:12px;}
        .ev-logo-box{width:36px;height:36px;background:#4f7cff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
        .ev-header-title{font-family:'Lora',serif;font-size:16px;font-weight:600;color:#fff;}
        .ev-header-sub{font-size:11.5px;color:#7a99c8;}
        .ev-exam-chip{background:#1a2f55;border-radius:10px;padding:8px 14px;text-align:right;}
        .ev-exam-chip-name{font-size:12.5px;color:#fff;font-weight:500;}
        .ev-exam-chip-meta{font-size:11px;color:#7a99c8;margin-top:1px;}

        /* Body */
        .ev-body{padding:2rem;display:grid;grid-template-columns:1fr 280px;gap:1.8rem;}

        /* Camera preview */
        .ev-cam-area{}
        .ev-cam-title{font-size:13px;color:#9bb0d6;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
        .ev-cam-frame{position:relative;background:#06090f;border-radius:16px;aspect-ratio:4/3;overflow:hidden;border:2px solid #1e2f52;display:flex;align-items:center;justify-content:center;}
        .ev-cam-frame.granted{border-color:#22b865;}
        .ev-cam-frame.denied{border-color:#e05252;}
        .ev-cam-frame.notfound{border-color:#f0a500;}
        .ev-cam-video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);}
        .ev-cam-placeholder{display:flex;flex-direction:column;align-items:center;gap:14px;color:#5a6d94;text-align:center;padding:1.5rem;}
        .ev-cam-placeholder-icon{font-size:44px;}
        .ev-cam-placeholder p{font-size:13px;max-width:280px;line-height:1.6;}
        .ev-cam-overlay-badge{position:absolute;top:12px;left:12px;background:rgba(34,184,101,0.15);border:1px solid #22b865;color:#5fe0a0;font-size:11px;font-weight:500;padding:5px 11px;border-radius:20px;display:flex;align-items:center;gap:6px;}
        .ev-cam-rec-dot{width:7px;height:7px;border-radius:50%;background:#e05252;animation:pulse 1.4s infinite;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
        .ev-face-frame{position:absolute;border:2.5px solid #5fe0a0;border-radius:10px;width:38%;height:52%;top:20%;left:31%;opacity:0;transition:opacity .4s;box-shadow:0 0 0 2000px rgba(0,0,0,0.0);}
        .ev-face-frame.visible{opacity:0.85;}
        .ev-countdown-overlay{position:absolute;inset:0;background:rgba(6,9,15,0.75);display:flex;align-items:center;justify-content:center;}
        .ev-countdown-num{font-family:'Lora',serif;font-size:64px;font-weight:600;color:#fff;}

        .ev-error-box{margin-top:12px;padding:12px 14px;border-radius:10px;font-size:12.5px;line-height:1.6;display:flex;gap:10px;align-items:flex-start;}
        .ev-error-box.denied{background:rgba(224,82,82,0.1);color:#ff9a9a;border:1px solid rgba(224,82,82,0.25);}
        .ev-error-box.notfound{background:rgba(240,165,0,0.1);color:#ffcb6b;border:1px solid rgba(240,165,0,0.25);}

        .ev-btn-row{display:flex;gap:10px;margin-top:14px;}
        .ev-btn-cam{flex:1;height:46px;border-radius:11px;font-size:13.5px;font-weight:500;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;}
        .ev-btn-cam.primary{background:#4f7cff;color:#fff;}
        .ev-btn-cam.primary:hover{background:#3d68e8;}
        .ev-btn-cam.retry{background:#1e2f52;color:#fff;}
        .ev-btn-cam.retry:hover{background:#28406e;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ev-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}

        /* Checklist sidebar */
        .ev-checklist{}
        .ev-checklist-title{font-size:13px;color:#9bb0d6;margin-bottom:14px;}
        .ev-step{display:flex;align-items:flex-start;gap:12px;padding-bottom:18px;position:relative;}
        .ev-step:last-child{padding-bottom:0;}
        .ev-step:not(:last-child)::after{content:'';position:absolute;left:13px;top:28px;width:1.5px;height:calc(100% - 28px);background:#1e2f52;}
        .ev-step-circle{width:27px;height:27px;border-radius:50%;border:1.5px solid #2a3f6a;display:flex;align-items:center;justify-content:center;font-size:12px;color:#5a6d94;background:#12213f;flex-shrink:0;transition:all .3s;}
        .ev-step-circle.done{background:#22b865;border-color:#22b865;color:#fff;}
        .ev-step-circle.active{border-color:#4f7cff;color:#4f7cff;background:#1a2f55;}
        .ev-step-circle.active .ev-step-spin{width:11px;height:11px;border:2px solid rgba(79,124,255,0.3);border-top-color:#4f7cff;border-radius:50%;animation:spin .7s linear infinite;}
        .ev-step-name{font-size:13px;font-weight:500;color:#fff;line-height:1.3;}
        .ev-step-name.pending{color:#5a6d94;}
        .ev-step-desc{font-size:11px;color:#7a99c8;margin-top:2px;}

        .ev-rules-box{background:#1a2f55;border-radius:12px;padding:14px;margin-top:1.6rem;}
        .ev-rules-title{font-size:12px;font-weight:500;color:#fff;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
        .ev-rules-list{font-size:11.5px;color:#9bb0d6;line-height:1.8;padding-left:2px;}
        .ev-rules-list li{margin-bottom:4px;list-style:none;display:flex;gap:7px;}

        .ev-footer{padding:1.4rem 2rem;border-top:1px solid #1e2f52;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
        .ev-footer-status{font-size:12.5px;color:#7a99c8;display:flex;align-items:center;gap:8px;}
        .ev-status-dot{width:8px;height:8px;border-radius:50%;}
        .ev-btn-enter{background:#22b865;color:#fff;border:none;border-radius:11px;padding:13px 26px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .2s;}
        .ev-btn-enter:hover{background:#1ea155;}
        .ev-btn-enter:disabled{background:#1e2f52;color:#5a6d94;cursor:not-allowed;}

        @media (max-width:760px){
          .ev-body{grid-template-columns:1fr;}
          .ev-header{padding:1.3rem 1.5rem;}
          .ev-footer{padding:1.2rem 1.5rem;flex-direction:column;align-items:stretch;}
          .ev-btn-enter{justify-content:center;}
        }
      `}</style>

      <div className="ev-wrap">
        <div className="ev-card">

          {/* HEADER */}
          <div className="ev-header">
            <div className="ev-header-left">
              <div className="ev-logo-box">🎓</div>
              <div>
                <div className="ev-header-title">Verificación previa al examen</div>
                <div className="ev-header-sub">{STUDENT.nombre} {STUDENT.apellido} · Eduverify</div>
              </div>
            </div>
            <div className="ev-exam-chip">
              <div className="ev-exam-chip-name">{EXAM.nombre}</div>
              <div className="ev-exam-chip-meta">{EXAM.curso} · {EXAM.duracion} min</div>
            </div>
          </div>

          {/* BODY */}
          <div className="ev-body">
            {/* CAMERA */}
            <div className="ev-cam-area">
              <div className="ev-cam-title">📷 Vista previa de tu cámara</div>

              <div className={`ev-cam-frame${permState === "granted" ? " granted" : ""}${permState === "denied" ? " denied" : ""}${permState === "notfound" ? " notfound" : ""}`}>
                {permState === "granted" ? (
                  <>
                    <video ref={videoRef} className="ev-cam-video" autoPlay playsInline muted />
                    <div className="ev-face-frame visible" />
                    <div className="ev-cam-overlay-badge">
                      <span className="ev-cam-rec-dot" /> Transmisión activa
                    </div>
                    {countdown !== null && (
                      <div className="ev-countdown-overlay">
                        <div className="ev-countdown-num">{countdown === 0 ? "✓" : countdown}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ev-cam-placeholder">
                    <span className="ev-cam-placeholder-icon">
                      {permState === "denied" ? "🚫" : permState === "notfound" ? "⚠️" : permState === "requesting" ? "⏳" : "📷"}
                    </span>
                    <p>
                      {permState === "idle" && "Necesitamos acceder a tu cámara web para verificar tu identidad y supervisar el examen."}
                      {permState === "requesting" && "Esperando confirmación del permiso de cámara en tu navegador..."}
                      {permState === "denied" && "Permiso denegado. La cámara es obligatoria para participar en evaluaciones supervisadas."}
                      {permState === "notfound" && "No se encontró un dispositivo de cámara compatible en este equipo."}
                      {permState === "error" && "Ocurrió un error inesperado al intentar acceder a la cámara."}
                    </p>
                  </div>
                )}
              </div>

              {permState === "denied" && (
                <div className="ev-error-box denied">
                  🚫 <span>Has bloqueado el acceso a la cámara. Habilítalo desde la configuración de tu navegador (icono de candado en la barra de direcciones) y vuelve a intentarlo.</span>
                </div>
              )}
              {permState === "notfound" && (
                <div className="ev-error-box notfound">
                  ⚠️ <span>Verifica que tu cámara esté conectada y no esté siendo usada por otra aplicación, luego reintenta.</span>
                </div>
              )}

              <div className="ev-btn-row">
                {permState === "idle" && (
                  <button className="ev-btn-cam primary" onClick={requestCamera}>
                    📷 Permitir acceso a la cámara
                  </button>
                )}
                {permState === "requesting" && (
                  <button className="ev-btn-cam primary" disabled>
                    <span className="ev-spinner" /> Solicitando permiso...
                  </button>
                )}
                {(permState === "denied" || permState === "notfound" || permState === "error") && (
                  <button className="ev-btn-cam retry" onClick={requestCamera}>
                    ↻ Reintentar
                  </button>
                )}
                {permState === "granted" && (
                  <button className="ev-btn-cam retry" onClick={requestCamera}>
                    ↻ Reiniciar cámara
                  </button>
                )}
              </div>
            </div>

            {/* CHECKLIST */}
            <div className="ev-checklist">
              <div className="ev-checklist-title">Lista de verificación</div>

              {STEPS.map((s) => {
                const status = stepStatus(s.id);
                const descs = {
                  camara: "Concede permiso para usar tu cámara web",
                  rostro: "El sistema confirma que tu rostro es visible",
                  entorno: "Validamos que el entorno sea adecuado",
                };
                return (
                  <div className="ev-step" key={s.id}>
                    <div className={`ev-step-circle${status === "done" ? " done" : status === "active" ? " active" : ""}`}>
                      {status === "done" ? "✓" : status === "active" ? <span className="ev-step-spin" /> : ""}
                    </div>
                    <div>
                      <div className={`ev-step-name${status === "pending" ? " pending" : ""}`}>{s.label}</div>
                      <div className="ev-step-desc">{descs[s.id]}</div>
                    </div>
                  </div>
                );
              })}

              <div className="ev-rules-box">
                <div className="ev-rules-title">🛈 Antes de continuar</div>
                <ul className="ev-rules-list">
                  <li>· Ubícate en un espacio bien iluminado</li>
                  <li>· Mantén tu rostro visible durante todo el examen</li>
                  <li>· No abandones la cámara ni cubras el lente</li>
                  <li>· Evita la presencia de otras personas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="ev-footer">
            <div className="ev-footer-status">
              <span
                className="ev-status-dot"
                style={{ background: allReady ? "#22b865" : permState === "denied" || permState === "notfound" ? "#e05252" : "#f0a500" }}
              />
              {allReady
                ? "Todo listo. Puedes ingresar al examen."
                : permState === "denied" || permState === "notfound"
                ? "No se pudo verificar tu cámara."
                : "Completando verificación..."}
            </div>
            <button className="ev-btn-enter" disabled={!allReady || countdown !== null} onClick={startCountdown}>
              {countdown !== null ? "Ingresando..." : "Ingresar al examen →"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
