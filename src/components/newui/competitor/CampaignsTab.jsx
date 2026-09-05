import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { campaignsData, AXIS_TICKS } from './competitorData';

export default function CampaignsTab() {
  const d = campaignsData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} deltaTone={s.deltaTone ?? 'good'} caption="vs previous 30 days" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <Panel title="TOP COMPETITOR CAMPAIGNS" info description="Overview of top performing campaigns by spend and engagement." control={<DropdownPill>Sort by: Spend</DropdownPill>}>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Campaign</th>
                <th className={thClass}>Competitor</th>
                <th className={`${thClass} text-right`}>Spend</th>
                <th className={`${thClass} text-right`}>CTR</th>
                <th className={`${thClass} text-right`}>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {d.topCampaigns.map((c) => (
                <tr key={c.name} className={trClass}>
                  <td className={tdClass}>
                    <div className="text-white/85">{c.name}</div>
                    <div className="text-[11px] text-white/35">{c.movie}</div>
                  </td>
                  <td className={`${tdClass} text-white/50`}>{c.competitor}</td>
                  <td className={`${tdClass} text-right text-white/70`}>{c.spend}</td>
                  <td className={`${tdClass} text-right text-white/70`}>{c.ctr}</td>
                  <td className={`${tdClass} text-right text-white/70`}>{c.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="CAMPAIGN PERFORMANCE OVER TIME" info description="Spend and engagement volume trends.">
          <TrendLine
            data={d.performanceOverTime}
            series={[
              { key: 'spend', label: 'Total Spend (₹)', color: '#3987e5' },
              { key: 'engagement', label: 'Engagement', color: '#34d399' },
            ]}
            ticks={AXIS_TICKS}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="SPEND DISTRIBUTION BY PLATFORM" info description="Where competitors are investing the most.">
          <LegendDonut data={d.spendDistribution} centerValue="₹4.8 Cr" centerLabel="Total Spend" size={140} />
        </Panel>

        <Panel title="SHARE OF VOICE" info description="Comparing how much each competitor is being talked about.">
          <div className="space-y-3 flex-1">
            {d.shareOfVoice.map((s) => (
              <BarRow key={s.label} label={s.label} pct={s.pct * 2} valueLabel={`${s.pct}% (${s.delta})`} color="#a78bfa" />
            ))}
          </div>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
