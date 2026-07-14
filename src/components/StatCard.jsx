// Tarjeta de estadística (ícono + número grande + etiqueta) que se repetía
// 4 veces en cada dashboard (8 instancias en total) con el mismo CSS
// copiado y pegado. `icon` es una clase de Tabler Icons (ej. "ti-users").
// Ejemplo: <StatCard icon="ti-users" iconColor="#4f7cff" iconBg="#f0f4ff" value={12} label="Inscritos" />
export default function StatCard({ icon, iconColor, iconBg, value, label }) {
  return (
    <>
      <style>{`
        .ev-stat-card{background:#fff;border-radius:14px;padding:1.2rem;box-shadow:0 1px 3px rgba(0,0,0,0.04);border:1px solid var(--ev-border);}
        .ev-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;}
        .ev-stat-value{font-family:var(--ev-font-serif);font-size:24px;font-weight:600;color:var(--ev-navy);line-height:1;margin-bottom:3px;}
        .ev-stat-label{font-size:12px;color:var(--ev-text-muted);}
      `}</style>
      <div className="ev-stat-card">
        <div className="ev-stat-icon" style={{ background: iconBg }}>
          <i className={`ti ${icon}`} style={{ color: iconColor }} />
        </div>
        <div className="ev-stat-value">{value}</div>
        <div className="ev-stat-label">{label}</div>
      </div>
    </>
  );
}
