import { Users, Heart, Frown, Eye, Activity } from 'lucide-react';
import StatCard from '../shared/StatCard';
import { Panel } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass } from '../theme';
import { overviewData, AXIS_TICKS } from './audienceData';

const ICONS = [Users, Heart, Frown, Eye, Activity];

export default function OverviewTab() {
  const d = overviewData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {d.stats.map((s, i) => (
            <StatCard
              key={s.label}
              icon={ICONS[i]}
              iconHue={i === 2 ? 'red' : 'violet'}
              label={s.label}
              value={s.value}
              delta={s.delta}
              deltaTone={s.deltaTone ?? 'good'}
              caption="vs previous 30 days"
              sparkline={s.spark}
              sparklineColor={s.color}
            />
          ))}
        </div>

        <Panel title="AUDIENCE MOOD" info>
          <LegendDonut data={d.mood} centerValue="81%" centerLabel="Positive" size={130} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <Panel title="AUDIENCE GROWTH OVER TIME" info description="Track how your audience size has grown across platforms.">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-2xl font-extrabold text-white">6.2M</span>
            <span className="text-xs text-white/40">Total Audience</span>
            <span className="text-xs text-emerald-400">↑ 18% vs previous 30 days</span>
          </div>
          <TrendLine
            data={d.growth}
            series={[
              { key: 'total', label: 'Total', color: '#a78bfa' },
              { key: 'social', label: 'Social Media', color: '#3987e5' },
              { key: 'news', label: 'News & Blogs', color: '#34d399' },
              { key: 'forums', label: 'Forums & Communities', color: '#fbbf24' },
            ]}
            ticks={AXIS_TICKS}
          />
        </Panel>

        <Panel title="TOP AUDIENCE SEGMENTS" info description="Your strongest audience segments by size and sentiment.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Segment</th>
                <th className={thClass}>Audience</th>
                <th className={`${thClass} text-right`}>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {d.segments.map((s) => (
                <tr key={s.label} className={trClass}>
                  <td className={tdClass}>{s.label}</td>
                  <td className={`${tdClass} text-white/50`}>{s.audience} ({s.pct}%)</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>{s.sentiment}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="TOP INTERESTS" info description="What your audience loves and engages with.">
          <div className="space-y-3 flex-1">
            {d.interests.map((it) => (
              <BarRow key={it.label} label={it.label} pct={it.pct} color="#a78bfa" />
            ))}
          </div>
        </Panel>

        <Panel title="CONVERSATION VOLUME" info description="Breakdown of conversations across topics.">
          <LegendDonut data={d.conversationVolume} centerValue="3.8M" centerLabel="Total Mentions" size={130} />
        </Panel>

        <Panel title="SENTIMENT OVER TIME" info description="How sentiment has changed over time.">
          <TrendLine
            data={d.sentimentOverTime}
            series={[
              { key: 'positive', label: 'Positive', color: '#34d399' },
              { key: 'neutral', label: 'Neutral', color: '#94a3b8' },
              { key: 'negative', label: 'Negative', color: '#f87171' },
            ]}
            ticks={AXIS_TICKS}
            compact={false}
            domainMax={100}
            height={160}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <Panel title="TOP PLATFORMS" info description="Where your audience is most active.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Platform</th>
                <th className={`${thClass} text-right`}>Audience</th>
                <th className={`${thClass} text-right`}>Share</th>
              </tr>
            </thead>
            <tbody>
              {d.platforms.map((p) => (
                <tr key={p.label} className={trClass}>
                  <td className={tdClass}>{p.label}</td>
                  <td className={`${tdClass} text-right text-white/50`}>{p.audience}</td>
                  <td className={`${tdClass} text-right`}>{p.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="AUDIENCE VOICE" info description="What your audience is saying right now.">
          <div className="space-y-3.5 flex-1">
            {d.voice.map((v, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/75">&ldquo;{v.quote}&rdquo;</p>
                </div>
                <span className="text-[11px] text-white/30 shrink-0 whitespace-nowrap">{v.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
