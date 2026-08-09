import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dummyCommandCenter } from './commandCenterData';
import { dummyMovieOverview } from '../dummyMovieData';
import { daysUntilRelease, timeAgoLabel } from '../dateUtils';
import { dashboardService } from '../../../api/dashboardService';

// Maps the backend's HighlightItem.type (POSITIVE|NEGATIVE|NEUTRAL, no icon
// concept) onto this panel's tone/kind vocabulary, which was designed around
// richer dummy data (icons per event type). The LLM writes a full sentence
// per highlight, so value/caption (separate stat + qualifier) don't apply.
const HIGHLIGHT_TYPE_TO_TONE = { POSITIVE: 'good', NEGATIVE: 'bad', NEUTRAL: 'warning' };
const TONE_TO_KIND = { good: 'arrow', bad: 'arrowDown', warning: 'plus' };

// Merges the selected real movie entity's identity fields (title, release
// countdown, poster image, genre/language), the real audience-pulse top
// regions, and the real AI summary/highlights into the Command Center's dummy
// data. Everything else on this page (recommended actions, competitor watch,
// the audience pulse map/love/concerned chips, campaign timeline) has no
// backend concept yet, so it stays as static dummy data — same approach as
// useMovieOverviewData for the My Movie tab.
export default function useCommandCenterData(selectedMovie) {
  const entityId = selectedMovie?.id;

  const { data: audiencePulseRaw } = useQuery({
    queryKey: ['audience-pulse', entityId, 'newui-command-center'],
    queryFn: () => dashboardService.getAudiencePulse(entityId),
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

  const merged = useMemo(() => {
    const base = dummyCommandCenter;
    const title = selectedMovie?.name ?? dummyMovieOverview.title;
    const releaseInDays = selectedMovie?.releaseDate
      ? daysUntilRelease(selectedMovie.releaseDate)
      : dummyMovieOverview.releaseInDays;

    // Only some movies have region-tagged mentions yet, so fall back to the
    // dummy top regions when the entity has none (or hasn't loaded yet).
    // The "unknown" region is a real predicted_region value distinct from
    // the null/"irrelevant" rows the backend already excludes, so it's
    // filtered out here rather than on the server. The panel should only
    // ever display the known-region split, so shares are rescaled against
    // the known total (assuming unknown mentions split across known regions
    // in the same ratio as the known mentions do) rather than the original
    // total that included unknown.
    const realRegions = (audiencePulseRaw?.regions ?? []).filter(
      (r) => r.region?.toLowerCase() !== 'unknown'
    );
    const knownTotalPct = realRegions.reduce((sum, r) => sum + (r.sharePct ?? 0), 0);
    const topRegions =
      realRegions.length > 0
        ? realRegions.slice(0, 3).map((r, i) => ({
            rank: i + 1,
            name: r.region,
            sharePct: knownTotalPct > 0 ? Math.round((r.sharePct / knownTotalPct) * 100) : 0,
          }))
        : base.audiencePulse.topRegions;

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
        ...base.audiencePulse,
        topRegions,
      },
      aiSummary,
      highlights,
    };
  }, [selectedMovie, audiencePulseRaw, aiSummaryRaw, highlightsRaw]);

  return { ...merged, isAiSummaryLoading, isHighlightsLoading };
}
