import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketingAggregationService } from '../../../api/marketingAggregationService';
import { formatCompact } from '../formatCompact';
import { influencersData } from './audienceData';

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

// Derives a short @handle from a profile URL's last path segment, since
// top-spreaders rows carry a display name (author) and a profile link but
// no separate handle field the way the dummy data assumes.
function handleFromProfileUrl(url) {
  if (!url) return undefined;
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '');
    const last = path.split('/').filter(Boolean).pop();
    return last ? `@${last}` : undefined;
  } catch {
    return undefined;
  }
}

// Spreader data is stable for a given entity, so cache it indefinitely -
// same policy the classic UI's Spreader Analysis view uses for this endpoint
// (src/components/ai-dashboard/SpreaderAnalysisView.jsx SPREADER_QUERY_OPTIONS).
const SPREADER_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
  retry: false,
};

// Fetches the same "top spreaders" data the classic UI's Spreader Analysis
// view uses (marketingAggregationService.getTopSpreaders) and reshapes it for
// the new UI's Top Influencers table and Influencer Impact Map. This is a
// DIAMOND-gated endpoint - for non-entitled accounts it returns a masked
// preview array instead of real data (see src/api/entitlement.js), which
// gets rendered the same way classic UI renders it, with no separate
// blur/gating handling here.
export default function useInfluencersData(selectedMovie) {
  const entityId = selectedMovie?.id;

  const { data: spreadersRaw, isLoading } = useQuery({
    queryKey: ['top-spreaders', entityId, 'newui-audience-influencers'],
    queryFn: () => marketingAggregationService.getTopSpreaders({ entityId }),
    enabled: entityId != null,
    ...SPREADER_QUERY_OPTIONS,
  });

  const merged = useMemo(() => {
    const base = influencersData;
    if (!entityId) return base;

    // Same noise filter the classic UI's TopSpreadersTable applies - authors
    // with no measured sentiment add noise without signal.
    const rows = (Array.isArray(spreadersRaw) ? spreadersRaw : []).filter(
      (r) => (r.average_sentiment_score ?? 0) !== 0
    );
    if (rows.length === 0) return base;

    // viral_potential_score is an open-ended score, not a 0-100 scale, so
    // "Impact" is normalized relative to the top spreader across the whole
    // result set (like a leaderboard percentile) - there's no fixed backend
    // scale to convert it to directly. Computed against the full set (not
    // just the slice shown) so Impact values stay identical between the
    // panel's top rows and the "View all influencers" modal.
    const maxScore = Math.max(...rows.map((r) => r.viral_potential_score ?? 0), 1);

    // Sorted by total views (audience reached), not viral score - the score
    // still feeds "Impact" below, it just isn't the sort key.
    const sortedByViews = [...rows].sort((a, b) => (b.total_views ?? 0) - (a.total_views ?? 0));

    const toRow = (r, i) => {
      const platform = platformLabel(r.platform_handles?.primary_platform);
      return {
        rank: i + 1,
        name: r.author ?? '—',
        handle: handleFromProfileUrl(r.profile_url) ?? platform,
        platform,
        views: formatCompact(r.total_views ?? 0),
        viewsValue: r.total_views ?? 0,
        engRate: `${((r.engagement_rate ?? 0) * 100).toFixed(1)}%`,
        engRateValue: Number(((r.engagement_rate ?? 0) * 100).toFixed(1)),
        impact: Math.round(((r.viral_potential_score ?? 0) / maxScore) * 100),
        profileUrl: r.profile_url,
      };
    };

    const allInfluencers = sortedByViews.map(toRow);

    // The "Top Influencers" table and Impact Map both derive their visible
    // top-8 (and its ordering/coloring) from this full list at render time
    // in InfluencersTab.jsx, based on whatever column is currently sorted -
    // not fixed here, so changing sort re-ranks across every spreader
    // returned by the API, not just a pre-sliced top 8.
    return {
      ...base,
      allInfluencers,
    };
  }, [entityId, spreadersRaw]);

  return {
    ...merged,
    isInfluencersLoading: entityId != null && isLoading,
  };
}
