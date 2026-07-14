// Botón compartido: reemplaza los ~10 botones distintos (.ev-btn-enter,
// .ev-btn-primary, .ev-btn-back, .ev-modal-btn, .ev-banner-btn, etc.) que
// antes reimplementaban el mismo navy-o-gris con CSS casi idéntico en cada
// página. `style` queda disponible para ajustes puntuales (ej. flex:1 en
// una fila de botones) sin tener que crear una variante nueva para eso.
export default function Button({
  variant = "primary", // primary | ghost | danger
  size = "md", // sm | md | lg — alturas 38px / 46px / 52px
  fullWidth = false,
  icon, // clase de Tabler Icons, ej. "ti-arrow-right"
  iconPosition = "left", // left | right
  disabled = false,
  type = "button",
  onClick,
  children,
  style,
}) {
  return (
    <>
      <style>{`
        .ev-btn{border:none;border-radius:10px;font-family:var(--ev-font-sans);font-weight:500;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:background .2s,transform .1s;white-space:nowrap;}
        .ev-btn:active:not(:disabled){transform:scale(.98);}
        .ev-btn:disabled{opacity:.5;cursor:not-allowed;}
        .ev-btn.full{width:100%;}
        .ev-btn.sm{height:38px;padding:0 14px;font-size:12.5px;}
        .ev-btn.md{height:46px;padding:0 20px;font-size:13.5px;}
        .ev-btn.lg{height:52px;padding:0 24px;font-size:15px;}
        .ev-btn.primary{background:var(--ev-navy);color:#fff;}
        .ev-btn.primary:hover:not(:disabled){background:var(--ev-navy-hover);}
        .ev-btn.ghost{background:#f3f4f7;color:#5a607a;}
        .ev-btn.ghost:hover:not(:disabled){background:#e8eaf0;}
        .ev-btn.danger{background:var(--ev-red);color:#fff;}
        .ev-btn.danger:hover:not(:disabled){background:#c84545;}
      `}</style>
      <button
        type={type}
        className={`ev-btn ${variant} ${size}${fullWidth ? " full" : ""}`}
        disabled={disabled}
        onClick={onClick}
        style={style}
      >
        {icon && iconPosition === "left" && <i className={`ti ${icon}`} />}
        {children}
        {icon && iconPosition === "right" && <i className={`ti ${icon}`} />}
      </button>
    </>
  );
}
