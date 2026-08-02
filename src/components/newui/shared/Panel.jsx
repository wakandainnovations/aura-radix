import { Info, ArrowRight, ChevronDown } from 'lucide-react';
import { CARD } from '../theme';

// The header pattern repeated on nearly every card in the new UI: an
// uppercase title, an optional (i) tooltip icon, and an optional control
// (dropdown button, link, tab pills) pinned to the right.
export function Panel({ title, info, description, control, className = '', children }) {
  return (
    <div className={`${CARD} p-5 flex flex-col ${className}`}>
      {(title || control) && (
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {title && <h3 className="text-sm font-semibold text-white/90 tracking-wide truncate">{title}</h3>}
            {info && <Info className="w-3.5 h-3.5 text-white/30 shrink-0" />}
          </div>
          {control && <div className="shrink-0">{control}</div>}
        </div>
      )}
      {description && <p className="text-xs text-white/40 mb-3">{description}</p>}
      {children}
    </div>
  );
}

export function PanelLink({ children = 'View more', onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`mt-3 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors self-start ${className}`}
    >
      {children}
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}

export function DropdownPill({ children }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 whitespace-nowrap hover:bg-white/[0.08] transition-colors">
      {children}
      <ChevronDown className="w-3.5 h-3.5" />
    </button>
  );
}
