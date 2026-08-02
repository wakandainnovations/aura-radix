import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import StatCard from '../shared/StatCard';
import { Panel, PanelLink } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { distributionData } from './campaignData';

function UtilTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white/50 mb-0.5">{label}</div>
      <div className="text-white font-semibold">{payload[0].value}% utilized</div>
    </div>
  );
}

export default function DistributionPlanTab() {
  const d = distributionData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} deltaTone={s.deltaTone ?? 'good'} caption={s.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <Panel title="DISTRIBUTION PLAN" info description="Channel-wise allocation and scheduling.">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>Channel</th>
                  <th className={`${thClass} text-right`}>Alloc.</th>
                  <th className={`${thClass} text-right`}>Budget (₹Cr)</th>
                  <th className={`${thClass} text-right`}>Impr. (Cr)</th>
                  <th className={`${thClass} text-right`}>Reach (Cr)</th>
                  <th className={`${thClass} text-right`}>CPM (₹)</th>
                  <th className={`${thClass} pl-4`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.plan.map((p) => (
                  <tr key={p.channel} className={trClass}>
                    <td className={tdClass}>{p.channel}</td>
                    <td className={`${tdClass} text-right text-white/50`}>{p.pct}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{p.budget}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{p.impressions}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{p.reach}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{p.cpm}</td>
                    <td className={`${tdClass} pl-4`}>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="DISTRIBUTION OVERVIEW" info>
          <LegendDonut data={d.overview} centerValue="₹4.8 Cr" centerLabel="Total Budget" size={140} />
          <PanelLink>View full breakdown</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="CHANNEL SCHEDULE" info description="Campaign flight across channels." className="lg:col-span-1">
          <div className="space-y-3 flex-1">
            {d.schedule.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-20 text-xs text-white/60 shrink-0">{s.label}</span>
                <div className="relative flex-1 h-6">
                  <div className={`absolute h-6 rounded-md flex items-center justify-center text-[10px] text-white font-medium ${s.color}`} style={{ left: `${s.startPct}%`, width: `${s.widthPct}%` }}>
                    {s.range}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View full timeline</PanelLink>
        </Panel>

        <Panel title="BUDGET UTILIZATION" info description="Planned vs Utilized." className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.utilization} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<UtilTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="pct" fill="#3987e5" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} fill="rgba(255,255,255,0.6)" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <PanelLink>View expenditure details</PanelLink>
        </Panel>

        <Panel title="RECOMMENDED ACTIONS" info>
          <div className="space-y-2.5 flex-1">
            {d.actions.map((a) => (
              <div key={a.text} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white/70 flex-1 min-w-0">{a.text}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${a.impact === 'High' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {a.impact} Impact
                </span>
              </div>
            ))}
          </div>
          <PanelLink>View all recommendations</PanelLink>
        </Panel>
      </div>

      <div className="bg-[#0b0e19] border border-white/[0.07] rounded-2xl p-5 flex flex-col lg:flex-row gap-6">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">◈</div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-white/50 mb-1">AI INSIGHT</div>
            <p className="text-sm text-white/75">{d.aiInsight}</p>
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="text-xs font-semibold tracking-wide text-white/50 mb-1">KEY TAKEAWAY</div>
          {d.keyTakeaways.map((t) => (
            <div key={t.text} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/70 flex-1 min-w-0">{t.text}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${t.impact === 'High' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {t.impact} Impact
              </span>
            </div>
          ))}
        </div>
        <button className="self-start lg:self-end shrink-0 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors whitespace-nowrap">
          View AI Recommendations
        </button>
      </div>
    </div>
  );
}
