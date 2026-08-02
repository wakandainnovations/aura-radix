// Hand-positioned overlapping-circle cluster (audience overlap / Venn-style
// widgets). Not a mathematically accurate set diagram — circle positions and
// zone label coordinates are tuned per usage to visually match the source
// design, which itself isn't proportionally accurate.
export default function VennCluster({ circles, zoneLabels, height = 260 }) {
  return (
    <div className="relative w-full" style={{ height }}>
      {circles.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            left: `${c.xPct}%`,
            top: `${c.yPct}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            opacity: 0.45,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {zoneLabels.map((z, i) => (
        <span
          key={i}
          className="absolute text-sm font-semibold text-white -translate-x-1/2 -translate-y-1/2 drop-shadow"
          style={{ left: `${z.xPct}%`, top: `${z.yPct}%` }}
        >
          {z.text}
        </span>
      ))}
    </div>
  );
}
