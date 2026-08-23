import { TrendingUp, Hash, Ticket, User, Newspaper, Send, Bot, Youtube, Film, UserCheck, Instagram, ShieldAlert } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import StatCard from '../shared/StatCard';
import { Panel, PanelLink } from '../shared/Panel';
import TrendLine from '../shared/TrendLine';
import { CARD } from '../theme';
import { thClass, tdClass, trClass } from '../theme';
import { overviewData } from './warRoomData';

const ACTION_ICONS = [Youtube, Film, UserCheck, Instagram, ShieldAlert];

const ALERT_ICONS = { trend: TrendingUp, hashtag: Hash, ticket: Ticket, user: User, article: Newspaper };
const STATUS_TONE = { Normal: 'bg-white/[0.06] text-white/50', Rising: 'bg-amber-500/15 text-amber-400' };

function SemiGauge({ value, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 20;
  const angle = -180 + (value / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + r * 0.8 * Math.cos(rad);
  const needleY = cy + r * 0.8 * Math.sin(rad);

  return (
    <svg width={size} height={size / 1.7} viewBox={`0 0 ${size} ${size / 1.7}`}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#f87171" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.5} />
      <path d={`M ${cx - r * 0.5} ${cy - r * 0.87} A ${r} ${r} 0 0 1 ${cx + r * 0.5} ${cy - r * 0.87}`} stroke="#fbbf24" strokeWidth={14} fill="none" opacity={0.6} />
      <path d={`M ${cx - r * 0.15} ${cy - r * 0.99} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#34d399" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="white" />
      <text x={cx} y={cy - 30} textAnchor="middle" className="fill-white" style={{ fontSize: 32, fontWeight: 800 }}>{value}</text>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-emerald-400" style={{ fontSize: 13, fontWeight: 600 }}>Healthy</text>
      <text x={20} y={cy + 14} className="fill-white/30" style={{ fontSize: 11 }}>0</text>
      <text x={size - 24} y={cy + 14} className="fill-white/30" style={{ fontSize: 11 }}>100</text>
      <text x={cx} y={14} textAnchor="middle" className="fill-white/30" style={{ fontSize: 11 }}>50</text>
    </svg>
  );
}

export default function OverviewTab() {
  const d = overviewData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} delta={s.delta} deltaTone={s.deltaTone ?? 'good'} caption={s.caption} badge={s.badge} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="LIVE BUZZ TREND" info description="Updates every minute.">
          <div className="mb-2">
            <span className="text-xs text-white/40">Total Mentions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">888K</span>
              <span className="text-xs text-emerald-400">↑ 42% vs previous 60 min</span>
            </div>
          </div>
          <TrendLine data={d.buzzTrend} series={[{ key: 'value', label: 'Mentions', color: '#3987e5' }]} height={140} area />
          <div className="space-y-1.5 mt-3">
            {d.buzzBreakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-xs">
                <span className="w-14 text-white/50">{b.label}</span>
                <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                </div>
                <span className="w-8 text-right text-white/60">{b.pct}%</span>
              </div>
            ))}
          </div>
          <PanelLink>View full live monitoring</PanelLink>
        </Panel>

        <Panel title="MOVIE HEALTH" info>
          <div className="flex justify-center">
            <SemiGauge value={d.healthScore} />
          </div>
          <div className="text-xs font-semibold text-white/50 mb-2 mt-2">HEALTH DRIVERS</div>
          <div className="space-y-2 flex-1">
            {d.healthDrivers.map((h) => (
              <div key={h.label} className="flex items-center gap-2 text-xs">
                <span className="w-28 text-white/60 shrink-0">{h.label}</span>
                <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${h.level === 'Strong' ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${h.pct}%` }} />
                </div>
                <span className={`w-16 text-right shrink-0 ${h.level === 'Strong' ? 'text-emerald-400' : 'text-amber-400'}`}>{h.level}</span>
              </div>
            ))}
          </div>
          <PanelLink>View health breakdown</PanelLink>
        </Panel>

        <Panel title="LIVE ALERTS" info control={<PanelLink>View all alerts</PanelLink>}>
          <div className="space-y-3.5 flex-1">
            {d.liveAlerts.map((a) => {
              const Icon = ALERT_ICONS[a.iconKey];
              return (
                <div key={a.text} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white/80 leading-snug">{a.text}</div>
                    <div className="text-[11px] text-white/35">{a.caption}</div>
                  </div>
                  <span className="text-[11px] text-white/30 shrink-0 whitespace-nowrap">{a.time}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="PLATFORM HEALTH" info control={<PanelLink>View platform watch</PanelLink>}>
          <div className="space-y-3 flex-1">
            {d.platformHealth.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="w-20 text-sm text-white/70 shrink-0">{p.label}</span>
                <div className="h-6 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={p.spark.map((v, i) => ({ i, v }))}>
                      <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${STATUS_TONE[p.status]}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="TOP EMERGING TOPICS" info control={<PanelLink>View all topics</PanelLink>}>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Topic</th>
                <th className={`${thClass} text-right`}>Volume</th>
                <th className={`${thClass} text-right`}>Change</th>
              </tr>
            </thead>
            <tbody>
              {d.emergingTopics.map((t) => (
                <tr key={t.label} className={trClass}>
                  <td className={tdClass}>{t.rank}</td>
                  <td className={tdClass}>{t.label}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{t.volume}</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>↑ {t.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="AI COPILOT" info description="Analyzing live data" control={<Bot className="w-4 h-4 text-blue-400" />}>
          <div className="text-sm text-white/75 whitespace-pre-line flex-1">{d.aiMessage}</div>
          <div className="flex items-center gap-2 mt-3">
            <input className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/50 placeholder:text-white/30" placeholder="Ask AI Copilot" readOnly />
            <button className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </Panel>
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">RECOMMENDED ACTIONS</h3>
          <PanelLink className="mt-0">View all recommendations</PanelLink>
        </div>
        <div className="flex flex-wrap gap-3">
          {d.actions.map((a, i) => {
            const Icon = ACTION_ICONS[i % ACTION_ICONS.length];
            return (
              <div key={a.text} className="flex-1 min-w-[180px] bg-white/[0.03] border border-white/[0.07] rounded-lg p-3">
                <Icon className="w-4 h-4 text-white/50 mb-2" />
                <div className="text-xs text-white/75 mb-2">{a.text}</div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${a.impact === 'High' ? 'bg-emerald-500/15 text-emerald-400' : a.impact === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.06] text-white/50'}`}>
                  {a.impact} Impact
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
