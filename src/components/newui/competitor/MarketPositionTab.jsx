import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import TrendLine from '../shared/TrendLine';
import FilterBar from '../shared/FilterBar';
import AIInsightBar from '../shared/AIInsightBar';
import RadarSpider from '../shared/RadarSpider';
import { thClass, tdClass, trClass } from '../theme';
import { marketPositionData, AXIS_TICKS } from './competitorData';

const RADAR_SERIES = [
  { key: 'Veera 2', color: '#a78bfa' },
  { key: 'Rudra: The Rise', color: '#3987e5' },
  { key: 'Shadows of War', color: '#34d399' },
  { key: 'Untitled Love Story', color: '#fbbf24' },
  { key: 'Action King Returns', color: '#22d3ee' },
];

export default function MarketPositionTab() {
  const d = marketPositionData;

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Metric', value: 'Overall Strength Score' },
          { label: 'Time Period', value: 'Last 30 days' },
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Competitors', value: '5 selected' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="MARKET POSITION LEADERBOARD" info description="Overall ranking based on weighted performance across key dimensions.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Competitor</th>
                <th className={`${thClass} text-right`}>Score</th>
                <th className={`${thClass} text-right`}>Change</th>
              </tr>
            </thead>
            <tbody>
              {d.leaderboard.map((c) => (
                <tr key={c.name} className={trClass}>
                  <td className={tdClass}>
                    <span
                      className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: RADAR_SERIES[c.rank - 1]?.color ?? '#64748b' }}
                    >
                      {c.rank}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <div className="text-white/85">{c.name}</div>
                    <div className="text-[11px] text-white/35">{c.genre}</div>
                  </td>
                  <td className={`${tdClass} text-right text-white/70`}>{c.score}</td>
                  <td className={`${tdClass} text-right ${c.delta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {c.delta.startsWith('-') ? '↓' : '↑'} {c.delta.replace('-', '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="COMPETITOR POSITIONING MAP" info description="Performance across 6 key dimensions.">
          <RadarSpider data={d.radar} series={RADAR_SERIES} size={280} maxValue={100} />
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
            {RADAR_SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-[11px] text-white/50">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.key}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="MARKET SHARE OF ENGAGEMENT" info description="Share of total engagement among selected competitors.">
          <LegendDonut data={d.engagementShare} centerValue="6.4M" centerLabel="Total Engagement" size={140} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="MARKET POSITION SCORECARD" info description="Breakdown of competitor performance across key dimensions.">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className={thClass}>Dimension</th>
                <th className={`${thClass} text-right`}>Weight</th>
                {d.scorecard.rows.map((r) => (
                  <th key={r.name} className={`${thClass} text-right`}>{r.name.split(':')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.scorecard.dimensions.map((dim, i) => (
                <tr key={dim} className={trClass}>
                  <td className={`${tdClass} text-xs`}>{dim}</td>
                  <td className={`${tdClass} text-right text-white/40 text-xs`}>{d.scorecard.weights[i]}</td>
                  {d.scorecard.rows.map((r) => (
                    <td key={r.name} className={`${tdClass} text-right text-xs ${dim === 'Overall Strength Score' ? 'text-white font-semibold' : 'text-white/60'}`}>
                      {r.values[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="MOVEMENT OVER TIME" info description="How competitors' overall strength scores have changed." control={<DropdownPill>Last 30 days</DropdownPill>}>
          <TrendLine
            data={d.movementOverTime}
            series={[
              { key: 'veera2', label: 'Veera 2', color: '#a78bfa' },
              { key: 'rudra', label: 'Rudra: The Rise', color: '#3987e5' },
              { key: 'shadows', label: 'Shadows of War', color: '#34d399' },
              { key: 'uls', label: 'Untitled Love Story', color: '#fbbf24' },
              { key: 'akr', label: 'Action King Returns', color: '#22d3ee' },
            ]}
            ticks={AXIS_TICKS}
            compact={false}
            domainMax={100}
          />
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
