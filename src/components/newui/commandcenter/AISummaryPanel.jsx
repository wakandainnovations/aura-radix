import { Sparkles, RefreshCw } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';

const TITLE = (
  <span className="inline-flex items-center gap-1.5">
    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
    AI SUMMARY
  </span>
);

export default function AISummaryPanel({ summary, className = '' }) {
  return (
    <Panel title={TITLE} className={`min-w-0 ${className}`}>
      <p className="text-sm text-white/75 leading-relaxed mt-2 flex-1">{summary.text}</p>
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
