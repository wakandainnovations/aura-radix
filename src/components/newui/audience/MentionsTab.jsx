import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import BarRow from '../shared/BarRow';
import TrendLine from '../shared/TrendLine';
import { PLATFORM_COLOR } from '../theme';
import { AXIS_TICKS } from './audienceData';
import { formatCompact } from '../formatCompact';
import useConversationsData from './useConversationsData';
import AspectPostsModal from './AspectPostsModal';

const SENTIMENT_TONE = { Positive: 'text-emerald-400 bg-emerald-500/15', Neutral: 'text-amber-400 bg-amber-500/15', Negative: 'text-red-400 bg-red-500/15' };
const FEED_FILTERS = ['All', 'X (Twitter)', 'Instagram', 'Reddit'];

// Each Conversation Drivers tab re-ranks the same aspects by a different
// metric from review-aspect-breakdown, so switching tabs is client-side only.
const DRIVER_TABS = [
  {
    label: 'Volume',
    key: 'sharePct',
    format: (d) => `${d.sharePct.toFixed(1)}%`,
    sublabel: (d) => `${formatCompact(d.posts)} posts`,
  },
  {
    label: 'Velocity',
    key: 'postsPerDay',
    format: (d) => `${d.postsPerDay.toFixed(1)}/day`,
    sublabel: (d) => `${formatCompact(d.posts)} posts`,
  },
  {
    label: 'Engagement',
    key: 'engagementRate',
    format: (d) => (d.engagementRate == null ? '—' : `${d.engagementRate.toFixed(1)}%`),
    sublabel: (d) => `${formatCompact(d.views)} views · ${formatCompact(d.posts)} posts`,
  },
];

// Bars are colored by the aspect's majority sentiment so the panel shows not
// just what's driving talk but whether that talk is good news.
const DRIVER_SENTIMENT_COLOR = { positive: '#34d399', neutral: '#fbbf24', negative: '#f87171' };

// Same option set as classic UI's TimeRangeSelector.jsx. Defaults to 90 days
// rather than a shorter window because sentiment-over-time's DAY bucket only
// covers the trailing ~8 days, which is often behind an entity's most recent
// ingested data - DAY90 reliably has something to show.
const VOLUME_RANGE_OPTIONS = [
  { value: 'DAY', label: 'Past 7 days' },
  { value: 'DAY15', label: 'Past 15 days' },
  { value: 'DAY30', label: 'Past 30 days' },
  { value: 'DAY90', label: 'Past 90 days' },
];

// Classic UI shows Total/Positive/Negative sentiment trend as three separate
// panels (SentimentGraphsGrid) - here they're one panel whose title, series
// color, and underlying data flip based on this selector.
const SENTIMENT_METRIC_OPTIONS = [
  { value: 'total', label: 'Overall' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
];

const SENTIMENT_METRIC_CONFIG = {
  total: { title: 'TOTAL MENTIONS', seriesLabel: 'Buzz', color: '#a78bfa', seriesKey: 'volumeOverTime', totalKey: 'volumeTotal', deltaKey: 'volumeDeltaPct' },
  positive: { title: 'POSITIVE SENTIMENT TIMELINE', seriesLabel: 'Positive', color: '#34d399', seriesKey: 'positiveOverTime', totalKey: 'positiveTotal', deltaKey: 'positiveDeltaPct' },
  negative: { title: 'NEGATIVE SENTIMENT TIMELINE', seriesLabel: 'Negative', color: '#f87171', seriesKey: 'negativeOverTime', totalKey: 'negativeTotal', deltaKey: 'negativeDeltaPct' },
};

function PanelSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse" role="status" aria-label="Loading">
      <div className="h-3.5 bg-white/10 rounded w-2/3" />
      <div className="h-3.5 bg-white/10 rounded w-1/2" />
      <div className="h-3.5 bg-white/10 rounded w-3/5" />
    </div>
  );
}

export default function ConversationsTab({ selectedMovie }) {
  const [volumeRange, setVolumeRange] = useState('DAY90');
  const d = useConversationsData(selectedMovie, volumeRange);
  const [feedFilter, setFeedFilter] = useState('All');
  const [driverTab, setDriverTab] = useState(DRIVER_TABS[0].label);
  const [sentimentMetric, setSentimentMetric] = useState('total');
  const [aspectModal, setAspectModal] = useState(null); // { category, label } | null
  const metricConfig = SENTIMENT_METRIC_CONFIG[sentimentMetric];

  // Re-rank drivers by the active tab's metric and scale each bar against the
  // top row, since engagement rate and posts/day have no natural 0-100 range
  // the way share-of-posts does.
  const driverConfig = DRIVER_TABS.find((t) => t.label === driverTab) ?? DRIVER_TABS[0];
  const rankedDrivers = [...d.drivers]
    .sort((a, b) => (b[driverConfig.key] ?? 0) - (a[driverConfig.key] ?? 0))
    .slice(0, 5);
  const driverMax = Math.max(...rankedDrivers.map((r) => r[driverConfig.key] ?? 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <Panel
          title={metricConfig.title}
          info
          description="Track how conversations about your movie are trending."
          control={
            <div className="flex items-center gap-2">
              <DropdownPill options={SENTIMENT_METRIC_OPTIONS} value={sentimentMetric} onChange={setSentimentMetric} />
              <DropdownPill options={VOLUME_RANGE_OPTIONS} value={volumeRange} onChange={setVolumeRange} />
            </div>
          }
        >
          {d.isVolumeLoading ? (
            <PanelSkeleton />
          ) : (
            <>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl font-extrabold text-white">{d[metricConfig.totalKey]}</span>
                {d[metricConfig.deltaKey] != null && (
                  <span className={`text-xs ${d[metricConfig.deltaKey] >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {d[metricConfig.deltaKey] >= 0 ? '↑' : '↓'} {Math.abs(d[metricConfig.deltaKey])}% vs previous day
                  </span>
                )}
              </div>
              <TrendLine
                data={d[metricConfig.seriesKey]}
                series={[{ key: 'value', label: metricConfig.seriesLabel, color: metricConfig.color }]}
                ticks={d.volumeTicks ?? AXIS_TICKS}
                area
              />
            </>
          )}
          <PanelLink>View detailed trend</PanelLink>
        </Panel>

        <Panel title="CONVERSATION DRIVERS" info description="Which parts of the movie are driving talk, ranked by engagement, share of posts, or posting velocity — and whether that talk is positive.">
          <div className="flex items-center gap-1.5 flex-wrap mb-3 -mx-1">
            {DRIVER_TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setDriverTab(t.label)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium mx-1 transition-colors ${
                  t.label === driverTab ? 'bg-blue-600/20 text-blue-400' : 'text-white/50 hover:bg-white/[0.04]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {d.isDriversLoading ? (
            <PanelSkeleton />
          ) : (
            <div className="space-y-3 flex-1">
              {rankedDrivers.map((driver) => (
                <BarRow
                  key={driver.label}
                  label={driver.label}
                  sublabel={driverConfig.sublabel(driver)}
                  pct={driverMax > 0 ? ((driver[driverConfig.key] ?? 0) / driverMax) * 100 : 0}
                  valueLabel={driverConfig.format(driver)}
                  color={DRIVER_SENTIMENT_COLOR[driver.sentiment] ?? DRIVER_SENTIMENT_COLOR.neutral}
                  onClick={driver.filterCategory ? () => setAspectModal({ category: driver.filterCategory, label: driver.label }) : undefined}
                />
              ))}
            </div>
          )}
          <PanelLink>View all drivers</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4">
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
          {d.isLatestLoading ? (
            <PanelSkeleton />
          ) : (
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
          )}
          <PanelLink>View all conversations</PanelLink>
        </Panel>
      </div>

      <AspectPostsModal
        open={!!aspectModal}
        onOpenChange={(next) => !next && setAspectModal(null)}
        entityId={selectedMovie?.id}
        category={aspectModal?.category}
        label={aspectModal?.label}
      />
    </div>
  );
}
