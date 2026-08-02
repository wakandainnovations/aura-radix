import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Bubble(props) {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={11} fill={fill} fillOpacity={0.85} stroke="#05070d" strokeWidth={2} />;
}
import { Download } from 'lucide-react';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import VennCluster from '../shared/VennCluster';
import FilterBar from '../shared/FilterBar';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass, PLATFORM_COLOR } from '../theme';
import { influencersData } from './audienceData';

const SENTIMENT_TONE = { Positive: 'text-emerald-400 bg-emerald-500/15', Neutral: 'text-white/50 bg-white/[0.06]', Negative: 'text-red-400 bg-red-500/15' };

function ImpactTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-white font-semibold">{p.name}</div>
      <div className="text-white/50">Impact {p.impact} · Eng. {p.engRate}%</div>
    </div>
  );
}

export default function InfluencersTab() {
  const d = influencersData;

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Content Type', value: 'All Content' },
          { label: 'Audience', value: 'All Audiences' },
          { label: 'Metric', value: 'Engagement' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <Panel
          title="TOP INFLUENCERS"
          info
          description="Influencers driving the most engagement for your movie."
          control={
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          }
        >
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Influencer</th>
                <th className={thClass}>Platform</th>
                <th className={`${thClass} text-right`}>Followers</th>
                <th className={`${thClass} text-right`}>Eng. Rate</th>
                <th className={`${thClass} text-right`}>Impact</th>
                <th className={`${thClass} text-right`}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {d.influencers.map((inf) => (
                <tr key={inf.name} className={trClass}>
                  <td className={tdClass}>{inf.rank}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/85 truncate">{inf.name}</div>
                        <div className="text-[11px] text-white/35 truncate">{inf.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLOR[inf.platform]}22`, color: PLATFORM_COLOR[inf.platform] }}>
                      {inf.platform}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right text-white/60`}>{inf.followers}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{inf.engRate}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${inf.impact}%` }} />
                      </div>
                      <span className="text-white/70">{inf.impact}</span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="w-16 h-6 inline-block">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={inf.spark.map((v, i) => ({ i, v }))}>
                          <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all influencers</PanelLink>
        </Panel>

        <Panel title="INFLUENCER IMPACT MAP" info description="Impact vs. engagement rate.">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" dataKey="impact" name="Impact Score" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
              <YAxis type="number" dataKey="engRate" name="Engagement Rate" domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ImpactTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
              {d.impactMap.map((p, i) => (
                <Scatter key={i} data={[p]} fill={p.color} shape={Bubble} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          <PanelLink>View full map</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <Panel title="INFLUENCER CONTENT PERFORMANCE" info description="How content from influencers is performing.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Content</th>
                <th className={thClass}>Influencer</th>
                <th className={`${thClass} text-right`}>Reach</th>
                <th className={`${thClass} text-right`}>Eng.</th>
                <th className={`${thClass} text-right`}>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {d.content.map((c) => (
                <tr key={c.title} className={trClass}>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/85 truncate">{c.title}</div>
                        <div className="text-[11px] text-white/35">{c.date}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdClass} text-white/60`}>{c.influencer}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{c.reach}</td>
                  <td className={`${tdClass} text-right text-white/60`}>{c.engagement} ({c.engRate})</td>
                  <td className={`${tdClass} text-right`}>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${SENTIMENT_TONE[c.sentiment]}`}>{c.sentiment}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all influencer content</PanelLink>
        </Panel>

        <Panel title="INFLUENCER AUDIENCE OVERLAPPING" info description="Overlap of influencer audiences with your target.">
          <VennCluster
            height={200}
            circles={[
              { xPct: 35, yPct: 42, size: 150, color: '#a78bfa' },
              { xPct: 60, yPct: 42, size: 150, color: '#3987e5' },
              { xPct: 47, yPct: 62, size: 150, color: '#34d399' },
            ]}
            zoneLabels={[
              { text: '18%', xPct: 22, yPct: 32 },
              { text: '15%', xPct: 72, yPct: 32 },
              { text: '15%', xPct: 47, yPct: 78 },
              { text: '21%', xPct: 47, yPct: 52 },
            ]}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
            {d.overlap.map((o) => (
              <div key={o.label} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: o.color }} />
                {o.label}
              </div>
            ))}
          </div>
          <PanelLink>View overlap details</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
