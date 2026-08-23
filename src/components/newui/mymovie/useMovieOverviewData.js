import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../api/dashboardService';
import { dummyMovieOverview } from '../dummyMovieData';
import { formatCompact } from '../formatCompact';
import { daysUntilRelease } from '../dateUtils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parses "YYYY-MM-DD" manually rather than `new Date(iso)` to avoid a
// timezone-driven off-by-one day shift on date-only strings.
function formatDateLabel(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

function formatFullDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// Samples `count` evenly-spaced labels from a real series so chart x-axes
// always show ticks that actually exist in the data, regardless of how many
// days the backend returns (the dummy data's AXIS_TICKS are hardcoded to its
// fixed Apr15-May15 range and won't match a real entity's date range).
function pickEvenTicks(labels, count = 5) {
  if (!labels || labels.length === 0) return undefined;
  if (labels.length <= count) return labels;
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push(labels[Math.round((i * (labels.length - 1)) / (count - 1))]);
  }
  return [...new Set(picked)];
}

// Same score + label vocabulary the classic UI uses for its one real
// sentiment score (src/components/metrics/EnhancedMetricsDashboard.jsx
// calculateOverallSentiment): positive counts full, neutral counts half.
const SENTIMENT_LABELS = [
  { min: 75, label: 'Excellent' },
  { min: 60, label: 'Good' },
  { min: 40, label: 'Mixed' },
  { min: 25, label: 'Concerning' },
  { min: 0, label: 'Critical' },
];

function sentimentRatingFor(score) {
  return SENTIMENT_LABELS.find((tier) => score >= tier.min).label;
}

function dailySentimentScore(day) {
  const total = day.positive + day.neutral + day.negative;
  if (total === 0) return null;
  return Math.round((day.positive * 100 + day.neutral * 50) / total);
}

// Fetches real per-entity analytics (total mentions, overall sentiment score,
// buzz/sentiment time series) for the My Movie Overview tab and merges them
// into the dummy data's shape. Metrics with no backend concept at all today
// (health score, awareness, marketing momentum, regional reach, audience
// engagement, top positive themes, insight cards) are intentionally left as
// the static dummy values rather than inventing a formula for them.
export default function useMovieOverviewData(selectedMovie) {
  const entityId = selectedMovie?.id;

  const { data: stats } = useQuery({
    queryKey: ['stats', entityId, 'newui-overview'],
    queryFn: () => dashboardService.getStats([entityId]),
    enabled: entityId != null,
  });

  const { data: sentimentRaw } = useQuery({
    queryKey: ['sentiment-trend', entityId, 'newui-overview'],
    queryFn: () => dashboardService.getSentimentOverTime(entityId, 'DAY90'),
    enabled: entityId != null,
  });

  return useMemo(() => {
    const base = dummyMovieOverview;
    if (!entityId) return base;

    const days = (sentimentRaw?.entities?.[0]?.sentiments ?? []).map((item) => {
      const positive = item.positive?.total ?? item.positive ?? 0;
      const neutral = item.neutral?.total ?? item.neutral ?? 0;
      const negative = item.negative?.total ?? item.negative ?? 0;
      return {
        label: formatDateLabel(item.date),
        positive,
        neutral,
        negative,
        total: item.total?.total ?? item.total ?? positive + neutral + negative,
      };
    });

    const hasSeries = days.length > 0;
    const ticks = pickEvenTicks(days.map((d) => d.label));

    const buzzOverTime = hasSeries
      ? {
          ...base.buzzOverTime,
          series: days.map((d) => ({ date: d.label, value: d.total })),
          ticks,
          totalLabel: formatCompact(stats?.totalMentions ?? days.reduce((s, d) => s + d.total, 0)),
          totalCaption: 'Total Mentions',
          deltaPct:
            days.length >= 2 && days[days.length - 2].total > 0
              ? Math.round(
                  ((days[days.length - 1].total - days[days.length - 2].total) / days[days.length - 2].total) * 100
                )
              : base.buzzOverTime.deltaPct,
        }
      : base.buzzOverTime;

    const sentimentOverTime = hasSeries
      ? {
          positiveTotal: formatCompact(days.reduce((s, d) => s + d.positive, 0)),
          neutralTotal: formatCompact(days.reduce((s, d) => s + d.neutral, 0)),
          negativeTotal: formatCompact(days.reduce((s, d) => s + d.negative, 0)),
          series: days.map((d) => ({ date: d.label, positive: d.positive, neutral: d.neutral, negative: d.negative })),
          ticks,
        }
      : base.sentimentOverTime;

    const overallSentiment = stats?.overallSentiment != null ? Math.round(stats.overallSentiment) : null;
    const dailyScores = days.map(dailySentimentScore).filter((v) => v != null);
    const baseSentimentKpi = base.kpis.find((k) => k.key === 'sentiment');

    const sentimentKpi =
      overallSentiment != null
        ? {
            ...baseSentimentKpi,
            value: overallSentiment,
            rating: sentimentRatingFor(overallSentiment),
            deltaPct:
              dailyScores.length >= 2 ? dailyScores[dailyScores.length - 1] - dailyScores[dailyScores.length - 2] : 0,
            spark: dailyScores.length > 0 ? dailyScores.slice(-8) : baseSentimentKpi.spark,
          }
        : baseSentimentKpi;

    return {
      ...base,
      title: selectedMovie?.name ?? base.title,
      releaseInDays: selectedMovie?.releaseDate ? daysUntilRelease(selectedMovie.releaseDate) : base.releaseInDays,
      kpis: base.kpis.map((k) => (k.key === 'sentiment' ? sentimentKpi : k)),
      poster: {
        ...base.poster,
        imageUrl: selectedMovie?.imageUrl ?? null,
        genre: Array.isArray(selectedMovie?.genre)
          ? selectedMovie.genre.join(', ')
          : selectedMovie?.genre || base.poster.genre,
        language: selectedMovie?.language || base.poster.language,
        releaseDate: selectedMovie?.releaseDate ? formatFullDate(selectedMovie.releaseDate) : base.poster.releaseDate,
      },
      buzzOverTime,
      sentimentOverTime,
    };
  }, [entityId, selectedMovie, stats, sentimentRaw]);
}
