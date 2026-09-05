import StatCard from '../shared/StatCard';
import { Panel, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import TrendLine from '../shared/TrendLine';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { budgetingData } from './campaignData';

const PACE_TONE = { 'On Track': 'text-emerald-400', Under: 'text-amber-400', Over: 'text-red-400' };

export default function BudgetingTab() {
  const d = budgetingData;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <DropdownPill>Next 30 days</DropdownPill>
        <DropdownPill>INR (₹)</DropdownPill>
        <DropdownPill>All Channels</DropdownPill>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} caption={s.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <Panel title="BUDGET ALLOCATION BY CAMPAIGN" info description="Breakdown of budget across all campaigns.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Campaign</th>
                <th className={`${thClass} text-right`}>Budget</th>
                <th className={`${thClass} text-right`}>Spent</th>
                <th className={`${thClass} text-right`}>Remaining</th>
                <th className={`${thClass} text-right`}>Pace</th>
              </tr>
            </thead>
            <tbody>
              {d.byCampaign.map((c) => (
                <tr key={c.name} className={trClass}>
                  <td className={tdClass}>{c.name}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{c.budget} ({c.pct}%)</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full ${c.pace === 'Under' ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${c.spentPct}%` }} />
                      </div>
                      <span className="text-white/60">{c.spentPct}%</span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-right text-white/60`}>{c.remaining}</td>
                  <td className={`${tdClass} text-right font-medium ${PACE_TONE[c.pace]}`}>{c.pace}</td>
                </tr>
              ))}
              <tr className={trClass}>
                <td className={`${tdClass} font-semibold`}>Total</td>
                <td className={`${tdClass} text-right font-semibold`}>₹4.8 Cr</td>
                <td className={`${tdClass} text-right font-semibold`}>39%</td>
                <td className={`${tdClass} text-right font-semibold`}>₹2.9 Cr</td>
                <td className={tdClass}></td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="BUDGET ALLOCATION BY CHANNEL" info description="Distribution of budget across channels.">
          <LegendDonut data={d.byChannel} centerValue="₹4.8 Cr" centerLabel="Total Budget" size={140} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="DAILY BUDGET PACE" info description="Cumulative spend vs planned budget." className="lg:col-span-1">
          <TrendLine
            data={d.dailyPace}
            series={[
              { key: 'planned', label: 'Planned Spend', color: '#94a3b8' },
              { key: 'actual', label: 'Actual Spend', color: '#3987e5' },
            ]}
          />
        </Panel>

        <Panel title="BUDGET FORECAST" info description="Projected spend by end of period.">
          <div className="mb-3">
            <div className="text-2xl font-bold text-white">{d.forecast.total}</div>
            <div className="text-[11px] text-white/35">Projected total spend</div>
            <div className="text-xs text-emerald-400 mt-1">{d.forecast.variance} vs plan</div>
          </div>
          <div className="space-y-2 flex-1 text-sm">
            <div className="flex justify-between"><span className="text-white/50">Best case</span><span className="text-emerald-400">{d.forecast.best}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Most likely</span><span className="text-white/80">{d.forecast.likely}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Worst case</span><span className="text-red-400">{d.forecast.worst}</span></div>
          </div>
        </Panel>

        <Panel title="TOP OVER / UNDER SPEND" info description="Campaigns with the highest variance.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Campaign</th>
                <th className={`${thClass} text-right`}>Variance</th>
                <th className={`${thClass} text-right`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.overUnder.map((o) => (
                <tr key={o.name} className={trClass}>
                  <td className={tdClass}>{o.name}</td>
                  <td className={`${tdClass} text-right ${o.status === 'Over' ? 'text-red-400' : 'text-emerald-400'}`}>{o.variance} ({o.pct})</td>
                  <td className={`${tdClass} text-right ${o.status === 'Over' ? 'text-red-400' : 'text-emerald-400'}`}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
