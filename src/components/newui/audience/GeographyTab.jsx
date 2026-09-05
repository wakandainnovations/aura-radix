import { MapPin, TrendingUp, Globe2 } from 'lucide-react';
import { Panel } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import TrendLine from '../shared/TrendLine';
import FilterBar from '../shared/FilterBar';
import GeoPlaceholder from '../shared/GeoPlaceholder';
import { thClass, tdClass, trClass } from '../theme';
import { geographyData } from './audienceData';

const INSIGHT_ICONS = [MapPin, TrendingUp, Globe2];

function DeltaTable({ rows }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thClass}>Location</th>
          <th className={`${thClass} text-right`}>Buzz</th>
          <th className={`${thClass} text-right`}>Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className={trClass}>
            <td className={tdClass}>{r.label}</td>
            <td className={`${tdClass} text-right text-white/50`}>{r.value}</td>
            <td className={`${tdClass} text-right ${r.delta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
              {r.delta.startsWith('-') ? '↓' : '↑'} {r.delta.replace('-', '')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function GeographyTab() {
  const d = geographyData;

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Metric', value: 'Buzz' },
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Content Type', value: 'All Content' },
          { label: 'Audience', value: 'All Audiences' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="BUZZ BY COUNTRY" info description="Where your movie is getting the most buzz.">
          <GeoPlaceholder markers={d.worldMarkers} height={160} className="mb-3" />
          <DeltaTable rows={d.countries} />
        </Panel>
        <Panel title="BUZZ BY STATE (INDIA)" info description="Breakdown of buzz across Indian states.">
          <GeoPlaceholder markers={d.indiaMarkers} height={160} className="mb-3" />
          <DeltaTable rows={d.states} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="TOP CITIES BY BUZZ" info description="Cities driving the highest buzz for your movie.">
          <DeltaTable rows={d.cities} />
        </Panel>
        <Panel title="BUZZ SHARE BY REGION (INDIA)" info description="Share of total buzz by region.">
          <LegendDonut data={d.regionShare} centerValue="6.0M" centerLabel="Total Buzz" size={130} />
        </Panel>
        <Panel title="GROWTH HOTSPOTS" info description="Fastest growing cities in the last 30 days.">
          <DeltaTable rows={d.hotspots.map((h) => ({ ...h, delta: h.delta }))} />
        </Panel>
      </div>

      <Panel title="INSIGHTS" info description="What's driving geographic trends.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {d.insights.map((ins, i) => {
            const Icon = INSIGHT_ICONS[i];
            return (
              <div key={ins.text} className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-white/80">{ins.text}</div>
                  <div className="text-[11px] text-white/35">{ins.caption}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
        <Panel title="BUZZ OVER TIME BY REGION (INDIA)" info description="Regional buzz trends over the selected period.">
          <TrendLine
            data={d.regionTrend}
            series={[
              { key: 'south', label: 'South', color: '#a78bfa' },
              { key: 'west', label: 'West', color: '#3987e5' },
              { key: 'north', label: 'North', color: '#34d399' },
              { key: 'east', label: 'East', color: '#f97316' },
              { key: 'central', label: 'Central', color: '#f472b6' },
            ]}
          />
        </Panel>
        <Panel title="COMPARE LOCATIONS" info description="Compare buzz between up to 4 locations.">
          <div className="grid grid-cols-2 gap-3 flex-1">
            {d.compareLocations.map((loc) => (
              <div key={loc.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: loc.color }} />
                  <span className="text-xs text-white/60 truncate">{loc.label}</span>
                </div>
                <div className="text-lg font-bold text-white">{loc.value}</div>
                <div className="text-[11px] text-emerald-400">↑ {loc.delta}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
