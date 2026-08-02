import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { overviewData } from './campaignData';

export default function OverviewTab() {
  const d = overviewData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} caption={s.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="CAMPAIGN FUNNEL" info description="Overall performance across the campaign funnel.">
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {d.funnel.map((f) => (
              <div key={f.label} className="flex items-center gap-4">
                <div
                  className="h-10 rounded-md flex items-center px-4"
                  style={{ width: `${f.widthPct}%`, backgroundColor: `${f.color}33`, border: `1px solid ${f.color}66` }}
                >
                  <span className="text-sm font-medium text-white/85">{f.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{f.value}</div>
                  <div className="text-[11px] text-emerald-400">↑ {f.delta} vs prev 30 days</div>
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View funnel analysis</PanelLink>
        </Panel>

        <Panel title="CAMPAIGN TIMELINE" info description="Key campaign milestones and schedule." control={<DropdownPill>Next 60 days</DropdownPill>}>
          <div className="space-y-2.5 flex-1">
            {d.timeline.map((t) => (
              <div key={t.label} className="relative h-8">
                <div
                  className="absolute h-8 rounded-md flex items-center px-2.5"
                  style={{ left: `${t.startPct}%`, width: `${t.widthPct}%`, backgroundColor: `${t.color}33`, border: `1px solid ${t.color}66` }}
                >
                  <span className="text-[11px] font-medium text-white/85 truncate">{t.label}</span>
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View full calendar</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="TOP CAMPAIGNS BY PERFORMANCE" info description="Ranked by engagement rate.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Campaign</th>
                <th className={`${thClass} text-right`}>Eng. Rate</th>
                <th className={`${thClass} text-right`}>Impressions</th>
              </tr>
            </thead>
            <tbody>
              {d.topCampaigns.map((c) => (
                <tr key={c.name} className={trClass}>
                  <td className={tdClass}>{c.name}</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>{c.rate}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{c.impressions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all campaigns</PanelLink>
        </Panel>

        <Panel title="BUDGET ALLOCATION" info description="Budget distribution across campaign objectives.">
          <LegendDonut data={d.budgetAllocation} centerValue="₹4.8 Cr" centerLabel="Total Budget" size={140} />
          <PanelLink>View budget details</PanelLink>
        </Panel>

        <Panel title="CHANNEL MIX" info description="Budget allocation by channel.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Channel</th>
                <th className={`${thClass} text-right`}>Budget</th>
                <th className={`${thClass} text-right`}>%</th>
              </tr>
            </thead>
            <tbody>
              {d.channelMix.map((c) => (
                <tr key={c.label} className={trClass}>
                  <td className={tdClass}>{c.label}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{c.budget}</td>
                  <td className={`${tdClass} text-right`}>{c.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View channel mix</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
