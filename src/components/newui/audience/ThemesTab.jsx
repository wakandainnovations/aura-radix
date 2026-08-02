import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Star, Music2, Heart } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import FilterBar from '../shared/FilterBar';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { themesData, AXIS_TICKS } from './audienceData';

const OPP_ICON_BG = { amber: 'bg-amber-500/15 text-amber-400', green: 'bg-emerald-500/15 text-emerald-400', purple: 'bg-purple-500/15 text-purple-400' };
const DRIVER_TABS = ['Mass Action & Heroism', 'Comedy & Dialogues', 'Emotional Connection'];

export default function ThemesTab() {
  const d = themesData;
  const [driverTab, setDriverTab] = useState(DRIVER_TABS[0]);

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Content Type', value: 'All Content' },
          { label: 'Audience', value: 'All Audiences' },
          { label: 'Metric', value: 'Buzz' },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <Panel title="THEME PERFORMANCE" info description="Themes driving the most audience engagement and buzz.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Theme</th>
                <th className={thClass}>Engagement</th>
                <th className={`${thClass} text-right`}>Buzz</th>
                <th className={`${thClass} text-right`}>Sentiment</th>
                <th className={`${thClass} text-right`}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {d.themes.map((t) => (
                <tr key={t.label} className={trClass}>
                  <td className={tdClass}>
                    <span
                      className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.rank}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <div className="text-white/85">{t.label}</div>
                    <div className="text-[11px] text-white/35">{t.caption}</div>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2 w-32">
                      <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.score}%`, backgroundColor: t.color }} />
                      </div>
                      <span className="text-xs text-white/60 shrink-0">{t.score}/100</span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="text-white/70">{t.buzz}</div>
                    <div className="text-[11px] text-emerald-400">↑ {t.buzzDelta}</div>
                  </td>
                  <td className={`${tdClass} text-right text-emerald-400`}>{t.sentiment}%</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="w-16 h-6 inline-block">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={t.spark.map((v, i) => ({ i, v }))}>
                          <Line type="monotone" dataKey="v" stroke={t.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all themes</PanelLink>
        </Panel>

        <Panel title="THEME IMPACT ON INTENT" info description="How themes influence audience intent.">
          <div className="space-y-4 flex-1">
            {d.intent.map((it) => (
              <BarRow key={it.label} label={it.label} pct={it.pct} color={it.color} />
            ))}
          </div>
          <PanelLink>View intent analysis</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="THEME BUZZ OVER TIME" info description="Buzz volume for top themes over time." className="lg:col-span-1">
          <TrendLine
            data={d.buzzOverTime}
            series={[
              { key: 'action', label: 'Mass Action & Heroism', color: '#a78bfa' },
              { key: 'comedy', label: 'Comedy & Dialogues', color: '#3987e5' },
              { key: 'emotional', label: 'Emotional Connection', color: '#34d399' },
              { key: 'music', label: 'Music & Soundtrack', color: '#f97316' },
            ]}
            ticks={AXIS_TICKS}
            height={220}
          />
          <PanelLink>View detailed trend</PanelLink>
        </Panel>

        <Panel title="TOP THEME DRIVERS" info description="What content is driving these themes.">
          <div className="flex items-center gap-1.5 flex-wrap mb-3 -mx-1">
            {DRIVER_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setDriverTab(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium mx-1 transition-colors ${
                  t === driverTab ? 'bg-blue-600/20 text-blue-400' : 'text-white/50 hover:bg-white/[0.04]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-3 flex-1">
            {(d.drivers[driverTab] ?? d.drivers['Mass Action & Heroism']).map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{c.label}</div>
                  <div className="text-[11px] text-white/35">{c.type}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm text-white/70">{c.value}</div>
                  <div className="text-[11px] text-emerald-400">↑ {c.delta}</div>
                </div>
              </div>
            ))}
          </div>
          <PanelLink>View all drivers</PanelLink>
        </Panel>

        <Panel title="THEME OPPORTUNITIES" info description="Themes with high potential but lower content supply.">
          <div className="space-y-3 flex-1">
            {d.opportunities.map((o) => (
              <div key={o.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${OPP_ICON_BG[o.color]}`}>
                  <Star className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{o.label}</div>
                  <div className="text-[11px] text-white/35 truncate">{o.caption}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-white/35">Opportunity</div>
                  <div className="text-sm font-semibold text-white">{o.score}/100</div>
                </div>
                <button className="shrink-0 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/70 hover:bg-white/[0.05] transition-colors">
                  Explore
                </button>
              </div>
            ))}
          </div>
          <PanelLink>View all opportunities</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} ctaLabel="View AI Recommendations" />
    </div>
  );
}
