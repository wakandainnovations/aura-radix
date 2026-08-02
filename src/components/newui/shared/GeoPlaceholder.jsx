// Stylized dot-grid map placeholder with glowing markers positioned by
// approximate x/y percentage. Not a real cartographic projection — a
// deliberately abstract stand-in so geography widgets read as "a map"
// without needing real GeoJSON boundary data.
export default function GeoPlaceholder({ markers = [], height = 220, className = '' }) {
  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden ${className}`}
      style={{
        height,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.5px)',
        backgroundSize: '14px 14px',
        backgroundColor: 'rgba(255,255,255,0.015)',
      }}
    >
      {markers.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.xPct}%`,
            top: `${m.yPct}%`,
            width: m.size ?? 8,
            height: m.size ?? 8,
            backgroundColor: m.color ?? '#818cf8',
            boxShadow: `0 0 ${(m.size ?? 8) * 2}px ${(m.size ?? 8) * 0.6}px ${m.color ?? '#818cf8'}88`,
            transform: 'translate(-50%, -50%)',
          }}
          title={m.label}
        />
      ))}
    </div>
  );
}
