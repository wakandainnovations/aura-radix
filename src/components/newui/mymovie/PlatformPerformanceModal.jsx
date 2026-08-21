import * as Dialog from '@radix-ui/react-dialog';
import { X, Radio } from 'lucide-react';
import BarRow from '../shared/BarRow';

function PlatformSentimentCard({ platform }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: platform.color }} />
        <span className="text-sm font-medium text-white/85">{platform.label}</span>
      </div>
      <div className="space-y-2.5">
        <BarRow label="Positive" pct={platform.positivePct} valueLabel={`${platform.positivePct}%`} color="#34d399" />
        <BarRow label="Neutral" pct={platform.neutralPct} valueLabel={`${platform.neutralPct}%`} color="#94a3b8" />
        <BarRow label="Negative" pct={platform.negativePct} valueLabel={`${platform.negativePct}%`} color="#f87171" />
      </div>
    </div>
  );
}

export default function PlatformPerformanceModal({ open, onOpenChange, data = [] }) {
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
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                PLATFORM PERFORMANCE
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Sentiment split for every platform your conversations are happening on</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {data.length > 0 ? (
              data.map((platform) => <PlatformSentimentCard key={platform.key ?? platform.label} platform={platform} />)
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No platform data available yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
