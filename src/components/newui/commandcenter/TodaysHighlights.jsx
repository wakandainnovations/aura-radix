import { useState } from 'react';
import { ArrowUp, ArrowDown, Music, Plus, Zap } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import AllInsightsModal from './AllInsightsModal';

const TITLE = (
  <span className="inline-flex items-center gap-1.5">
    <Zap className="w-3.5 h-3.5 text-amber-400" />
    TODAY'S HIGHLIGHTS
  </span>
);

export const TONE_ICON_BG = {
  good: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  bad: 'bg-red-500/15 text-red-400',
};

export const KIND_ICON = { arrow: ArrowUp, arrowDown: ArrowDown, music: Music, plus: Plus };

function HighlightRow({ highlight }) {
  const Icon = KIND_ICON[highlight.kind] ?? ArrowUp;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${TONE_ICON_BG[highlight.tone]}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0 flex items-baseline gap-1.5 flex-wrap">
        {highlight.value && (
          <span className={`text-sm font-semibold ${highlight.tone === 'bad' ? 'text-red-400' : highlight.tone === 'good' ? 'text-emerald-400' : 'text-white/80'}`}>
            {highlight.value}
          </span>
        )}
        <span className="text-sm text-white/75 truncate">{highlight.text}</span>
      </div>
      {highlight.caption && <span className="text-xs text-white/35 shrink-0">{highlight.caption}</span>}
    </div>
  );
}

function HighlightRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-md shrink-0 bg-white/10" />
      <div className="flex-1 h-3.5 bg-white/10 rounded" />
    </div>
  );
}

export default function TodaysHighlights({ highlights, updatedLabel, isLoading = false, className = '' }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Panel title={TITLE} className={`min-w-0 ${className}`}>
      {isLoading ? (
        <div className="space-y-3.5 flex-1 mt-2 animate-pulse" role="status" aria-label="Loading today's highlights">
          <HighlightRowSkeleton />
          <HighlightRowSkeleton />
          <HighlightRowSkeleton />
        </div>
      ) : (
        <div className="space-y-3.5 flex-1 mt-2">
          {highlights.map((h, i) => (
            <HighlightRow key={i} highlight={h} />
          ))}
        </div>
      )}
      <PanelLink onClick={() => setModalOpen(true)}>View all insights</PanelLink>

      <AllInsightsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        highlights={highlights}
        updatedLabel={updatedLabel}
      />
    </Panel>
  );
}
