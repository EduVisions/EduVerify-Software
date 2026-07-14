// Modal genérico: overlay + tarjeta + botón cerrar (X) + título/subtítulo
// opcionales. Usado por el modal de "Probar cámara" (main_page_student),
// el de "Monitorear" (main_page_teacher) y el de confirmación de envío no
// lo usa (ese tiene su propio look, sin X y centrado — ver exam_in_progress.jsx).
// Importante: `children` solo se monta cuando `open` es true, así que
// cualquier <video> dentro debe seguir el patrón de "siempre montado,
// visibilidad con style={{display}}" (no condicionar el <video> en sí),
// igual que en las demás pantallas de cámara — si no, se repite el bug de
// pantalla negra que ya se arregló antes en esta sesión.
export default function Modal({ open, onClose, title, subtitle, maxWidth = 420, children }) {
  if (!open) return null;

  return (
    <>
      <style>{`
        .ev-modal-overlay{position:fixed;inset:0;background:rgba(18,33,63,0.55);display:flex;align-items:center;justify-content:center;z-index:50;padding:1.5rem;}
        .ev-modal{background:#fff;border-radius:18px;width:100%;padding:1.8rem;position:relative;max-height:85vh;overflow-y:auto;}
        .ev-modal h3{font-family:var(--ev-font-serif);font-size:18px;font-weight:500;color:var(--ev-navy);margin-bottom:6px;padding-right:1.6rem;}
        .ev-modal-sub{font-size:13px;color:var(--ev-text-muted);margin-bottom:1.2rem;}
        .ev-modal-close{position:absolute;top:1.2rem;right:1.3rem;background:none;border:none;font-size:18px;color:#b0b5c4;cursor:pointer;z-index:2;}
      `}</style>
      <div className="ev-modal-overlay" onClick={onClose}>
        <div className="ev-modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
          <button className="ev-modal-close" onClick={onClose} aria-label="Cerrar"><i className="ti ti-x" /></button>
          {title && <h3>{title}</h3>}
          {subtitle && <p className="ev-modal-sub">{subtitle}</p>}
          {children}
        </div>
      </div>
    </>
  );
}
