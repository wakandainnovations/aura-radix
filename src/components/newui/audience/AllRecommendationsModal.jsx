import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

const IMPACT_TONE = {
  High: 'bg-emerald-500/15 text-emerald-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  Low: 'bg-white/[0.06] text-white/50',
};

// Full-list companion to the AI Insight bar's top-3 preview - opened via its
// "View AI Recommendations" CTA. `data` items: { text, impact }, already
// ranked High > Medium > Low by useInfluencersData.
export default function AllRecommendationsModal({ open, onOpenChange, insight, data = [] }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,680px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI RECOMMENDATIONS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Every collaboration recommendation for this movie's top spreaders</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {insight && <p className="text-sm text-white/75 mb-4">{insight}</p>}

            {data.length > 0 ? (
              <div className="space-y-3">
                {data.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <span className="text-white/70 flex-1 min-w-0">{a.text}</span>
                    {a.impact && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${IMPACT_TONE[a.impact] ?? IMPACT_TONE.Low}`}>
                        {a.impact} Impact
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No recommendations found for this movie yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
