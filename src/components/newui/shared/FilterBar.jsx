import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';

// A single filter pill. Static display-only by default (matches every
// existing FilterBar call site's dummy-data behavior); a filter that also
// carries `options` renders as an actual interactive dropdown instead,
// calling `onChange(value)` when a new option is picked.
function FilterPill({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!options) {
    return (
      <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 hover:bg-white/[0.08] transition-colors">
        <span className="text-white/40">{label}</span>
        <span className="text-white/85 font-medium">{value}</span>
        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 hover:bg-white/[0.08] transition-colors"
      >
        <span className="text-white/40">{label}</span>
        <span className="text-white/85 font-medium">{value}</span>
        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-10 min-w-[140px] rounded-lg border border-white/10 bg-[#11141f] shadow-xl py-1">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange?.(o.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                o.label === value ? 'text-blue-400 bg-blue-600/10' : 'text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// The row of filter dropdown pills that sits under most section headers
// (Platform / Content Type / Audience / Metric, etc). Static display-only —
// selecting isn't wired up — unless a filter passes `options` + `onChange`.
export default function FilterBar({ filters = [], right, rightIcon: RightIcon = Download, showRight = true }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
      <div className="flex items-center gap-3 flex-wrap">
        {filters.map((f) => (
          <FilterPill key={f.label} {...f} />
        ))}
      </div>
      {showRight && (
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 hover:bg-white/[0.08] transition-colors shrink-0">
          <RightIcon className="w-3.5 h-3.5" />
          {right ?? 'Last 30 days'}
          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
        </button>
      )}
    </div>
  );
}
