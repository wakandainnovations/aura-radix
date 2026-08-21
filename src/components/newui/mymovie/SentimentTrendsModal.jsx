import * as Dialog from '@radix-ui/react-dialog';
import { X, TrendingUp } from 'lucide-react';
import BarRow from '../shared/BarRow';
import { formatCompact } from '../formatCompact';

const SECTIONS = [
  { key: 'positive', label: 'Positive posts', color: '#34d399' },
  { key: 'neutral', label: 'Neutral posts', color: '#94a3b8' },
  { key: 'negative', label: 'Negative posts', color: '#f87171' },
];

function SentimentSection({ label, color, platforms }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-white/85">{label}</span>
      </div>
      {platforms.length > 0 ? (
        <div className="space-y-2.5">
          {platforms.map((p) => (
            <BarRow key={p.key ?? p.label} label={p.label} pct={p.pct} valueLabel={`${formatCompact(p.count)} (${p.pct}%)`} color={p.color} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/35 py-1">No posts in this category yet.</p>
      )}
    </div>
  );
}

export default function SentimentTrendsModal({ open, onOpenChange, data }) {
  const breakdown = data ?? { positive: [], neutral: [], negative: [] };

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
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                SENTIMENT TRENDS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Which platform each sentiment is coming from</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {SECTIONS.map((section) => (
              <SentimentSection key={section.key} label={section.label} color={section.color} platforms={breakdown[section.key] ?? []} />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
