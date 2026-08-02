import { Info, ChevronDown, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CARD, scoreColor } from './theme';
import { AXIS_TICKS } from './dummyMovieData';

// 270-degree speedometer gauge with a 90-degree gap centered at the bottom.
// rotation = 90 + gap/2 places the arc's start point at bottom-left; see
// theme.js scoreColor for the value->color mapping shared with the KPI tiles.
function Gauge({ value, size = 168, strokeWidth = 14 }) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const sweep = 270;
  const rotation = 90 + (360 - sweep) / 2;
  const trackLength = circumference * (sweep / 360);
  const progressLength = trackLength * (Math.max(0, Math.min(100, value)) / 100);
  const color = scoreColor(value);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${trackLength} ${circumference - trackLength}`}
        strokeLinecap="round"
        transform={`rotate(${rotation} ${cx} ${cy})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color.stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={`${progressLength} ${circumference - progressLength}`}
        strokeLinecap="round"
        transform={`rotate(${rotation} ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white/50 mb-0.5">{label}</div>
      <div className="text-white font-semibold">{payload[0].value}/100</div>
    </div>
  );
}

export default function HealthScoreCard({ healthScore }) {
  const color = scoreColor(healthScore.value);

  return (
    <div className={`${CARD} p-6`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">MOVIE HEALTH SCORE</h3>
          <Info className="w-3.5 h-3.5 text-white/30" />
        </div>
      </div>

      <div className="flex items-center gap-8 flex-wrap">
        <div className="relative shrink-0" style={{ width: 168, height: 168 }}>
          <Gauge value={healthScore.value} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">{healthScore.value}</span>
              <span className="text-sm text-white/40">/100</span>
            </div>
            <div className={`text-sm font-semibold mt-1 ${color.text}`}>{healthScore.label}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1.5">
              <TrendingUp className="w-3 h-3" />
              {healthScore.deltaLabel}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[280px]">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-white/50 max-w-md">
              A holistic score that represents the overall health of your release across 6 key
              dimensions.
            </p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 whitespace-nowrap ml-3">
              Last 30 days
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs text-white/40 mb-1">Score trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={healthScore.trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="healthScoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                ticks={AXIS_TICKS}
                interval="preserveStartEnd"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#healthScoreFill)"
                dot={false}
                activeDot={{ r: 4, fill: '#34d399', stroke: '#05070d', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
