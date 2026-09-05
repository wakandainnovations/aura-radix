import StatCard from '../shared/StatCard';
import { Panel, PanelLink } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import TrendLine from '../shared/TrendLine';
import BarRow from '../shared/BarRow';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { overviewData, AXIS_TICKS } from './competitorData';

const THREAT_TONE = { Low: 'good', Medium: 'warning', High: 'bad' };

export default function OverviewTab() {
  const d = overviewData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} deltaTone={s.deltaTone ?? 'good'} caption="vs previous 30 days" />
        ))}
        <div className="bg-[#0b0e19] border border-white/[0.07] rounded-2xl p-4">
          <div className="text-xs text-white/50 mb-2">Competitive Threat</div>
          <span className={`inline-block text-sm font-semibold px-2.5 py-1 rounded-full ${THREAT_TONE[d.threat] === 'warning' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
            {d.threat}
          </span>
          <div className="text-[11px] text-white/35 mt-2">vs previous 30 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="COMPETITIVE SHARE OF VOICE" info description="Share of conversations across platforms.">
          <LegendDonut data={d.shareOfVoice} centerValue="100%" centerLabel="Total" size={140} />
        </Panel>

        <Panel title="COMPETITOR BUZZ OVER TIME" info description="Compare buzz volume trends." className="lg:col-span-1">
          <TrendLine
            data={d.buzzOverTime}
            series={[
              { key: 'you', label: 'Lord Gaaga (You)', color: '#3987e5' },
              { key: 'veera2', label: 'Veera 2', color: '#a78bfa' },
              { key: 'rudra', label: 'Rudra: The Rise', color: '#34d399' },
              { key: 'shadows', label: 'Shadows of War', color: '#f97316' },
            ]}
            ticks={AXIS_TICKS}
          />
        </Panel>

        <Panel title="COMPETITOR CAMPAIGN CALENDAR" info description="Key releases and campaign milestones.">
          <div className="space-y-3 flex-1">
            {d.campaignCalendar.slice(0, 5).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-white/70 truncate">{c.name}</span>
                <span className="text-white/35 text-xs shrink-0">{c.date}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="COMPETITOR PERFORMANCE BENCHMARK" info description="Compare key performance metrics." className="lg:col-span-1">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Competitor</th>
                <th className={`${thClass} text-right`}>Buzz</th>
                <th className={`${thClass} text-right`}>Eng.</th>
                <th className={`${thClass} text-right`}>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {d.benchmark.map((c) => (
                <tr key={c.name} className={trClass}>
                  <td className={tdClass}>{c.name}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{c.buzz}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{c.engRate}</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>{c.sentiment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="AUDIENCE OVERLAP (VS YOU)" info description="How much audience overlap you have with competitors.">
          <div className="space-y-3 flex-1">
            {d.audienceOverlap.map((o) => (
              <BarRow key={o.label} label={o.label} pct={o.pct * 2} valueLabel={`${o.pct}%`} color="#a78bfa" />
            ))}
          </div>
        </Panel>

        <Panel title="COMPETITIVE INSIGHTS" info description="Key takeaways to stay ahead.">
          <div className="space-y-3.5 flex-1">
            {d.insights.map((ins) => (
              <div key={ins.text} className="text-sm">
                <div className="text-white/80">{ins.text}</div>
                <div className="text-[11px] text-white/35">{ins.caption}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
