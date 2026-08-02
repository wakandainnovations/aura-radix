// A labeled horizontal progress bar row — used for ranked lists (top themes,
// top segments, top regions, budget pace, etc.) throughout the new UI.
export default function BarRow({ label, sublabel, pct, valueLabel, color = '#3987e5', trackClass = 'bg-white/[0.06]' }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5 gap-3">
        <div className="min-w-0">
          <div className="text-white/70 truncate">{label}</div>
          {sublabel && <div className="text-[11px] text-white/35 truncate">{sublabel}</div>}
        </div>
        <span className="text-white/85 font-medium shrink-0">{valueLabel ?? `${pct}%`}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${trackClass}`}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
