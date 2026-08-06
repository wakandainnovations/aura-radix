import { Target, ExternalLink, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { CARD } from '../theme';

const IMPACT_TONE = {
  High: 'bg-red-500/15 text-red-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  Low: 'bg-blue-500/15 text-blue-400',
};

const ICONS = { external: ExternalLink, trending: TrendingUp, eye: Eye };

function ActionCard({ action }) {
  const CornerIcon = ICONS[action.icon] ?? ExternalLink;
  return (
    <div className={`${CARD} p-4 flex flex-col`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full shrink-0 ${IMPACT_TONE[action.impact]}`}>
          {action.impact.toUpperCase()} IMPACT
        </span>
        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 shrink-0">
          <CornerIcon className="w-3.5 h-3.5" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white/90 leading-snug mb-3">{action.title}</h4>

      <div className="space-y-1.5 flex-1">
        {action.metrics ? (
          action.metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between text-xs">
              <span className="text-white/40">{m.label}</span>
              <span className="text-white/85 font-medium">{m.value}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/40">{action.note}</p>
        )}
      </div>

      <button className="mt-3 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors self-start">
        View Details
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function RecommendedActions({ actions }) {
  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center gap-1.5 mb-4">
        <Target className="w-3.5 h-3.5 text-white/40" />
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">RECOMMENDED ACTIONS</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((a) => (
          <ActionCard key={a.title} action={a} />
        ))}
      </div>
    </div>
  );
}
