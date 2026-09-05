import { AlertTriangle } from 'lucide-react';
import StatCard from '../shared/StatCard';
import { Panel, DropdownPill } from '../shared/Panel';
import TrendLine from '../shared/TrendLine';
import { CARD, thClass, tdClass, trClass } from '../theme';
import { crisisManagementData } from './warRoomData';

const SEVERITY_TONE = { Critical: 'bg-red-500/15 text-red-400', Medium: 'bg-amber-500/15 text-amber-400', Low: 'bg-white/[0.06] text-white/50' };
const TIMELINE_TONE = { bad: 'bg-red-400', info: 'bg-blue-400', good: 'bg-emerald-400' };

function RecoveryRing({ label, value, sub }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width={80} height={80}>
        <circle cx={40} cy={40} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={8} fill="none" />
        <circle cx={40} cy={40} r={r} stroke="#34d399" strokeWidth={8} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 40 40)" />
        <text x={40} y={45} textAnchor="middle" className="fill-white" style={{ fontSize: 16, fontWeight: 700 }}>{value}%</text>
      </svg>
      <div className="text-[11px] text-white/40 mt-1">{sub}</div>
      <div className="text-xs text-emerald-400 font-medium">{label}</div>
    </div>
  );
}

export default function CrisisManagementTab() {
  const d = crisisManagementData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} caption={s.caption} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="ACTIVE ISSUES" info>
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Issue</th>
                <th className={thClass}>Severity</th>
                <th className={thClass}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {d.activeIssues.map((i) => (
                <tr key={i.issue} className={trClass}>
                  <td className={tdClass}>
                    <div className="text-white/80 max-w-[180px]">{i.issue}</div>
                    <div className="text-[11px] text-white/35">{i.detected}</div>
                  </td>
                  <td className={tdClass}>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${SEVERITY_TONE[i.severity]}`}>{i.severity}</span>
                  </td>
                  <td className={tdClass}>
                    <div className="text-white/60">{i.owner}</div>
                    <div className="text-[11px] text-white/35">{i.role}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="CRISIS TIMELINE" info>
          <div className="space-y-4 flex-1">
            {d.timeline.map((t, i) => (
              <div key={t.title} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${TIMELINE_TONE[t.tone]}`} />
                  {i < d.timeline.length - 1 && <span className="w-px flex-1 bg-white/10 mt-1" style={{ minHeight: 24 }} />}
                </div>
                <div>
                  <div className="text-xs text-white/40">{t.time}</div>
                  <div className="text-sm text-white/80">{t.title}</div>
                  <div className="text-[11px] text-white/35">{t.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="AI RECOMMENDED ACTIONS" info>
          <div className="space-y-3 flex-1">
            {d.aiActions.map((a) => (
              <div key={a.text} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm text-white/80 truncate">{a.text}</div>
                  <div className="text-[11px] text-white/35 truncate">{a.caption}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.impact && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${a.impact === 'High' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {a.impact} Impact
                    </span>
                  )}
                  <button className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors">{a.cta}</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="SENTIMENT RECOVERY TRACKER" info>
          <div className="flex items-center justify-around flex-1">
            <RecoveryRing label="Positive" sub="Before Crisis (9:00 AM)" value={d.recovery.before} />
            <span className="text-white/20">→</span>
            <RecoveryRing label="Positive" sub="Current (9:55 AM)" value={d.recovery.current} />
            <span className="text-white/20">→</span>
            <RecoveryRing label="Positive" sub="Target (Next 2 Hours)" value={d.recovery.target} />
          </div>
          <div className="text-center text-xs text-white/40 mt-2">
            Recovery trend <span className="text-emerald-400">↗ +{d.recoveryTrend}</span> since crisis started
          </div>
        </Panel>

        <Panel title="SENTIMENT OVER TIME" info control={<DropdownPill>Last 60 min</DropdownPill>}>
          <TrendLine
            data={d.sentimentOverTime}
            series={[
              { key: 'positive', label: 'Positive', color: '#34d399' },
              { key: 'neutral', label: 'Neutral', color: '#3987e5' },
              { key: 'negative', label: 'Negative', color: '#f87171' },
            ]}
            compact={false}
            domainMax={100}
          />
        </Panel>

        <Panel title="TOP CONCERN TOPICS" info description="By volume.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Topic</th>
                <th className={`${thClass} text-right`}>Mentions</th>
              </tr>
            </thead>
            <tbody>
              {d.concernTopics.map((t) => (
                <tr key={t.label} className={trClass}>
                  <td className={tdClass}>{t.rank}</td>
                  <td className={tdClass}>{t.label}</td>
                  <td className={`${tdClass} text-right ${t.trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {t.mentions} {t.trend === 'up' ? '↑' : '↓'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">QUICK ACTIONS</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {d.quickActions.map((a) => (
            <button key={a} className="px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/75 hover:bg-white/[0.05] transition-colors">
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
