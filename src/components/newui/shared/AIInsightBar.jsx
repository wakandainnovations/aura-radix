import { Sparkles, CheckCircle2 } from 'lucide-react';
import { CARD } from '../theme';

const IMPACT_TONE = {
  High: 'bg-emerald-500/15 text-emerald-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  Low: 'bg-white/[0.06] text-white/50',
};

function ImpactTag({ impact }) {
  if (!impact) return null;
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${IMPACT_TONE[impact] ?? IMPACT_TONE.Low}`}>
      {impact} Impact
    </span>
  );
}

// The "AI INSIGHT" + "RECOMMENDED ACTIONS" bar that closes out almost every
// screen. `actions` items: { icon, text, impact }. `ctaLabel` renders a
// button on the far right (e.g. "View AI Recommendations").
export default function AIInsightBar({ insight, actions, ctaLabel, layout = 'list' }) {
  return (
    <div className={`${CARD} p-5 flex flex-col lg:flex-row gap-6`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wide text-white/50 mb-1">AI INSIGHT</div>
          {Array.isArray(insight) ? (
            <div className="space-y-1.5">
              {insight.map((line, i) => (
                <p key={i} className="text-sm text-white/75">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/75">{insight}</p>
          )}
        </div>
      </div>

      {actions && actions.length > 0 && (
        <div className={`flex-1 min-w-0 ${layout === 'cards' ? 'flex flex-wrap gap-3' : 'space-y-2.5'}`}>
          {actions.map((a, i) =>
            layout === 'cards' ? (
              <div key={i} className="flex-1 min-w-[160px] bg-white/[0.03] border border-white/[0.07] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  {a.icon && <a.icon className="w-3.5 h-3.5 text-white/50 shrink-0" />}
                  <span className="text-xs text-white/75">{a.text}</span>
                </div>
                <ImpactTag impact={a.impact} />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <span className="text-white/70 flex-1 min-w-0">{a.text}</span>
                <ImpactTag impact={a.impact} />
              </div>
            )
          )}
        </div>
      )}

      {ctaLabel && (
        <button className="self-start lg:self-end shrink-0 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors whitespace-nowrap">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
