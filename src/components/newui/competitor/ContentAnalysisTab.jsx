import StatCard from '../shared/StatCard';
import { Panel } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import BarRow from '../shared/BarRow';
import FilterBar from '../shared/FilterBar';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { contentAnalysisData } from './competitorData';

export default function ContentAnalysisTab() {
  const d = contentAnalysisData;

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Content Type', value: 'All Content' },
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Competitors', value: '5 selected' },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} caption={s.caption ?? 'vs previous 30 days'} delta={s.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="ENGAGEMENT BY CONTENT TYPE" info description="Distribution of engagement across content types.">
          <LegendDonut data={d.byType} centerValue="6.4M" centerLabel="Total Engagement" size={140} />
        </Panel>

        <Panel title="TOP CONTENT BY ENGAGEMENT" info description="Your competitors' top performing content.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Content</th>
                <th className={thClass}>Competitor</th>
                <th className={`${thClass} text-right`}>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {d.topContent.map((c) => (
                <tr key={c.title} className={trClass}>
                  <td className={tdClass}>
                    <div className="text-white/85 truncate max-w-[160px]">{c.title}</div>
                    <div className="text-[11px] text-white/35">{c.date}</div>
                  </td>
                  <td className={`${tdClass} text-white/50`}>{c.competitor}</td>
                  <td className={`${tdClass} text-right text-white/70`}>{c.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="ENGAGEMENT BY PLATFORM" info description="Where competitors get the most engagement.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Platform</th>
                <th className={`${thClass} text-right`}>Engagement</th>
                <th className={`${thClass} text-right`}>%</th>
              </tr>
            </thead>
            <tbody>
              {d.byPlatform.map((p) => (
                <tr key={p.label} className={trClass}>
                  <td className={tdClass}>{p.label}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{p.value}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{p.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="CONTENT FORMAT PERFORMANCE" info description="Average engagement by content format.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Format</th>
                <th className={`${thClass} text-right`}>Avg. Eng.</th>
                <th className={`${thClass} text-right`}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {d.formatPerformance.map((f) => (
                <tr key={f.label} className={trClass}>
                  <td className={tdClass}>{f.label}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{f.avgEng}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{f.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="POSTING FREQUENCY" info description="Average posts per day by competitor.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Competitor</th>
                <th className={`${thClass} text-right`}>Posts / Day</th>
                <th className={`${thClass} text-right`}>Change</th>
              </tr>
            </thead>
            <tbody>
              {d.postingFrequency.map((p) => (
                <tr key={p.label} className={trClass}>
                  <td className={tdClass}>{p.label}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{p.value}</td>
                  <td className={`${tdClass} text-right ${p.delta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {p.delta.startsWith('-') ? '▼' : '▲'} {p.delta.replace('-', '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="CONTENT THEMES BY ENGAGEMENT" info description="Which themes are driving the most engagement.">
          <div className="space-y-3 flex-1">
            {d.themes.map((t) => (
              <BarRow key={t.label} label={t.label} pct={t.pct * 2.5} valueLabel={`${t.value} (${t.pct}%)`} color="#a78bfa" />
            ))}
          </div>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
