import { useState } from 'react';
import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import AIInsightBar from '../shared/AIInsightBar';
import TabRow from '../shared/TabRow';
import { thClass, tdClass, trClass } from '../theme';
import { creativeOverviewData } from './campaignData';

const SUB_TABS = ['Overview', 'Messaging', 'Content Ideas', 'Creative Production', 'Approvals'];

function CreativePlanOverview() {
  const d = creativeOverviewData;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} delta={s.delta} caption={s.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="CREATIVE PERFORMANCE OVERVIEW" info description="Performance of creative assets across formats.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Format</th>
                <th className={`${thClass} text-right`}>Assets</th>
                <th className={`${thClass} text-right`}>Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {d.performance.map((p) => (
                <tr key={p.format} className={trClass}>
                  <td className={tdClass}>{p.format}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{p.assets}</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>{p.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all assets performance</PanelLink>
        </Panel>

        <Panel title="ENGAGEMENT BY PLATFORM" info description="Where your creative assets drive the most engagement.">
          <LegendDonut data={d.byPlatform} centerValue="6.4M" centerLabel="Total Engagement" size={140} />
          <PanelLink>View platform breakdown</PanelLink>
        </Panel>

        <Panel title="TOP PERFORMING ASSETS" info description="Based on engagement rate." control={<DropdownPill>Last 30 days</DropdownPill>}>
          <div className="space-y-3 flex-1">
            {d.topAssets.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-white/[0.08] text-white/60 text-[11px] font-bold flex items-center justify-center shrink-0">{a.rank}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white/80 truncate">{a.name}</div>
                  <div className="text-[11px] text-white/35">{a.type} · {a.date}</div>
                </div>
                <span className="text-emerald-400 text-sm shrink-0">{a.rate}</span>
              </div>
            ))}
          </div>
          <PanelLink>View all top assets</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="CREATIVE CONCEPT PIPELINE" info description="Track concepts from ideation to production.">
          <div className="grid grid-cols-5 gap-2 flex-1">
            {d.pipeline.map((stage) => (
              <div key={stage.stage} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                <div className="text-[10px] font-semibold text-white/40 uppercase whitespace-nowrap">{stage.stage}</div>
                <div className="text-lg font-bold text-white mb-1.5">{stage.count}</div>
                <div className="space-y-1">
                  {stage.items.map((it) => (
                    <div key={it} className="text-[10px] text-white/45 truncate">{it}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View full pipeline</PanelLink>
        </Panel>

        <Panel title="CREATIVE TESTING INSIGHTS" info description="A/B test performance across creative variations.">
          <div className="space-y-4 flex-1">
            {d.testing.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/70">{t.name}</span>
                  <span className="text-emerald-400 text-xs">Winner: {t.winner}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/40 mb-0.5">
                  <span className="w-3">A</span>
                  <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${t.a}%` }} />
                  </div>
                  <span className="w-8 text-right">{t.a}%</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  <span className="w-3">B</span>
                  <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${t.b}%` }} />
                  </div>
                  <span className="w-8 text-right">{t.b}%</span>
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View all test results</PanelLink>
        </Panel>

        <Panel title="ASSET APPROVALS" info description="Review and approve creative assets.">
          <div className="space-y-3 flex-1">
            {d.approvals.map((a) => (
              <div key={a.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/80 truncate">{a.name}</div>
                  <div className="text-[11px] text-white/35">{a.type} · {a.date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Pending</span>
                  <button className="px-2.5 py-1 rounded-lg border border-white/10 text-xs text-white/70 hover:bg-white/[0.05] transition-colors">Review</button>
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View all approvals</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}

export default function CreativePlanTab() {
  const [subTab, setSubTab] = useState('Overview');

  return (
    <div className="p-6 space-y-4">
      <TabRow tabs={SUB_TABS} activeTab={subTab} onTabChange={setSubTab} size="sm" />
      {subTab === 'Overview' ? (
        <CreativePlanOverview />
      ) : (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white/80 mb-2">{subTab}</h2>
            <p className="text-sm text-white/40">This tab hasn't been designed yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
