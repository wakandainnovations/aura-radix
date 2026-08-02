import { ChevronDown, TrendingUp, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CARD } from './theme';
import { formatCompact, niceAxisTicks } from './formatCompact';
import { AXIS_TICKS } from './dummyMovieData';

function BuzzTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white/50 mb-0.5">{label}</div>
      <div className="text-white font-semibold">{formatCompact(payload[0].value)} mentions</div>
    </div>
  );
}

export default function BuzzOverTimeChart({ buzzOverTime }) {
  const maxValue = Math.max(...buzzOverTime.series.map((d) => d.value));
  const yTicks = niceAxisTicks(maxValue);
  const xTicks = buzzOverTime.ticks ?? AXIS_TICKS;

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">BUZZ OVER TIME</h3>
          <Info className="w-3.5 h-3.5 text-white/30" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70">
          Last 30 days
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-3xl font-extrabold text-white">{buzzOverTime.totalLabel}</span>
        <span className="text-xs text-white/40">{buzzOverTime.totalCaption}</span>
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          {buzzOverTime.deltaPct}% vs yesterday
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={buzzOverTime.series} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="buzzFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3987e5" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3987e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            ticks={xTicks}
            interval="preserveStartEnd"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.max(1, yTicks[yTicks.length - 1])]}
            ticks={yTicks}
            tickFormatter={formatCompact}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<BuzzTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3987e5"
            strokeWidth={2}
            fill="url(#buzzFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#3987e5', stroke: '#05070d', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
