// A labeled horizontal progress bar row — used for ranked lists (top themes,
// top segments, top regions, budget pace, etc.) throughout the new UI.
// Pass `onClick` to make the row a drill-down trigger (e.g. Conversation
// Drivers opening the classified posts behind an aspect) - it renders as a
// <button> with a hover affordance instead of a plain <div>.
export default function BarRow({ label, sublabel, pct, valueLabel, color = '#3987e5', trackClass = 'bg-white/[0.06]', onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      {...(onClick && { type: 'button', onClick })}
      className={`w-full text-left ${onClick ? 'group cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between text-sm mb-1.5 gap-3">
        <div className="min-w-0">
          <div className={`text-white/70 truncate ${onClick ? 'group-hover:text-white/95' : ''}`}>{label}</div>
          {sublabel && <div className="text-[11px] text-white/35 truncate">{sublabel}</div>}
        </div>
        <span className="text-white/85 font-medium shrink-0">{valueLabel ?? `${pct}%`}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${trackClass} ${onClick ? 'group-hover:opacity-80' : ''}`}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>
    </Wrapper>
  );
}
