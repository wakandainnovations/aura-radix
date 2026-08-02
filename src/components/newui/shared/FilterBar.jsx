import { ChevronDown, Download } from 'lucide-react';

// The row of filter dropdown pills that sits under most section headers
// (Platform / Content Type / Audience / Metric, etc). Display-only —
// selecting isn't wired up since these tabs run on static dummy data.
export default function FilterBar({ filters = [], right, rightIcon: RightIcon = Download }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
      <div className="flex items-center gap-3 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 hover:bg-white/[0.08] transition-colors"
          >
            <span className="text-white/40">{f.label}</span>
            <span className="text-white/85 font-medium">{f.value}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>
        ))}
      </div>
      <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 hover:bg-white/[0.08] transition-colors shrink-0">
        <RightIcon className="w-3.5 h-3.5" />
        {right ?? 'Last 30 days'}
        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
      </button>
    </div>
  );
}
