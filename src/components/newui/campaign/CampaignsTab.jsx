import { Search } from 'lucide-react';
import StatCard from '../shared/StatCard';
import { Panel, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import TrendLine from '../shared/TrendLine';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { campaignsData, AXIS_TICKS } from './campaignData';

const STATUS_TONE = { Active: 'bg-emerald-500/15 text-emerald-400', Scheduled: 'bg-blue-500/15 text-blue-400', Draft: 'bg-white/[0.06] text-white/50' };

export default function CampaignsTab() {
  const d = campaignsData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} deltaTone={s.deltaTone ?? 'good'} caption={s.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <Panel title="ALL CAMPAIGNS" info description="Manage and track all your marketing campaigns.">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/40 flex-1 min-w-[180px]">
              <Search className="w-4 h-4" />
              Search campaigns...
            </div>
            <DropdownPill>Status: All</DropdownPill>
            <DropdownPill>Objective: All</DropdownPill>
            <DropdownPill>Sort by: Performance</DropdownPill>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>Campaign</th>
                  <th className={thClass}>Objective</th>
                  <th className={`${thClass} text-right`}>Budget</th>
                  <th className={`${thClass} text-right`}>Spent</th>
                  <th className={`${thClass} text-right`}>Eng. Rate</th>
                  <th className={`${thClass} text-right`}>ROAS</th>
                  <th className={`${thClass} pl-4`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.all.map((c) => (
                  <tr key={c.name} className={trClass}>
                    <td className={tdClass}>{c.name}</td>
                    <td className={`${tdClass} text-white/50`}>{c.objective}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{c.budget}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{c.spent}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{c.rate}</td>
                    <td className={`${tdClass} text-right text-emerald-400`}>{c.roas}</td>
                    <td className={`${tdClass} pl-4`}>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_TONE[c.status]}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-white/35 mt-3">Showing 1 to {d.all.length} of {d.all.length} campaigns</div>
        </Panel>

        <div className="space-y-4">
          <Panel title="CAMPAIGN STATUS BREAKDOWN" info description="Distribution by status.">
            <LegendDonut data={d.statusBreakdown} centerValue="7" centerLabel="Total" size={120} />
          </Panel>

          <Panel title="TOP PERFORMING CAMPAIGN" info description="By engagement rate.">
            <div className="text-sm text-white/85">{d.topPerforming.name}</div>
            <div className="text-[11px] text-white/35 mb-2">{d.topPerforming.category}</div>
            <div className="text-2xl font-bold text-emerald-400">{d.topPerforming.rate}</div>
          </Panel>
        </div>
      </div>

      <Panel title="PERFORMANCE OVERVIEW" info description="Aggregate performance trend.">
        <TrendLine
          data={d.performanceOverTime}
          series={[
            { key: 'impressions', label: 'Impressions', color: '#a78bfa' },
            { key: 'engagement', label: 'Engagement Rate (%)', color: '#3987e5' },
            { key: 'roas', label: 'ROAS (x)', color: '#34d399' },
          ]}
          ticks={AXIS_TICKS}
        />
      </Panel>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
