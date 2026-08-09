import { Sparkles, RefreshCw } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';

const TITLE = (
  <span className="inline-flex items-center gap-1.5">
    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
    AI SUMMARY
  </span>
);

export default function AISummaryPanel({ summary, isLoading = false, className = '' }) {
  return (
    <Panel title={TITLE} className={`min-w-0 ${className}`}>
      {isLoading ? (
        <div className="mt-2 flex-1 space-y-2 animate-pulse" role="status" aria-label="Loading AI summary">
          <div className="h-3.5 bg-white/10 rounded w-full" />
          <div className="h-3.5 bg-white/10 rounded w-11/12" />
          <div className="h-3.5 bg-white/10 rounded w-2/3" />
        </div>
      ) : (
        <p className="text-sm text-white/75 leading-relaxed mt-2 flex-1">{summary.text}</p>
      )}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/[0.06]">
        <span className="flex items-center gap-1.5 text-xs text-white/35">
          <RefreshCw className="w-3 h-3" />
          {summary.updatedLabel}
        </span>
        <PanelLink className="mt-0">View full summary</PanelLink>
      </div>
    </Panel>
  );
}
