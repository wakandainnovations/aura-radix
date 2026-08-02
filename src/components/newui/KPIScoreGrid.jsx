import { Volume2, Eye, Smile, Rocket, Globe, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CARD, HUE_ICON_BG, scoreColor } from './theme';

const ICONS = {
  buzz: Volume2,
  awareness: Eye,
  sentiment: Smile,
  momentum: Rocket,
  reach: Globe,
  engagement: Users,
};

function KPITile({ kpi }) {
  const Icon = ICONS[kpi.key] ?? Volume2;
  const color = scoreColor(kpi.value);
  const sparkData = kpi.spark.map((v, i) => ({ i, v }));

  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${HUE_ICON_BG[kpi.hue] ?? HUE_ICON_BG.blue}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-white/60 leading-tight">{kpi.label}</span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{kpi.value}</span>
        <span className="text-xs text-white/35">/100</span>
      </div>
      <div className={`text-xs font-medium mt-0.5 ${color.text}`}>{kpi.rating}</div>

      <div className="flex items-center justify-between mt-2">
        <div className={`flex items-center gap-1 text-[11px] ${color.text}`}>
          <TrendingUp className="w-3 h-3" />
          {kpi.deltaPct}% vs yesterday
        </div>
      </div>

      <div className="h-8 mt-1.5 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" stroke={color.stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function KPIScoreGrid({ kpis }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <KPITile key={kpi.key} kpi={kpi} />
      ))}
    </div>
  );
}
