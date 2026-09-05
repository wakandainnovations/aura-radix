import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { dashboardService } from '../../../api/dashboardService';
import { formatCompact } from '../formatCompact';
import { formatImpressions } from '../../../utils/helpers';
import { mentionsData } from './audienceData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parses "YYYY-MM-DD" manually rather than `new Date(iso)` to avoid a
// timezone-driven off-by-one day shift on date-only strings (same approach as
// useMovieOverviewData.js's formatDateLabel).
function formatDateLabel(isoDate) {
  const [, m, d] = isoDate.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// Samples 5 evenly-spaced labels from a real series so the chart x-axis shows
// ticks that actually exist in the data, regardless of the entity's date
// range (mirrors useMovieOverviewData.js's pickEvenTicks).
function pickEvenTicks(labels, count = 5) {
  if (!labels || labels.length === 0) return undefined;
  if (labels.length <= count) return labels;
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push(labels[Math.round((i * (labels.length - 1)) / (count - 1))]);
  }
  return [...new Set(picked)];
}

const PLATFORM_LABELS = {
  x: 'X (Twitter)',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  reddit: 'Reddit',
  whatsapp: 'WhatsApp',
};

export function platformLabel(code) {
  if (!code) return 'Others';
  return PLATFORM_LABELS[code.toLowerCase()] ?? code;
}

const SENTIMENT_LABEL = { POSITIVE: 'Positive', NEGATIVE: 'Negative', NEUTRAL: 'Neutral' };

// Human labels for the backend's snake_case review-aspect category values,
// shown in the "Mention Drivers" panel (same convention as
// useInfluencersData's TOPIC_CATEGORY_LABELS).
const REVIEW_ASPECT_LABELS = {
  music_songs: 'Music / songs',
  direction: 'Direction',
  acting_cast_performance: 'Acting / cast performance',
  story: 'Story',
  screenplay: 'Screenplay',
  lead_pair: 'Lead pair',
  runtime: 'Runtime',
  first_half: 'First half',
  second_half: 'Second half',
  climax: 'Climax',
  vfx: 'VFX',
  // Only ever shown when `other` dominates the breakdown (see
  // OTHER_DOMINANT_THRESHOLD below) - "Other" would read as a shrug, while
  // this names what it actually is: talk the taxonomy doesn't have a
  // specific bucket for.
  other: 'General discussion',
};

// `other` is the classifier's catch-all bucket, not a real driver - it's
// dropped from the panel unless it's most of the conversation, in which case
// hiding it would make the panel look emptier than it is (e.g. a biopic like
// GD Naidu where 85%+ of posts don't fit the movie-aspect taxonomy at all).
const OTHER_DOMINANT_THRESHOLD = 50;

function reviewAspectLabel(category) {
  if (!category) return 'Other';
  return REVIEW_ASPECT_LABELS[category] ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Turns per-day counts for one metric (total/positive/negative) into a chart
// series - a running cumulative sum for `cumulative: true` (Overall/Buzz), or
// each day's own count for `cumulative: false` (Positive/Negative, matching
// classic UI's SentimentGraphsGrid, which plots raw daily counts rather than
// a running total) - plus a formatted grand total and a day-over-day delta
// (falls back to the dummy data's delta when there aren't 2+ days or the
// prior day was 0).
function metricSeries(days, key, { cumulative, fallbackDeltaPct }) {
  let running = 0;
  const series = days.map((d) => {
    running += d[key];
    return { date: d.label, value: cumulative ? running : d[key] };
  });
  const deltaPct =
    days.length >= 2 && days[days.length - 2][key] > 0
      ? Math.round(((days[days.length - 1][key] - days[days.length - 2][key]) / days[days.length - 2][key]) * 100)
      : fallbackDeltaPct;
  return { series, total: formatCompact(running), deltaPct };
}

// Mentions carry a full Instant (e.g. "2025-05-12T10:30:00Z"), unlike the
// date-only strings sentiment-over-time uses.
function formatPostTime(instant) {
  if (!instant) return '';
  try {
    return format(new Date(instant), "MMM d, yyyy '·' h:mm a");
  } catch {
    return '';
  }
}

// Feeds the Mentions tab's "Total Mentions" (Overall/Positive/Negative
// sentiment timeline), "Latest Mentions", and "Mention Drivers"
// panels from backend endpoints: dashboardService.getSentimentOverTime
// (Command Center's sentiment trend graph), dashboardService.getMentions (the
// cross-platform posts feed behind SocialMediaFeed), and
// dashboardService.getReviewAspectBreakdown (the same LLM-classified
// music/story/climax/first-half/second-half/etc. taxonomy documented on that
// endpoint). Everything else on this tab (topics, AI insight) has no backend
// endpoint yet and stays on dummy data.
//
// `volumePeriod` accepts the same period values as classic UI's
// TimeRangeSelector (DAY/DAY15/DAY30/DAY90/WEEK/MONTH) - undocumented on
// dashboardService.getSentimentOverTime but already relied on by
// TimeRangeSelector.jsx to widen the lookback window beyond the trailing ~8
// days DAY alone returns.
export default function useMentionsData(selectedMovie, volumePeriod = 'DAY90') {
  const entityId = selectedMovie?.id;

  const { data: sentimentRaw, isLoading: isVolumeLoading } = useQuery({
    queryKey: ['sentiment-trend', entityId, volumePeriod, 'newui-audience-mentions'],
    queryFn: () => dashboardService.getSentimentOverTime(entityId, volumePeriod),
    enabled: entityId != null,
  });

  const { data: mentionsRaw, isLoading: isLatestLoading } = useQuery({
    queryKey: ['mentions', entityId, 'newui-audience-mentions'],
    queryFn: () => dashboardService.getMentions(entityId, { size: 50 }),
    enabled: entityId != null,
  });

  // refresh: true so each mount nudges the entity's classification backlog
  // forward (the endpoint only classifies a bounded batch of not-yet-scored
  // posts per call, not the full backlog - see getReviewAspectBreakdown's
  // doc comment) rather than only relying on the backend's own 2h sweep.
  const { data: reviewAspectRaw, isLoading: isDriversLoading } = useQuery({
    queryKey: ['review-aspect-breakdown', entityId, 'newui-audience-mentions'],
    queryFn: () => dashboardService.getReviewAspectBreakdown(entityId, { refresh: true }),
    enabled: entityId != null,
  });

  const merged = useMemo(() => {
    const base = mentionsData;
    if (!entityId) return base;

    // Per-day totals from sentiment-over-time, same total-derivation as
    // Command Center's sentimentGraphs.total/positive/negative and
    // useMovieOverviewData's days.
    const days = (sentimentRaw?.entities?.[0]?.sentiments ?? []).map((item) => {
      const positive = item.positive?.total ?? item.positive ?? 0;
      const neutral = item.neutral?.total ?? item.neutral ?? 0;
      const negative = item.negative?.total ?? item.negative ?? 0;
      const total = item.total?.total ?? item.total ?? positive + neutral + negative;
      return { label: formatDateLabel(item.date), positive, negative, total };
    });

    let volumeOverTime = base.volumeOverTime;
    let positiveOverTime = base.positiveOverTime;
    let negativeOverTime = base.negativeOverTime;
    let volumeTicks;
    let volumeTotal = base.volumeTotal;
    let positiveTotal = base.positiveTotal;
    let negativeTotal = base.negativeTotal;
    let volumeDeltaPct = base.volumeDeltaPct;
    let positiveDeltaPct = base.positiveDeltaPct;
    let negativeDeltaPct = base.negativeDeltaPct;
    if (days.length > 0) {
      // All three metrics plot each day's own count (matching classic UI's
      // Total/Positive/Negative Sentiment Trend graphs) - the cumulative
      // running-sum treatment now lives on My Movie's Buzz Over Time panel
      // instead (useMoviePerformanceData.js).
      volumeTicks = pickEvenTicks(days.map((d) => d.label));
      const total = metricSeries(days, 'total', { cumulative: false, fallbackDeltaPct: base.volumeDeltaPct });
      const positive = metricSeries(days, 'positive', { cumulative: false, fallbackDeltaPct: base.positiveDeltaPct });
      const negative = metricSeries(days, 'negative', { cumulative: false, fallbackDeltaPct: base.negativeDeltaPct });
      volumeOverTime = total.series;
      volumeTotal = total.total;
      volumeDeltaPct = total.deltaPct;
      positiveOverTime = positive.series;
      positiveTotal = positive.total;
      positiveDeltaPct = positive.deltaPct;
      negativeOverTime = negative.series;
      negativeTotal = negative.total;
      negativeDeltaPct = negative.deltaPct;
    }

    // "Latest Mentions" - the same cross-platform mentions feed classic
    // UI's SocialMediaFeed renders, reshaped into this panel's card fields.
    const mentions = Array.isArray(mentionsRaw?.content) ? mentionsRaw.content : [];
    let latest = base.latest;
    if (mentions.length > 0) {
      latest = [...mentions]
        .sort((a, b) => new Date(b.postDate) - new Date(a.postDate))
        .slice(0, 12)
        .map((m) => ({
          handle: m.author || m.username || m.userId || 'Anonymous',
          time: formatPostTime(m.postDate),
          text: m.content || '',
          platform: platformLabel(m.platform),
          sentiment: SENTIMENT_LABEL[(m.sentiment || '').toUpperCase()] ?? 'Neutral',
          engagement: formatImpressions(m.impressions) ?? '—',
        }));
    }

    // "Mention Drivers" - every aspect is carried through with all three
    // of its metrics, so the panel's Engagement/Volume/Velocity tabs can
    // re-rank the same rows client-side without a refetch. `other` (the
    // classifier's catch-all) is dropped unless it dominates the breakdown -
    // normally it tells the user nothing about what's driving talk, but
    // hiding a bucket that's 85%+ of all posts (e.g. a biopic whose chatter
    // mostly doesn't fit the movie-aspect taxonomy at all) would make the
    // panel look far emptier than the conversation actually is.
    // Rows aren't sliced here - the panel takes the top N for whichever metric
    // is active, which is not the same set as the backend's sharePct ranking.
    const aspects = reviewAspectRaw?.aspects ?? [];
    const other = aspects.find((aspect) => aspect.category === 'other');
    const otherDominates = (other?.sharePct ?? 0) > OTHER_DOMINANT_THRESHOLD;
    const realDrivers = aspects
      .filter((aspect) => aspect.category !== 'other' || otherDominates)
      .map((aspect) => ({
        label: reviewAspectLabel(aspect.category),
        // Raw enum value the backend's reviewAspectCategory mentions filter
        // expects (README 16/26e), e.g. "climax" -> "CLIMAX" - lets the
        // Mention Drivers panel drill down into the classified posts
        // behind a bar without guessing the taxonomy string from the label.
        filterCategory: aspect.category ? aspect.category.toUpperCase() : null,
        posts: aspect.totalPosts ?? 0,
        views: aspect.totalViews ?? 0,
        sharePct: aspect.sharePct ?? 0,
        // engagementRate arrives as a 0..1 fraction; the panel renders percents.
        engagementRate: aspect.engagementRate != null ? aspect.engagementRate * 100 : null,
        postsPerDay: aspect.postsPerDay ?? 0,
        sentiment: (aspect.majoritySentiment ?? 'neutral').toLowerCase(),
      }));
    const drivers = realDrivers.length > 0 ? realDrivers : base.drivers;

    return {
      ...base,
      volumeOverTime,
      positiveOverTime,
      negativeOverTime,
      volumeTicks,
      volumeTotal,
      positiveTotal,
      negativeTotal,
      volumeDeltaPct,
      positiveDeltaPct,
      negativeDeltaPct,
      latest,
      drivers,
    };
  }, [entityId, sentimentRaw, mentionsRaw, reviewAspectRaw]);

  return {
    ...merged,
    isVolumeLoading: entityId != null && isVolumeLoading,
    isLatestLoading: entityId != null && isLatestLoading,
    isDriversLoading: entityId != null && isDriversLoading,
  };
}
