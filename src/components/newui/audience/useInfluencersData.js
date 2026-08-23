import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketingAggregationService } from '../../../api/marketingAggregationService';
import { dashboardService } from '../../../api/dashboardService';
import { formatCompact } from '../formatCompact';
import { SERIES_COLORS } from '../theme';
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

const SENTIMENT_LABEL = { POSITIVE: 'Positive', NEGATIVE: 'Negative', NEUTRAL: 'Neutral', TOTAL: 'Neutral' };

// Human labels for the backend's snake_case topicCategory values, shown in
// the "Topics of Discussion" panel.
const TOPIC_CATEGORY_LABELS = {
  box_office_commercial: 'Box office / commercial',
  cast_performance: 'Cast performance',
  politics_personal_life_crossover: 'Politics / personal-life crossover',
  music_songs: 'Music / songs',
  story_screenplay: 'Story / screenplay',
  direction_technical_craft: 'Direction / technical craft',
  general: 'General / unspecified',
};


// Backend sends postDate as a full Instant (e.g. "2025-05-12T10:30:00Z"), unlike the date-only
// strings the rest of this UI formats with dateUtils' formatShortDate.
function formatPostDate(instant) {
  if (!instant) return '';
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const { data: contentRaw, isLoading: isContentLoading } = useQuery({
    queryKey: ['top-spreader-content', entityId, 'newui-audience-influencers'],
    queryFn: () => dashboardService.getTopSpreaderContent(entityId, { language: selectedMovie?.language }),
    enabled: entityId != null,
    ...SPREADER_QUERY_OPTIONS,
  });

  const { data: topicsRaw, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['topic-category-breakdown', entityId, 'newui-audience-influencers'],
    queryFn: () => dashboardService.getTopicCategoryBreakdown(entityId),
    enabled: entityId != null,
  });

  const merged = useMemo(() => {
    const base = influencersData;
    if (!entityId) return base;

    // Same noise filter the classic UI's TopSpreadersTable applies - authors
    // with no measured sentiment add noise without signal.
    const rows = (Array.isArray(spreadersRaw) ? spreadersRaw : []).filter(
      (r) => (r.average_sentiment_score ?? 0) !== 0
    );

    // allInfluencers (marketingAggregationService.getTopSpreaders) and
    // allContent (dashboardService.getTopSpreaderContent) are two independent
    // queries, so one coming back empty must not blank out the other -
    // allInfluencers keeps the dummy fallback below when `rows` is empty,
    // computed separately from whether allContent has real data.
    let allInfluencers = base.allInfluencers;
    if (rows.length > 0) {
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

      allInfluencers = sortedByViews.map(toRow);
    }

    // Flattens every top spreader's top posts into one list - a post's own
    // "influencer" identity is the spreader's globalUserId, which is the same
    // string the marketing aggregation endpoint above surfaces as `author`
    // (both are joined off the same identity on the backend), so it doubles
    // as the display name without needing to cross-reference `rows`.
    const spreaders = Array.isArray(contentRaw?.spreaders) ? contentRaw.spreaders : [];
    const allContent = spreaders.flatMap((s) =>
      (s.topContent ?? []).map((post) => {
        const engRateValue = post.engagementRate != null ? Number((post.engagementRate * 100).toFixed(1)) : 0;
        return {
          id: post.mentionId,
          title: post.content || '—',
          permalink: post.permalink,
          influencer: s.globalUserId ?? '—',
          profileUrl: s.profileUrl,
          platform: platformLabel(post.platform),
          date: formatPostDate(post.postDate),
          reach: formatCompact(post.views ?? 0),
          reachValue: post.views ?? 0,
          engagement: formatCompact((post.likes ?? 0) + (post.comments ?? 0)),
          engRate: post.engagementRate != null ? `${engRateValue}%` : '—',
          engRateValue,
          sentiment: SENTIMENT_LABEL[post.sentiment] ?? 'Neutral',
        };
      })
    );

    // Topic-category breakdown for the "Topics of Discussion" pie chart. The
    // backend's classifier isn't constrained to the seven documented buckets -
    // it also emits long-tail free-form values (hashtags, "trailer",
    // "technology", "official_promo", ...), which would otherwise fragment the
    // pie into dozens of near-zero slivers. Anything outside the known
    // taxonomy is folded into "General / unspecified", the existing catch-all
    // bucket, then the whole set is re-ranked by count so colors/order still
    // reflect actual share.
    const topicRows = Array.isArray(topicsRaw?.topics) ? topicsRaw.topics : [];
    let topicsOfDiscussion = base.topicsOfDiscussion;
    if (topicRows.length > 0) {
      const counts = Object.fromEntries(Object.keys(TOPIC_CATEGORY_LABELS).map((k) => [k, 0]));
      for (const t of topicRows) {
        const key = TOPIC_CATEGORY_LABELS[t.topicCategory] ? t.topicCategory : 'general';
        counts[key] = (counts[key] ?? 0) + (t.count ?? 0);
      }
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      topicsOfDiscussion = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count], i) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return {
            label: TOPIC_CATEGORY_LABELS[key],
            value: pct,
            pctLabel: `${pct}%`,
            color: SERIES_COLORS[i % SERIES_COLORS.length],
          };
        });
    }

    // The "Influencer Content Performance" panel and its "View all influencer
    // content" modal both derive their visible top-5 (and sort order) from
    // this full list at render time in InfluencersTab.jsx, mirroring how
    // allInfluencers/topInfluencers already work above.
    return {
      ...base,
      allInfluencers,
      topicsOfDiscussion,
      ...(spreaders.length > 0 ? { allContent } : {}),
    };
  }, [entityId, spreadersRaw, contentRaw, topicsRaw]);

  return {
    ...merged,
    isInfluencersLoading: entityId != null && isLoading,
    isContentLoading: entityId != null && isContentLoading,
    isTopicsLoading: entityId != null && isTopicsLoading,
  };
}
