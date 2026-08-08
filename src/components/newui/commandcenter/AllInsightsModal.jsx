import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Zap, RefreshCw } from 'lucide-react';
import { TONE_ICON_BG, KIND_ICON } from './TodaysHighlights';

const TONE_TEXT = { good: 'text-emerald-400', bad: 'text-red-400', warning: 'text-white/80' };

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'good', label: 'Positive' },
  { key: 'warning', label: 'Watch' },
  { key: 'bad', label: 'Concern' },
];

function InsightRow({ highlight }) {
  const Icon = KIND_ICON[highlight.kind] ?? Zap;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${TONE_ICON_BG[highlight.tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1 flex items-baseline gap-1.5 flex-wrap">
        {highlight.value && (
          <span className={`text-sm font-semibold ${TONE_TEXT[highlight.tone]}`}>{highlight.value}</span>
        )}
        <span className="text-sm text-white/80 leading-relaxed break-words">{highlight.text}</span>
        {highlight.caption && <span className="text-xs text-white/35 shrink-0">{highlight.caption}</span>}
      </div>
    </div>
  );
}

export default function AllInsightsModal({ open, onOpenChange, highlights, updatedLabel }) {
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const c = { all: highlights.length, good: 0, warning: 0, bad: 0 };
    for (const h of highlights) c[h.tone] = (c[h.tone] ?? 0) + 1;
    return c;
  }, [highlights]);

  const visible = filter === 'all' ? highlights : highlights.filter((h) => h.tone === filter);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                TODAY'S HIGHLIGHTS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Everything driving buzz right now, in full</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-1.5 px-5 pt-3.5 pb-1 shrink-0">
            {FILTERS.map((f) => {
              const count = counts[f.key] ?? 0;
              const active = filter === f.key;
              if (f.key !== 'all' && count === 0) return null;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                      : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/75 hover:bg-white/[0.06]'
                  }`}
                >
                  {f.label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
            {visible.length > 0 ? (
              visible.map((h, i) => <InsightRow key={i} highlight={h} />)
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No highlights in this category yet.</p>
            )}
          </div>

          {updatedLabel && (
            <div className="flex items-center gap-1.5 text-xs text-white/35 px-5 py-3.5 border-t border-white/[0.06] shrink-0">
              <RefreshCw className="w-3 h-3" />
              {updatedLabel}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
