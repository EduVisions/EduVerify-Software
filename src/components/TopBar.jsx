import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Barra superior compartida por los dos dashboards (estudiante y docente):
// logo, campana, chip con el usuario logueado (vía AuthContext) y botón de
// cerrar sesión. `roleLabel` es lo único que varía entre las dos vistas
// ("Estudiante" / "Docente"); todo lo demás sale de useAuth().
// exam_in_progress.jsx NO usa este componente: tiene su propio topbar
// angosto con el temporizador, es una pantalla distinta a propósito.
export default function TopBar({ roleLabel }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Fallback por si se navega directo por URL sin haber iniciado sesión
  // (no hay rutas protegidas todavía).
  const person = user || { nombre: "Invitado", apellido: "" };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <style>{`
        .ev-topbar{background:var(--ev-navy);padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;}
        .ev-logo-row{display:flex;align-items:center;gap:10px;}
        .ev-logo-box{width:34px;height:34px;background:var(--ev-blue);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;}
        .ev-logo-name{font-family:var(--ev-font-serif);font-size:16px;font-weight:600;color:#fff;}
        .ev-topbar-right{display:flex;align-items:center;gap:18px;}
        .ev-bell{width:36px;height:36px;border-radius:50%;background:#1a2f55;display:flex;align-items:center;justify-content:center;font-size:16px;color:#9bb0d6;cursor:pointer;position:relative;border:none;}
        .ev-bell-dot{position:absolute;top:7px;right:8px;width:7px;height:7px;border-radius:50%;background:var(--ev-red);border:1.5px solid #1a2f55;}
        .ev-user-chip{display:flex;align-items:center;gap:9px;cursor:pointer;}
        .ev-avatar{width:34px;height:34px;border-radius:50%;background:var(--ev-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;}
        .ev-user-name{font-size:13px;color:#fff;font-weight:500;line-height:1.1;}
        .ev-user-role{font-size:11px;color:#7a99c8;}
        .ev-btn-logout{display:flex;align-items:center;gap:6px;background:#1a2f55;color:#ff9a9a;border:none;border-radius:9px;padding:8px 13px;font-size:12.5px;font-weight:500;cursor:pointer;transition:background .2s;white-space:nowrap;}
        .ev-btn-logout:hover{background:#2a1212;}
      `}</style>
      <div className="ev-topbar">
        <div className="ev-logo-row">
          <div className="ev-logo-box">🎓</div>
          <div className="ev-logo-name">Eduverify</div>
        </div>
        <div className="ev-topbar-right">
          <button className="ev-bell" aria-label="Notificaciones">
            <i className="ti ti-bell" /><span className="ev-bell-dot" />
          </button>
          <div className="ev-user-chip">
            <div className="ev-avatar">{person.nombre[0]}{person.apellido[0] || ""}</div>
            <div>
              <div className="ev-user-name">{person.nombre} {person.apellido}</div>
              <div className="ev-user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="ev-btn-logout" onClick={handleLogout}>
            <i className="ti ti-logout" /> Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
