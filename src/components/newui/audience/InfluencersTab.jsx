import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Reads color off each point's own data (payload) rather than a shared
// per-<Scatter> `fill` prop - with one <Scatter> per point (the previous
// approach) Recharts doesn't reliably forward that per-series fill into a
// custom shape, and its default tooltip matching gets confused across many
// single-point series, showing whichever series happened to match first
// regardless of which dot was hovered. A single <Scatter> holding the whole
// array fixes both: real per-point colors, and a tooltip that reflects the
// actual hovered point.
function Bubble(props) {
  const { cx, cy, payload } = props;
  return <circle cx={cx} cy={cy} r={11} fill={payload?.color ?? '#64748b'} fillOpacity={0.85} stroke="#05070d" strokeWidth={2} />;
}
import { Download } from 'lucide-react';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import FilterBar from '../shared/FilterBar';
import AIInsightBar from '../shared/AIInsightBar';
import SortableTh from '../shared/SortableTh';
import InfluencerName from '../shared/InfluencerName';
import { thClass, tdClass, trClass, PLATFORM_COLOR, SERIES_COLORS, CARD } from '../theme';
import { useSortableRows } from '../../shared/SortableTable';
import useInfluencersData from './useInfluencersData';
import AllInfluencersModal from './AllInfluencersModal';
import AllInfluencerContentModal from './AllInfluencerContentModal';
import AllRecommendationsModal from './AllRecommendationsModal';
import TopicPostsModal from './TopicPostsModal';

const INFLUENCER_SORT_ACCESSORS = {
  views: (row) => row.viewsValue,
  engRate: (row) => row.engRateValue,
  impact: (row) => row.impact,
};

const PLATFORM_OPTIONS = [
  { label: 'All Platforms', value: 'all' },
  { label: 'X', value: 'x' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Reddit', value: 'reddit' },
  { label: 'Instagram', value: 'instagram' },
];

const CONTENT_SORT_ACCESSORS = {
  reach: (row) => row.reachValue,
  engRate: (row) => row.engRateValue,
};

const SENTIMENT_TONE = { Positive: 'text-emerald-400 bg-emerald-500/15', Neutral: 'text-white/50 bg-white/[0.06]', Negative: 'text-red-400 bg-red-500/15' };

function PanelSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse" role="status" aria-label="Loading">
      <div className="h-3.5 bg-white/10 rounded w-2/3" />
      <div className="h-3.5 bg-white/10 rounded w-1/2" />
      <div className="h-3.5 bg-white/10 rounded w-3/5" />
    </div>
  );
}

function ImpactTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#11141f] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
        <span className="text-white font-semibold">{p.name}</span>
      </div>
      <div className="text-white/50 mt-0.5">
        {p.platform && <>{p.platform} · </>}Impact {p.impact} · Eng. {p.engRate}%
      </div>
    </div>
  );
}

export default function InfluencersTab({ selectedMovie }) {
  const [platform, setPlatform] = useState('all');
  const d = useInfluencersData(selectedMovie, platform);
  const [allInfluencersOpen, setAllInfluencersOpen] = useState(false);
  // Sorts across every spreader the API returned (d.allInfluencers), not a
  // pre-sliced subset, so changing the sort column re-ranks the full result
  // set and can bring different influencers into the visible top 8.
  const { rows: sortedAllInfluencers, sortState, requestSort } = useSortableRows(
    d.allInfluencers,
    { key: 'views', dir: 'desc' },
    INFLUENCER_SORT_ACCESSORS
  );
  const topInfluencers = sortedAllInfluencers.slice(0, 8);
  const [allContentOpen, setAllContentOpen] = useState(false);
  const [allRecommendationsOpen, setAllRecommendationsOpen] = useState(false);
  const [topicModal, setTopicModal] = useState(null); // { label, rawCategories } | null
  // Same full-list-sorts-then-slices pattern as topInfluencers above, so
  // changing the sort column re-ranks across every post the API returned,
  // not just a pre-sliced top 5.
  const { rows: sortedContent, sortState: contentSortState, requestSort: requestContentSort } = useSortableRows(
    d.allContent,
    { key: 'reach', dir: 'desc' },
    CONTENT_SORT_ACCESSORS
  );
  const topContent = sortedContent.slice(0, 5);
  // The Impact Map always mirrors whatever 8 rows the table is currently
  // showing, so its dots update in lockstep with the active sort - each
  // dot's color is assigned by its position in that same visible order.
  const impactMapData = topInfluencers.map((inf, i) => ({
    name: inf.name,
    platform: inf.platform,
    impact: inf.impact,
    engRate: inf.engRateValue,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }));

  return (
    <div className="p-6 space-y-4">
      <FilterBar
        filters={[
          {
            label: 'Platform',
            value: PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? 'All Platforms',
            options: PLATFORM_OPTIONS,
            onChange: setPlatform,
          },
        ]}
        showRight={false}
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
          {d.isInfluencersLoading ? (
            <PanelSkeleton />
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Influencer</th>
                  <th className={thClass}>Platform</th>
                  <SortableTh label="Views" sortKey="views" sortState={sortState} onSort={requestSort} align="right" />
                  <SortableTh label="Eng. Rate" sortKey="engRate" sortState={sortState} onSort={requestSort} align="right" />
                  <SortableTh label="Impact" sortKey="impact" sortState={sortState} onSort={requestSort} align="right" />
                </tr>
              </thead>
              <tbody>
                {topInfluencers.map((inf, i) => (
                  <tr key={inf.rank} className={trClass}>
                    <td className={tdClass}>{i + 1}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/[0.06] shrink-0" />
                        <div className="min-w-0">
                          <InfluencerName name={inf.name} url={inf.profileUrl} className="block text-sm text-white/85" />
                          <div className="text-[11px] text-white/35 truncate">{inf.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLOR[inf.platform]}22`, color: PLATFORM_COLOR[inf.platform] }}>
                        {inf.platform}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right text-white/60`}>{inf.views}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{inf.engRate}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${inf.impact}%` }} />
                        </div>
                        <span className="text-white/70">{inf.impact}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <PanelLink onClick={() => setAllInfluencersOpen(true)}>View all influencers</PanelLink>
          <AllInfluencersModal open={allInfluencersOpen} onOpenChange={setAllInfluencersOpen} data={d.allInfluencers} />
        </Panel>

        <Panel title="INFLUENCER IMPACT MAP" info description="Impact vs. engagement rate.">
          {d.isInfluencersLoading ? (
            <PanelSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" dataKey="impact" name="Impact Score" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                <YAxis type="number" dataKey="engRate" name="Engagement Rate" domain={[0, 'dataMax + 1']} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<ImpactTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
                <Scatter data={impactMapData} shape={Bubble} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
          {!d.isInfluencersLoading && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
              {impactMapData.map((p, i) => (
                <div key={p.name ?? i} className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="truncate max-w-[110px]">{p.name}</span>
                </div>
              ))}
            </div>
          )}
          <PanelLink>View full map</PanelLink>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <Panel title="INFLUENCER CONTENT PERFORMANCE" info description="How content from influencers is performing.">
          {d.isContentLoading ? (
            <PanelSkeleton />
          ) : (
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th className={`${thClass} w-[40%]`}>Content</th>
                  <th className={`${thClass} w-[22%]`}>Influencer</th>
                  <SortableTh label="Reach" sortKey="reach" sortState={contentSortState} onSort={requestContentSort} align="right" />
                  <SortableTh label="Eng. Rate" sortKey="engRate" sortState={contentSortState} onSort={requestContentSort} align="right" />
                  <th className={`${thClass} text-right w-[15%]`}>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {topContent.map((c) => (
                  <tr key={c.id} className={trClass}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shrink-0" />
                        <div className="min-w-0">
                          {c.permalink ? (
                            <a href={c.permalink} target="_blank" rel="noopener noreferrer" className="block text-white/85 truncate hover:underline hover:text-white">
                              {c.title}
                            </a>
                          ) : (
                            <div className="text-white/85 truncate">{c.title}</div>
                          )}
                          <div className="text-[11px] text-white/35">{c.date}</div>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <InfluencerName name={c.influencer} url={c.profileUrl} className="text-white/60" />
                    </td>
                    <td className={`${tdClass} text-right text-white/60`}>{c.reach}</td>
                    <td className={`${tdClass} text-right text-white/60`}>{c.engRate}</td>
                    <td className={`${tdClass} text-right`}>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${SENTIMENT_TONE[c.sentiment]}`}>{c.sentiment}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <PanelLink onClick={() => setAllContentOpen(true)}>View all influencer content</PanelLink>
          <AllInfluencerContentModal open={allContentOpen} onOpenChange={setAllContentOpen} data={d.allContent} />
        </Panel>

        <Panel title="TOPICS OF DISCUSSION" info description="What aspects of the movie the conversation is actually about.">
          {d.isTopicsLoading ? (
            <PanelSkeleton />
          ) : (
            <LegendDonut
              data={d.topicsOfDiscussion}
              innerRadius="0%"
              size={150}
              legendCols={1}
              onSliceClick={(slice) => (slice.rawCategories?.length ? setTopicModal(slice) : undefined)}
            />
          )}
          <PanelLink>View topic details</PanelLink>
          <TopicPostsModal
            open={!!topicModal}
            onOpenChange={(next) => !next && setTopicModal(null)}
            entityId={selectedMovie?.id}
            rawCategories={topicModal?.rawCategories}
            label={topicModal?.label}
          />
        </Panel>
      </div>

      {d.isInsightsLoading ? (
        <div className={`${CARD} p-5`}>
          <PanelSkeleton />
        </div>
      ) : (
        <AIInsightBar
          insight={d.aiInsight}
          actions={d.actions}
          ctaLabel="View AI Recommendations"
          onCtaClick={() => setAllRecommendationsOpen(true)}
        />
      )}
      <AllRecommendationsModal
        open={allRecommendationsOpen}
        onOpenChange={setAllRecommendationsOpen}
        insight={d.aiInsight}
        data={d.allActions}
      />
    </div>
  );
}
