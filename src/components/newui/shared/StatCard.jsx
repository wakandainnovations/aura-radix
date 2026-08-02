import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CARD, HUE_ICON_BG } from '../theme';

const BADGE_TONE = {
  good: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  bad: 'bg-red-500/15 text-red-400 border-red-500/30',
  neutral: 'bg-white/[0.06] text-white/60 border-white/10',
};

// Generic top-row metric tile used across every section (not the /100 score
// tiles on the My Movie Overview — see KPIScoreGrid for those).
export default function StatCard({
  icon: Icon,
  iconHue = 'blue',
  label,
  value,
  suffix,
  delta,
  deltaTone = 'good',
  caption,
  sparkline,
  sparklineColor = '#3987e5',
  badge,
}) {
  const deltaColor = deltaTone === 'good' ? 'text-emerald-400' : deltaTone === 'bad' ? 'text-red-400' : 'text-white/50';
  const DeltaIcon = deltaTone === 'bad' ? TrendingDown : TrendingUp;
  const sparkData = sparkline?.map((v, i) => ({ i, v }));

  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${HUE_ICON_BG[iconHue] ?? HUE_ICON_BG.blue}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs text-white/50 truncate">{label}</span>
        </div>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${BADGE_TONE[badge.tone ?? 'neutral']}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-2xl font-bold text-white">{value}</span>
        {suffix && <span className="text-xs text-white/35">{suffix}</span>}
        {delta && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ml-1 ${deltaColor}`}>
            <DeltaIcon className="w-3 h-3" />
            {delta}
          </span>
        )}
      </div>
      {caption && <div className="text-[11px] text-white/35 mt-0.5">{caption}</div>}

      {sparkData && (
        <div className="h-7 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={sparklineColor} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
