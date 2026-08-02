import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import FilterBar from '../shared/FilterBar';
import AIInsightBar from '../shared/AIInsightBar';
import { thClass, tdClass, trClass, PLATFORM_COLOR } from '../theme';
import { conversationsData, AXIS_TICKS } from './audienceData';

const SENTIMENT_TONE = { Positive: 'text-emerald-400 bg-emerald-500/15', Neutral: 'text-amber-400 bg-amber-500/15', Negative: 'text-red-400 bg-red-500/15' };
const FEED_FILTERS = ['All', 'X (Twitter)', 'Instagram', 'Reddit'];
const DRIVER_TABS = ['Engagement', 'Volume', 'Velocity'];

export default function ConversationsTab() {
  const d = conversationsData;
  const [feedFilter, setFeedFilter] = useState('All');
  const [driverTab, setDriverTab] = useState('Engagement');

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          { label: 'Platform', value: 'All Platforms' },
          { label: 'Content Type', value: 'All Content' },
          { label: 'Audience', value: 'All Audiences' },
          { label: 'Sentiment', value: 'All Sentiments' },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px_360px] gap-4">
        <Panel title="CONVERSATION VOLUME OVER TIME" info description="Track how conversations about your movie are trending." control={<DropdownPill>Buzz</DropdownPill>}>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-2xl font-extrabold text-white">3.2M</span>
            <span className="text-xs text-emerald-400">↑ 18% vs previous 30 days</span>
          </div>
          <TrendLine data={d.volumeOverTime} series={[{ key: 'value', label: 'Buzz', color: '#a78bfa' }]} ticks={AXIS_TICKS} area />
          <PanelLink>View detailed trend</PanelLink>
        </Panel>

        <Panel title="SENTIMENT BREAKDOWN" info description="Overall sentiment distribution.">
          <LegendDonut data={d.sentimentBreakdown} centerValue="81%" centerLabel="Positive" size={130} />
          <PanelLink>View sentiment analysis</PanelLink>
        </Panel>

        <Panel title="TOP CONVERSATION TOPICS" info description="What people are talking about most.">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Topic</th>
                <th className={`${thClass} text-right`}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {d.topics.map((t) => (
                <tr key={t.label} className={trClass}>
                  <td className={tdClass}>{t.label}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="text-white/70">{t.value}</div>
                    <div className="text-[11px] text-emerald-400">↑ {t.delta}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View all topics</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px_360px] gap-4">
        <Panel title="LATEST CONVERSATIONS" info description="Real conversations from across platforms.">
          <div className="flex items-center gap-1.5 flex-wrap mb-3 -mx-1">
            {FEED_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFeedFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium mx-1 transition-colors ${
                  f === feedFilter ? 'bg-blue-600/20 text-blue-400' : 'text-white/50 hover:bg-white/[0.04]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-4 flex-1">
            {d.latest
              .filter((c) => feedFilter === 'All' || c.platform === feedFilter)
              .map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white/85">{c.handle}</span>
                      <span className="text-[11px] text-white/30">{c.time}</span>
                    </div>
                    <p className="text-sm text-white/70 mt-0.5">{c.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLOR[c.platform]}22`, color: PLATFORM_COLOR[c.platform] }}>
                        {c.platform}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${SENTIMENT_TONE[c.sentiment]}`}>{c.sentiment}</span>
                      <span className="text-[11px] text-white/30 ml-auto">{c.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <PanelLink>View all conversations</PanelLink>
        </Panel>

        <Panel title="SENTIMENT BY PLATFORM" info description="Where sentiment is strongest (or weakest).">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>Platform</th>
                <th className={`${thClass} text-right`}>Pos</th>
                <th className={`${thClass} text-right`}>Neu</th>
                <th className={`${thClass} text-right`}>Neg</th>
                <th className={`${thClass} text-right`}>Net</th>
              </tr>
            </thead>
            <tbody>
              {d.sentimentByPlatform.map((p) => (
                <tr key={p.platform} className={trClass}>
                  <td className={tdClass}>{p.platform}</td>
                  <td className={`${tdClass} text-right text-emerald-400`}>{p.positive}%</td>
                  <td className={`${tdClass} text-right text-white/40`}>{p.neutral}%</td>
                  <td className={`${tdClass} text-right text-red-400`}>{p.negative}%</td>
                  <td className={`${tdClass} text-right text-white/70`}>{p.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PanelLink>View platform breakdown</PanelLink>
        </Panel>

        <Panel title="CONVERSATION DRIVERS" info description="What's driving the most engagement.">
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
            {d.drivers.map((driver) => (
              <BarRow key={driver.label} label={driver.label} pct={driver.pct * 2.5} valueLabel={`${driver.pct}%`} color="#a78bfa" />
            ))}
          </div>
          <PanelLink>View all drivers</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
