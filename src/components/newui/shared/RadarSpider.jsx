// Hand-rolled SVG radar/spider chart. recharts' own RadarChart collapses
// every polygon to the center point in this app's recharts install (v3.4.1)
// — reproduced even with the library's own canonical example data, so it's
// an environment/version bug, not a data-shape issue. This bypasses it.
export default function RadarSpider({ data, series, size = 280, maxValue = 100, labelKey = 'dimension' }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 58;
  const n = data.length;
  const angleFor = (i) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const rings = [0.25, 0.5, 0.75, 1];

  const pointsFor = (key) =>
    data
      .map((d, i) => {
        const val = Math.max(0, Math.min(maxValue, d[key] ?? 0));
        const radius = (val / maxValue) * r;
        const angle = angleFor(i);
        return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
      })
      .join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto overflow-visible">
      {rings.map((ring) => {
        const pts = data
          .map((_, i) => {
            const angle = angleFor(i);
            const radius = ring * r;
            return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
          })
          .join(' ');
        return <polygon key={ring} points={pts} fill="none" stroke="rgba(255,255,255,0.1)" />;
      })}
      {data.map((d, i) => {
        const angle = angleFor(i);
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        const lx = cx + (r + 22) * Math.cos(angle);
        const ly = cy + (r + 22) * Math.sin(angle);
        const anchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle';
        return (
          <g key={d[labelKey]}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" />
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize={10} fill="rgba(255,255,255,0.45)">
              {d[labelKey]}
            </text>
          </g>
        );
      })}
      {series.map((s) => (
        <polygon key={s.key} points={pointsFor(s.key)} fill={s.color} fillOpacity={0.1} stroke={s.color} strokeWidth={2} />
      ))}
    </svg>
  );
}
