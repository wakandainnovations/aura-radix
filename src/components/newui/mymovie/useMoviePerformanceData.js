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
  X: { label: 'X (Twitter)', color: '#cbd5e1' },
  INSTAGRAM: { label: 'Instagram', color: '#f472b6' },
  YOUTUBE: { label: 'YouTube', color: '#f87171' },
  REDDIT: { label: 'Reddit', color: '#3987e5' },
};

// Fetches real per-entity performance metrics for the My Movie Performance
// tab and merges them into the dummy data's shape. "Marketing Momentum" and
// "Top Drivers" have no backend concept today, so they're intentionally left
// as static dummy values rather than inventing a formula for them (same
// approach useMovieOverviewData/useCommandCenterData take for their own
// backend-less fields). The region map markers also stay dummy - there's no
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
    queryFn: () => dashboardService.getSentimentOverTime(entityId, 'DAY'),
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

    const buzzOverTime = hasSeries ? days.map((d) => ({ date: d.label, value: d.total })) : base.buzzOverTime;
    const buzzOverTimeTicks = hasSeries ? pickEvenTicks(days.map((d) => d.label)) : undefined;

    const totalAll = days.reduce((sum, d) => sum + d.total, 0);
    const posTotal = days.reduce((sum, d) => sum + d.positive, 0);
    const neuTotal = days.reduce((sum, d) => sum + d.neutral, 0);
    const negTotal = days.reduce((sum, d) => sum + d.negative, 0);
    const pctOf = (n) => (totalAll > 0 ? Math.round((n / totalAll) * 100) : 0);

    const sentimentDistribution =
      totalAll > 0
        ? [
            { label: 'Positive', value: pctOf(posTotal), pctLabel: `${formatCompact(posTotal)} (${pctOf(posTotal)}%)`, color: '#34d399' },
            { label: 'Neutral', value: pctOf(neuTotal), pctLabel: `${formatCompact(neuTotal)} (${pctOf(neuTotal)}%)`, color: '#94a3b8' },
            { label: 'Negative', value: pctOf(negTotal), pctLabel: `${formatCompact(negTotal)} (${pctOf(negTotal)}%)`, color: '#f87171' },
          ]
        : base.sentimentDistribution;
    const sentimentPositivePct = totalAll > 0 ? `${pctOf(posTotal)}%` : undefined;

    const platformEntries = platformRaw ? Object.entries(platformRaw).filter(([, v]) => v > 0) : [];
    const platformTotal = platformEntries.reduce((sum, [, v]) => sum + v, 0);
    const platformBreakdown =
      platformTotal > 0
        ? platformEntries.map(([key, v]) => ({
            label: PLATFORM_META[key]?.label ?? key,
            value: Math.round((v / platformTotal) * 100),
            color: PLATFORM_META[key]?.color ?? '#64748b',
          }))
        : base.platformBreakdown;

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

    return {
      ...base,
      stats,
      buzzOverTime,
      buzzOverTimeTicks,
      sentimentDistribution,
      sentimentPositivePct,
      platformBreakdown,
      topRegions,
      topRegionsForMap,
    };
  }, [entityId, buzzRaw, sentimentRaw, awarenessRaw, reachRaw, sentimentOverTimeRaw, platformRaw, audiencePulseRaw]);

  return {
    ...merged,
    isTrendLoading: entityId != null && isTrendLoading,
    isPlatformLoading: entityId != null && isPlatformLoading,
    isRegionsLoading: entityId != null && isRegionsLoading,
  };
}
