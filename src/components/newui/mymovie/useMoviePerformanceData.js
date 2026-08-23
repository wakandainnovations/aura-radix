import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../api/dashboardService';
import { performanceData } from './myMovieTabsData';
import { formatCompact } from '../formatCompact';
import { formatShortDate } from '../dateUtils';
import { displayName as displayRegionName } from '../shared/IndiaStatesMap';

// Samples `count` evenly-spaced labels from a real series so the trend
// chart's x-axis always shows ticks that actually exist in the data,
// regardless of how many days the backend returns (mirrors
// useMovieOverviewData's own pickEvenTicks).
function pickEvenTicks(labels, count = 5) {
  if (!labels || labels.length === 0) return undefined;
  if (labels.length <= count) return labels;
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push(labels[Math.round((i * (labels.length - 1)) / (count - 1))]);
  }
  return [...new Set(picked)];
}

const PLATFORM_META = {
  X: { label: 'X (Twitter)', color: '#2dd4bf' },
  INSTAGRAM: { label: 'Instagram', color: '#f472b6' },
  YOUTUBE: { label: 'YouTube', color: '#f87171' },
  REDDIT: { label: 'Reddit', color: '#3987e5' },
};

// Human labels for the backend's snake_case contentIntent values, shown in
// the "Top Drivers" panel.
const CONTENT_INTENT_LABELS = {
  official_promo: 'Official promo',
  fan_amplified_promo: 'Fan-amplified promo',
  organic_opinion: 'Organic opinion',
  news_press_coverage: 'News / press coverage',
  trade_box_office_update: 'Trade / box-office update',
  ticket_merch_marketplace: 'Ticket / merch marketplace',
};

// Fetches real per-entity performance metrics for the My Movie Performance
// tab and merges them into the dummy data's shape. "Marketing Momentum" has
// no backend concept today, so it's intentionally left as a static dummy
// value rather than inventing a formula for it (same approach
// useMovieOverviewData/useCommandCenterData take for their own backend-less
// fields). The region map markers also stay dummy - there's no
// region-name-to-map-coordinate lookup anywhere in this codebase yet.
export default function useMoviePerformanceData(selectedMovie) {
  const entityId = selectedMovie?.id;

  const { data: buzzRaw } = useQuery({
    queryKey: ['buzz', entityId, 'newui-my-movie-performance'],
    queryFn: ({ signal }) => dashboardService.getBuzz(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: sentimentRaw } = useQuery({
    queryKey: ['sentiment', entityId, 'newui-my-movie-performance'],
    queryFn: ({ signal }) => dashboardService.getMovieSentiment(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: awarenessRaw } = useQuery({
    queryKey: ['awareness', entityId, 'newui-my-movie-performance'],
    queryFn: ({ signal }) => dashboardService.getAwareness(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: reachRaw } = useQuery({
    queryKey: ['reach', entityId, 'newui-my-movie-performance'],
    queryFn: ({ signal }) => dashboardService.getReach(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: sentimentOverTimeRaw, isLoading: isTrendLoading } = useQuery({
    queryKey: ['sentiment-over-time', entityId, 'newui-my-movie-performance'],
    queryFn: () => dashboardService.getSentimentOverTime(entityId, 'DAY90'),
    enabled: entityId != null,
  });

  const { data: platformRaw, isLoading: isPlatformLoading } = useQuery({
    queryKey: ['platform-mentions', entityId, 'newui-my-movie-performance'],
    queryFn: () => dashboardService.getPlatformMentions(entityId),
    enabled: entityId != null,
  });

  const { data: audiencePulseRaw, isLoading: isRegionsLoading } = useQuery({
    queryKey: ['audience-pulse', entityId, 'newui-my-movie-performance'],
    queryFn: () => dashboardService.getAudiencePulse(entityId),
    enabled: entityId != null,
  });

  const { data: contentIntentRaw, isLoading: isTopDriversLoading } = useQuery({
    queryKey: ['content-intent-breakdown', entityId, 'newui-my-movie-performance'],
    queryFn: () => dashboardService.getContentIntentBreakdown(entityId),
    enabled: entityId != null,
  });

  const merged = useMemo(() => {
    const base = performanceData;
    if (!entityId) return base;

    // Each stat swaps in its real value once its own endpoint resolves;
    // until then it keeps the dummy placeholder. None of these endpoints
    // return a comparable historical delta/sparkline the way the dummy data
    // does, so both are dropped once real data lands rather than pairing a
    // real point value with a fabricated trend (same approach
    // useCommandCenterData takes for its own stat row).
    const stats = base.stats.map((s) => {
      switch (s.iconKey) {
        case 'buzz':
          if (!buzzRaw) return s;
          return {
            ...s,
            value: formatCompact(buzzRaw.mentionsToday),
            delta: `${buzzRaw.mentionsChangePct >= 0 ? '+' : ''}${Math.round(buzzRaw.mentionsChangePct)}%`,
            deltaTone: buzzRaw.mentionsChangePct >= 0 ? 'good' : 'bad',
            caption: 'vs previous day',
            spark: undefined,
          };
        case 'sentiment':
          if (!sentimentRaw) return s;
          return {
            ...s,
            value: Math.round(sentimentRaw.averageSentimentScore),
            delta: undefined,
            caption: `${Math.round(sentimentRaw.positiveRatio * 100)}% positive`,
            spark: undefined,
          };
        case 'awareness':
          if (!awarenessRaw) return s;
          return {
            ...s,
            value: awarenessRaw.awarenessLevel,
            suffix: undefined,
            delta: undefined,
            caption: `${formatCompact(awarenessRaw.totalViews)} views`,
            spark: undefined,
          };
        case 'engagement':
          if (!reachRaw) return s;
          return {
            ...s,
            value: formatCompact(reachRaw.uniqueUsers),
            suffix: undefined,
            delta: undefined,
            caption: 'Unique people engaged',
            spark: undefined,
          };
        default:
          return s;
      }
    });

    const days = (sentimentOverTimeRaw?.entities?.[0]?.sentiments ?? []).map((item) => {
      const positive = item.positive?.total ?? item.positive ?? 0;
      const neutral = item.neutral?.total ?? item.neutral ?? 0;
      const negative = item.negative?.total ?? item.negative ?? 0;
      return {
        label: formatShortDate(item.date),
        positive,
        neutral,
        negative,
        total: item.total?.total ?? item.total ?? positive + neutral + negative,
      };
    });
    const hasSeries = days.length > 0;

    // Plots a running (cumulative) sum of daily totals rather than each
    // day's own count - same treatment Audience Intelligence's Conversations
    // tab uses for its Total Mentions panel.
    const buzzOverTime = hasSeries
      ? days.reduce((acc, d) => {
          const running = (acc[acc.length - 1]?.value ?? 0) + d.total;
          acc.push({ date: d.label, value: running });
          return acc;
        }, [])
      : base.buzzOverTime;
    const buzzOverTimeTicks = hasSeries ? pickEvenTicks(days.map((d) => d.label)) : undefined;

    // getPlatformMentions returns a sentiment breakdown per platform
    // ({ X: { POSITIVE, NEGATIVE, NEUTRAL }, ... }), same shape the classic
    // dashboard's PlatformBreakdownChart consumes - sum each platform's
    // sentiment counts into a single mention count before computing shares.
    const platformCounts = platformRaw
      ? Object.entries(platformRaw)
          .map(([key, sentiments]) => [key, Object.values(sentiments ?? {}).reduce((sum, v) => sum + v, 0)])
          .filter(([, total]) => total > 0)
      : [];
    const platformTotal = platformCounts.reduce((sum, [, v]) => sum + v, 0);
    const platformBreakdown =
      platformTotal > 0
        ? platformCounts.map(([key, v]) => ({
            label: PLATFORM_META[key]?.label ?? key,
            value: Math.round((v / platformTotal) * 100),
            color: PLATFORM_META[key]?.color ?? '#64748b',
          }))
        : base.platformBreakdown;

    // Per-platform positive/neutral/negative sentiment split, shown in the
    // "View platform performance" modal - same POSITIVE/NEGATIVE/NEUTRAL
    // counts platformCounts sums above, kept separate per sentiment here.
    const platformSentimentBreakdown =
      platformTotal > 0
        ? platformCounts.map(([key]) => {
            const sentiments = platformRaw[key] ?? {};
            const positive = sentiments.POSITIVE ?? 0;
            const negative = sentiments.NEGATIVE ?? 0;
            const neutral = sentiments.NEUTRAL ?? 0;
            const total = positive + negative + neutral;
            return {
              key,
              label: PLATFORM_META[key]?.label ?? key,
              color: PLATFORM_META[key]?.color ?? '#64748b',
              positivePct: total > 0 ? Math.round((positive / total) * 100) : 0,
              neutralPct: total > 0 ? Math.round((neutral / total) * 100) : 0,
              negativePct: total > 0 ? Math.round((negative / total) * 100) : 0,
            };
          })
        : base.platformSentimentBreakdown;

    // Overall sentiment totals, summed across platforms from the same
    // getPlatformMentions data platformCounts already sums above - this
    // matches classic UI's totals exactly, unlike sentiment-over-time's
    // daily series (sentimentOverTimeRaw/days above), which can come back
    // all-zero for entities without per-day history yet.
    const sentimentTotals = platformCounts.reduce(
      (acc, [key]) => {
        const s = platformRaw[key] ?? {};
        acc.positive += s.POSITIVE ?? 0;
        acc.negative += s.NEGATIVE ?? 0;
        acc.neutral += s.NEUTRAL ?? 0;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );
    const sentimentGrandTotal = sentimentTotals.positive + sentimentTotals.negative + sentimentTotals.neutral;
    const pctOfSentiment = (n) => (sentimentGrandTotal > 0 ? Math.round((n / sentimentGrandTotal) * 100) : 0);

    const sentimentDistribution =
      sentimentGrandTotal > 0
        ? [
            {
              label: 'Positive',
              value: pctOfSentiment(sentimentTotals.positive),
              pctLabel: `${formatCompact(sentimentTotals.positive)} (${pctOfSentiment(sentimentTotals.positive)}%)`,
              color: '#34d399',
            },
            {
              label: 'Neutral',
              value: pctOfSentiment(sentimentTotals.neutral),
              pctLabel: `${formatCompact(sentimentTotals.neutral)} (${pctOfSentiment(sentimentTotals.neutral)}%)`,
              color: '#94a3b8',
            },
            {
              label: 'Negative',
              value: pctOfSentiment(sentimentTotals.negative),
              pctLabel: `${formatCompact(sentimentTotals.negative)} (${pctOfSentiment(sentimentTotals.negative)}%)`,
              color: '#f87171',
            },
          ]
        : base.sentimentDistribution;
    const sentimentPositivePct = sentimentGrandTotal > 0 ? `${pctOfSentiment(sentimentTotals.positive)}%` : undefined;

    // Within each sentiment bucket (positive/neutral/negative), which
    // platform contributed how much - shown in the "View sentiment trends"
    // modal. Reuses the same per-platform POSITIVE/NEGATIVE/NEUTRAL counts
    // as sentimentTotals/platformSentimentBreakdown above, just grouped the
    // other way (by sentiment, then by platform).
    const byPlatformShare = (sentimentKey, grandTotal) => {
      if (grandTotal === 0) return [];
      return platformCounts
        .map(([key]) => {
          const count = platformRaw[key]?.[sentimentKey] ?? 0;
          return {
            key,
            label: PLATFORM_META[key]?.label ?? key,
            color: PLATFORM_META[key]?.color ?? '#64748b',
            count,
            pct: Math.round((count / grandTotal) * 100),
          };
        })
        .filter((p) => p.count > 0)
        .sort((a, b) => b.count - a.count);
    };
    const sentimentPlatformBreakdown =
      sentimentGrandTotal > 0
        ? {
            positive: byPlatformShare('POSITIVE', sentimentTotals.positive),
            neutral: byPlatformShare('NEUTRAL', sentimentTotals.neutral),
            negative: byPlatformShare('NEGATIVE', sentimentTotals.negative),
          }
        : base.sentimentPlatformBreakdown;

    // "unknown" is a real predicted_region value distinct from the
    // null/irrelevant rows the backend already excludes (same filter
    // useCommandCenterData applies to its own audience-pulse regions), so
    // shares are rescaled against the known total once it's dropped.
    const realRegions = (audiencePulseRaw?.regions ?? []).filter((r) => r.region?.toLowerCase() !== 'unknown');
    const knownTotalPct = realRegions.reduce((sum, r) => sum + (r.sharePct ?? 0), 0);
    const topRegions =
      realRegions.length > 0
        ? realRegions.slice(0, 5).map((r) => ({
            label: displayRegionName(r.region),
            pct: knownTotalPct > 0 ? Math.round((r.sharePct / knownTotalPct) * 100) : 0,
          }))
        : base.topRegions;

    // IndiaStatesMap (the same real-map component Command Center's Audience
    // Pulse panel already plots getAudiencePulse regions on) wants
    // {name, sharePct} rather than the {label, pct} shape the bar list uses -
    // derived from the same final topRegions so the bars and the map never
    // disagree, in both the real-data and dummy-fallback cases.
    const topRegionsForMap = topRegions.map((r) => ({ name: r.label, sharePct: r.pct }));

    // Ranked breakdown of what kind of buzz is driving conversation (fan
    // promo, organic opinion, press coverage, etc.) - backend already ranks
    // by sharePct, so the top few are shown as-is.
    const topDrivers =
      contentIntentRaw?.intents?.length > 0
        ? contentIntentRaw.intents.slice(0, 4).map((intent) => ({
            label: CONTENT_INTENT_LABELS[intent.contentIntent] ?? intent.contentIntent,
            pct: Math.round(intent.sharePct),
            caption: `${formatCompact(intent.count)} posts`,
            iconKey: intent.contentIntent,
          }))
        : base.topDrivers;

    return {
      ...base,
      stats,
      buzzOverTime,
      buzzOverTimeTicks,
      sentimentDistribution,
      sentimentPositivePct,
      sentimentPlatformBreakdown,
      platformBreakdown,
      platformSentimentBreakdown,
      topRegions,
      topRegionsForMap,
      topDrivers,
    };
  }, [
    entityId,
    buzzRaw,
    sentimentRaw,
    awarenessRaw,
    reachRaw,
    sentimentOverTimeRaw,
    platformRaw,
    audiencePulseRaw,
    contentIntentRaw,
  ]);

  return {
    ...merged,
    isTrendLoading: entityId != null && isTrendLoading,
    isPlatformLoading: entityId != null && isPlatformLoading,
    isRegionsLoading: entityId != null && isRegionsLoading,
    isTopDriversLoading: entityId != null && isTopDriversLoading,
  };
}
