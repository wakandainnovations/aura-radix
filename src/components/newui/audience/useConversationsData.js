import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { dashboardService } from '../../../api/dashboardService';
import { formatCompact } from '../formatCompact';
import { formatImpressions } from '../../../utils/helpers';
import { conversationsData } from './audienceData';

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

function platformLabel(code) {
  if (!code) return 'Others';
  return PLATFORM_LABELS[code.toLowerCase()] ?? code;
}

const SENTIMENT_LABEL = { POSITIVE: 'Positive', NEGATIVE: 'Negative', NEUTRAL: 'Neutral' };

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

// Feeds the Conversations tab's "Total Mentions" (Overall/Positive/Negative
// sentiment timeline) and "Latest Conversations" panels from the same two
// endpoints the classic UI already uses elsewhere:
// dashboardService.getSentimentOverTime (Command Center's sentiment trend
// graph) and dashboardService.getMentions (the cross-platform posts feed
// behind SocialMediaFeed). Everything else on this tab (topics, drivers, AI
// insight) has no backend endpoint yet and stays on dummy data.
//
// `volumePeriod` accepts the same period values as classic UI's
// TimeRangeSelector (DAY/DAY15/DAY30/DAY90/WEEK/MONTH) - undocumented on
// dashboardService.getSentimentOverTime but already relied on by
// TimeRangeSelector.jsx to widen the lookback window beyond the trailing ~8
// days DAY alone returns.
export default function useConversationsData(selectedMovie, volumePeriod = 'DAY90') {
  const entityId = selectedMovie?.id;

  const { data: sentimentRaw, isLoading: isVolumeLoading } = useQuery({
    queryKey: ['sentiment-trend', entityId, volumePeriod, 'newui-audience-conversations'],
    queryFn: () => dashboardService.getSentimentOverTime(entityId, volumePeriod),
    enabled: entityId != null,
  });

  const { data: mentionsRaw, isLoading: isLatestLoading } = useQuery({
    queryKey: ['mentions', entityId, 'newui-audience-conversations'],
    queryFn: () => dashboardService.getMentions(entityId, { size: 50 }),
    enabled: entityId != null,
  });

  const merged = useMemo(() => {
    const base = conversationsData;
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

    // "Latest Conversations" - the same cross-platform mentions feed classic
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
    };
  }, [entityId, sentimentRaw, mentionsRaw]);

  return {
    ...merged,
    isVolumeLoading: entityId != null && isVolumeLoading,
    isLatestLoading: entityId != null && isLatestLoading,
  };
}
