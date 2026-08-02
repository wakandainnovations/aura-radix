import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompact, niceAxisTicks } from '../formatCompact';

function TrendTooltip({ active, payload, label, series, valueFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
      <div className="text-white/50 mb-1">{label}</div>
      {series.map((s) => {
        const entry = payload.find((p) => p.dataKey === s.key);
        if (!entry) return null;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-white/70">{s.label}</span>
            <span className="text-white font-semibold ml-auto">{valueFormatter ? valueFormatter(entry.value) : entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// Generic multi-series line/area trend chart. `series`: [{ key, label, color }].
// `data`: rows keyed by `xKey` plus each series key. Pass `area: true` for a
// single-series filled area chart (health score / buzz style); multi-series
// always renders as lines to avoid overlapping fills.
export default function TrendLine({
  data,
  series,
  xKey = 'date',
  ticks,
  height = 200,
  area = false,
  compact = true,
  domainMax,
  yWidth = 44,
}) {
  const Chart = area && series.length === 1 ? AreaChart : LineChart;
  const maxValue = domainMax ?? Math.max(...data.flatMap((d) => series.map((s) => d[s.key] ?? 0)), 1);
  const yTicks = niceAxisTicks(maxValue);
  const valueFormatter = compact ? formatCompact : (v) => v;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        {area && (
          <defs>
            <linearGradient id={`trendFill-${series[0].key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0].color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={series[0].color} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey={xKey}
          ticks={ticks}
          interval="preserveStartEnd"
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, yTicks[yTicks.length - 1]]}
          ticks={yTicks}
          tickFormatter={valueFormatter}
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={yWidth}
        />
        <Tooltip content={<TrendTooltip series={series} valueFormatter={valueFormatter} />} />
        {series.map((s) =>
          area && series.length === 1 ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#trendFill-${s.key})`}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: '#05070d', strokeWidth: 2 }}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: '#05070d', strokeWidth: 2 }}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
