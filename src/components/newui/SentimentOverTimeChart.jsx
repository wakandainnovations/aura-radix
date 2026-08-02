import { ChevronDown, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CARD } from './theme';
import { formatCompact, niceAxisTicks } from './formatCompact';
import { AXIS_TICKS } from './dummyMovieData';

const SERIES = [
  { key: 'positive', label: 'Positive', color: '#34d399' },
  { key: 'neutral', label: 'Neutral', color: '#9ca3af' },
  { key: 'negative', label: 'Negative', color: '#f87171' },
];

function SentimentTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
      <div className="text-white/50 mb-1">{label}</div>
      {SERIES.map((s) => {
        const entry = payload.find((p) => p.dataKey === s.key);
        if (!entry) return null;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-white/70">{s.label}</span>
            <span className="text-white font-semibold ml-auto">{formatCompact(entry.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SentimentOverTimeChart({ sentimentOverTime }) {
  const maxValue = Math.max(
    ...sentimentOverTime.series.map((d) => Math.max(d.positive, d.neutral, d.negative))
  );
  const yTicks = niceAxisTicks(maxValue);
  const xTicks = sentimentOverTime.ticks ?? AXIS_TICKS;

  const totals = {
    positive: sentimentOverTime.positiveTotal,
    neutral: sentimentOverTime.neutralTotal,
    negative: sentimentOverTime.negativeTotal,
  };

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">SENTIMENT OVER TIME</h3>
          <Info className="w-3.5 h-3.5 text-white/30" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70">
          Last 30 days
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-5 mb-3 flex-wrap">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-sm font-semibold text-white">{totals[s.key]}</span>
            <span className="text-xs text-white/40">{s.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sentimentOverTime.series} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
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
          <Tooltip content={<SentimentTooltip />} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: '#05070d', strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
