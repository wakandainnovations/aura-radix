import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="text-white/70">{d.label}</span>
        <span className="text-white font-semibold ml-2">{d.pctLabel ?? `${d.value}%`}</span>
      </div>
    </div>
  );
}

// Donut (or, with innerRadius="0%", plain pie) chart with a centered total/label
// and a side legend. `data` items:
// { label, value (numeric weight for the arc), pctLabel (display string), color, sub (optional secondary text) }
// Pass `onSliceClick(datum)` to make both the arc and its legend row a
// drill-down trigger (e.g. Topics of Discussion opening the classified posts
// behind a slice) - omitted, the chart renders exactly as before.
export default function LegendDonut({ data, centerValue, centerLabel, size = 160, legendCols = 1, innerRadius = '68%', onSliceClick }) {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={innerRadius}
              outerRadius="100%"
              stroke="#05070d"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  cursor={onSliceClick ? 'pointer' : undefined}
                  onClick={onSliceClick ? () => onSliceClick(d) : undefined}
                />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="text-xl font-extrabold text-white">{centerValue}</span>}
          {centerLabel && <span className="text-[11px] text-white/40 text-center px-4">{centerLabel}</span>}
        </div>
      </div>

      <div className={`grid gap-x-5 gap-y-2.5 flex-1 min-w-[120px] ${legendCols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {data.map((d, i) => {
          const Row = onSliceClick ? 'button' : 'div';
          return (
            <Row
              key={i}
              {...(onSliceClick && { type: 'button', onClick: () => onSliceClick(d) })}
              className={`min-w-0 text-sm text-left ${onSliceClick ? 'group cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className={`text-white/70 truncate ${onSliceClick ? 'group-hover:text-white/95' : ''}`}>{d.label}</span>
              </div>
              <div className="text-white/85 font-medium pl-[18px] text-xs">{d.pctLabel ?? `${d.value}%`}</div>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
