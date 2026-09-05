import { FileText, Sparkles, Download, MoreVertical, Users, Megaphone, TrendingUp, MessageSquare, AlertTriangle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Panel, DropdownPill } from '../shared/Panel';
import StatCard from '../shared/StatCard';
import AIInsightBar from '../shared/AIInsightBar';
import { CARD } from '../theme';
import { reportsData } from './myMovieTabsData';

const FEATURED_ICONS = { summary: FileText, audience: Users, campaign: Megaphone };
const INSIGHT_ICONS = [TrendingUp, MessageSquare, TrendingUp, AlertTriangle];

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white/50 mb-0.5">{label}</div>
      <div className="text-white font-semibold">{payload[0].value} reports</div>
    </div>
  );
}

export default function ReportsTab() {
  const d = reportsData;
  const total = d.reportsOverTime.reduce((s, r) => s + r.value, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Reports</h2>
          <p className="text-sm text-white/40">Deep insights and custom reports to help you make data-driven decisions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Create Custom Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} icon={FileText} iconHue="blue" label={s.label} value={s.value} delta={s.delta} caption="vs previous 30 days" />
        ))}
        <div className={`${CARD} p-4 flex flex-col justify-between`}>
          <div>
            <div className="text-xs text-white/50 mb-1">Quick Report Builder</div>
            <div className="text-[11px] text-white/35">Create a custom report in minutes.</div>
          </div>
          <button className="mt-3 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors self-start">
            Build Report →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <Panel title="FEATURED REPORTS">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {d.featured.map((r) => {
              const Icon = FEATURED_ICONS[r.iconKey];
              return (
                <div key={r.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-semibold text-white/90 mb-1.5">{r.title}</div>
                  <p className="text-xs text-white/45 flex-1">{r.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50">AI Generated</span>
                      <span className="text-[10px] text-white/30">{r.date}</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-white/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="RECENTLY GENERATED">
          <div className="space-y-3 flex-1">
            {d.recent.map((r) => (
              <div key={r.title} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/80 truncate">{r.title}</div>
                  <div className="text-[11px] text-white/35">
                    {r.date} · {r.tag}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-white/35">
                  <Download className="w-3.5 h-3.5" />
                  <MoreVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <Panel title="KEY INSIGHTS FROM RECENT REPORTS">
          <div className="space-y-3.5">
            {d.keyInsights.map((insight, i) => {
              const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
              return (
                <div key={insight.text} className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm text-white/80">{insight.text}</div>
                      <div className="text-[11px] text-white/35">{insight.caption}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-white/30 shrink-0 whitespace-nowrap">{insight.source} · {insight.date}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="REPORTS GENERATED OVER TIME" control={<DropdownPill>Last 30 days</DropdownPill>}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={d.reportsOverTime} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" fill="#3987e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[11px] text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" />AI Generated</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />Manually Created</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{total}</div>
              <div className="text-[11px] text-emerald-400">↑ 18% vs previous 30 days</div>
            </div>
          </div>
        </Panel>
      </div>

      <AIInsightBar
        insight={<><strong className="text-white">Generate a Regional Performance Report</strong> to identify growth opportunities in Karnataka and Kerala.</>}
        ctaLabel="Generate Report"
      />
    </div>
  );
}
