import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dummyCommandCenter } from './commandCenterData';
import { dummyMovieOverview } from '../dummyMovieData';
import { daysUntilRelease, timeAgoLabel } from '../dateUtils';
import { formatCompact } from '../formatCompact';
import { dashboardService } from '../../../api/dashboardService';

// Maps the backend's discrete health/awareness tiers onto the icon-badge hue,
// reusing the good/warning/bad thresholds (60%/40%) CompetitivePositioning
// already applies to positiveRatio, so "Sentiment" gets the same treatment.
const HEALTH_LABEL_HUE = { Excellent: 'green', Good: 'amber', 'Needs Improvement': 'red' };
const AWARENESS_LEVEL_HUE = { High: 'green', Medium: 'amber', Low: 'red' };
function sentimentHue(pct) {
  if (pct >= 60) return 'green';
  if (pct >= 40) return 'amber';
  return 'red';
}

// Maps the backend's HighlightItem.type (POSITIVE|NEGATIVE|NEUTRAL, no icon
// concept) onto this panel's tone/kind vocabulary, which was designed around
// richer dummy data (icons per event type). The LLM writes a full sentence
// per highlight, so value/caption (separate stat + qualifier) don't apply.
const HIGHLIGHT_TYPE_TO_TONE = { POSITIVE: 'good', NEGATIVE: 'bad', NEUTRAL: 'warning' };
const TONE_TO_KIND = { good: 'arrow', bad: 'arrowDown', warning: 'plus' };

// Maps the backend's server-computed action category onto this panel's
// impact vocabulary (and a matching decorative corner icon), which has no
// backend equivalent of its own.
const CATEGORY_TO_IMPACT = { HIGH_IMPACT: 'High', MEDIUM_IMPACT: 'Medium', LOW_IMPACT: 'Low' };
const IMPACT_TO_ICON = { High: 'trending', Medium: 'external', Low: 'eye' };

// Merges the selected real movie entity's identity fields (title, release
// countdown, poster image, genre/language), the real audience-pulse top
// regions, the real "People Love"/"People Concerned About" aspect chips, the
// real AI summary/highlights, and the real recommended-actions plan into the
// Command Center's dummy data. Everything else on this page (competitor
// watch, the audience pulse map, campaign timeline) has no backend concept
// yet, so it stays as static dummy data — same approach as
// useMovieOverviewData for the My Movie tab.
export default function useCommandCenterData(selectedMovie) {
  const entityId = selectedMovie?.id;

  const { data: audiencePulseRaw, isLoading: isAudiencePulseLoading } = useQuery({
    queryKey: ['audience-pulse', entityId, 'newui-command-center'],
    queryFn: () => dashboardService.getAudiencePulse(entityId),
    enabled: entityId != null,
  });

  const { data: pulseAspectsRaw, isLoading: isPulseAspectsLoading } = useQuery({
    queryKey: ['audience-pulse-aspects', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getAudiencePulseAspects(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: aiSummaryRaw, isLoading: isAiSummaryLoading } = useQuery({
    queryKey: ['ai-summary', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getAiSummary(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: highlightsRaw, isLoading: isHighlightsLoading } = useQuery({
    queryKey: ['todays-highlights', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getTodaysHighlights(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: recommendedActionsRaw, isLoading: isRecommendedActionsLoading } = useQuery({
    queryKey: ['recommended-actions', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getRecommendedActions(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: movieHealthRaw } = useQuery({
    queryKey: ['movie-health', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getMovieHealth(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: buzzRaw } = useQuery({
    queryKey: ['buzz', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getBuzz(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: sentimentRaw } = useQuery({
    queryKey: ['sentiment', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getMovieSentiment(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: reachRaw } = useQuery({
    queryKey: ['reach', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getReach(entityId, { signal }),
    enabled: entityId != null,
  });

  const { data: awarenessRaw } = useQuery({
    queryKey: ['awareness', entityId, 'newui-command-center'],
    queryFn: ({ signal }) => dashboardService.getAwareness(entityId, { signal }),
    enabled: entityId != null,
  });

  const merged = useMemo(() => {
    const base = dummyCommandCenter;
    const title = selectedMovie?.name ?? dummyMovieOverview.title;
    const releaseInDays = selectedMovie?.releaseDate
      ? daysUntilRelease(selectedMovie.releaseDate)
      : dummyMovieOverview.releaseInDays;

    // Only some movies have region-tagged mentions yet, so this stays empty
    // (rather than falling back to placeholder regions) when the entity has
    // none. The "unknown" region is a real predicted_region value distinct
    // from the null/"irrelevant" rows the backend already excludes, so it's
    // filtered out here rather than on the server. The panel should only
    // ever display the known-region split, so shares are rescaled against
    // the known total (assuming unknown mentions split across known regions
    // in the same ratio as the known mentions do) rather than the original
    // total that included unknown.
    const realRegions = (audiencePulseRaw?.regions ?? []).filter(
      (r) => r.region?.toLowerCase() !== 'unknown'
    );
    const knownTotalPct = realRegions.reduce((sum, r) => sum + (r.sharePct ?? 0), 0);
    const topRegions = realRegions.slice(0, 3).map((r, i) => ({
      rank: i + 1,
      name: r.region,
      sharePct: knownTotalPct > 0 ? Math.round((r.sharePct / knownTotalPct) * 100) : 0,
    }));

    // Stays empty per side when that side has no grounded aspects yet
    // (sparse mention data) rather than falling back to placeholder chips.
    const peopleLove = pulseAspectsRaw?.peopleLove ?? [];
    const peopleConcerned = pulseAspectsRaw?.peopleConcerned ?? [];

    const aiSummary =
      aiSummaryRaw?.summary
        ? { text: aiSummaryRaw.summary, updatedLabel: timeAgoLabel(aiSummaryRaw.generatedAt) ?? base.aiSummary.updatedLabel }
        : base.aiSummary;

    const realHighlights = highlightsRaw?.highlights ?? [];
    const highlights =
      realHighlights.length > 0
        ? realHighlights.map((h) => {
            const tone = HIGHLIGHT_TYPE_TO_TONE[h.type] ?? 'warning';
            return { tone, kind: TONE_TO_KIND[tone], text: h.text };
          })
        : base.highlights;

    // Falls back to the dummy plan when this entity's candidate generation
    // produced nothing yet (no real backing data) or the query hasn't resolved.
    const realRecommendedActions = recommendedActionsRaw?.actions ?? [];
    const recommendedActions =
      realRecommendedActions.length > 0
        ? realRecommendedActions.map((a) => {
            const impact = CATEGORY_TO_IMPACT[a.category] ?? 'Medium';
            return {
              impact,
              icon: IMPACT_TO_ICON[impact],
              title: a.title,
              reason: a.reason,
              metrics: [
                { label: 'Window', value: a.windowLabel },
                { label: 'Confidence', value: `${a.confidencePct}%` },
              ],
            };
          })
        : base.recommendedActions;

    // Each top-row stat swaps in its real value once its own endpoint
    // resolves; until then (or if the entity has no data yet) it keeps the
    // dummy placeholder, same fallback approach as the rest of this file.
    // None of these endpoints return a time series, so the sparkline is
    // dropped rather than pairing a real point value with a fabricated trend.
    const stats = base.stats.map((s) => {
      switch (s.key) {
        case 'health':
          return movieHealthRaw
            ? {
                ...s,
                value: Math.round(movieHealthRaw.healthPercentage),
                caption: movieHealthRaw.healthLabel,
                hue: HEALTH_LABEL_HUE[movieHealthRaw.healthLabel] ?? s.hue,
                spark: undefined,
              }
            : s;
        case 'buzz': {
          if (!buzzRaw) return s;
          const pct = Math.round(buzzRaw.mentionsChangePct);
          return {
            ...s,
            value: `${pct >= 0 ? '+' : ''}${pct}%`,
            caption: 'vs yesterday',
            hue: pct >= 0 ? 'violet' : 'red',
            spark: undefined,
          };
        }
        case 'sentiment': {
          if (!sentimentRaw) return s;
          const pct = Math.round(sentimentRaw.positiveRatio * 100);
          return { ...s, value: `${pct}%`, caption: 'Positive', barPct: pct, hue: sentimentHue(pct) };
        }
        case 'reach':
          return reachRaw
            ? { ...s, value: formatCompact(reachRaw.uniqueUsers), caption: 'Unique People', spark: undefined }
            : s;
        case 'awareness':
          return awarenessRaw
            ? {
                ...s,
                value: awarenessRaw.awarenessLevel,
                caption: `${formatCompact(awarenessRaw.totalViews)} views`,
                hue: AWARENESS_LEVEL_HUE[awarenessRaw.awarenessLevel] ?? s.hue,
                spark: undefined,
              }
            : s;
        default:
          return s;
      }
    });

    return {
      ...base,
      title,
      releaseInDays,
      poster: {
        imageUrl: selectedMovie?.imageUrl ?? null,
      },
      snapshot: {
        ...base.snapshot,
        releaseInDays,
        genre: Array.isArray(selectedMovie?.genre)
          ? selectedMovie.genre.join(', ')
          : selectedMovie?.genre || base.snapshot.genre,
        language: selectedMovie?.language || base.snapshot.language,
      },
      audiencePulse: {
        topRegions,
        peopleLove,
        peopleConcerned,
      },
      aiSummary,
      highlights,
      recommendedActions,
      stats,
    };
  }, [
    selectedMovie,
    audiencePulseRaw,
    pulseAspectsRaw,
    aiSummaryRaw,
    highlightsRaw,
    recommendedActionsRaw,
    movieHealthRaw,
    buzzRaw,
    sentimentRaw,
    reachRaw,
    awarenessRaw,
  ]);

  return {
    ...merged,
    isAiSummaryLoading,
    isHighlightsLoading,
    isRecommendedActionsLoading,
    isAudiencePulseLoading: isAudiencePulseLoading || isPulseAspectsLoading,
  };
}
