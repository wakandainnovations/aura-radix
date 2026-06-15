/**
 * License tier metadata shared across the UI.
 *
 * The authoritative per-user limits always come from the backend
 * (`GET /api/licenses/me`). The static table below is used only for the
 * upgrade-comparison UI (showing what each tier offers). Prices are
 * intentionally absent — the backend never returns them on user-facing
 * endpoints (F3 req 14).
 */

export const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];

/**
 * Premium feature keys — must match the backend Feature catalog keys returned by
 * `GET /api/license/features`. Used to drive blur gating via useLicense().hasFeature.
 */
export const FEATURE_KEYS = {
  CHECKPOINTS: 'checkpoints',
  CRISIS: 'crisis',
  INTELLIGENCE_REPORT: 'intelligence-report',
  AGGREGATED_INTEL: 'aggregated-intel',
  AUDIENCE_CONTENT: 'audience-content',
};

const TIER_RANK = TIERS.reduce((acc, tier, i) => {
  acc[tier] = i;
  return acc;
}, {});

/**
 * True when `tier` is at least `minimum` in the BRONZE < SILVER < GOLD < DIAMOND order.
 * Unknown tiers rank lowest.
 */
export const isAtLeast = (tier, minimum) =>
  (TIER_RANK[tier] ?? -1) >= (TIER_RANK[minimum] ?? Number.MAX_SAFE_INTEGER);

export const tierRank = (tier) => TIER_RANK[tier] ?? -1;

/** Static per-tier limits — for the comparison table only (F4 table mirrors the backend enum). */
export const TIER_LIMITS = {
  BRONZE: { maxKeywords: 5, maxEntities: 5, maxMentionsPerMonth: 2000, collectionFrequency: 'PT24H' },
  SILVER: { maxKeywords: 10, maxEntities: 10, maxMentionsPerMonth: 10000, collectionFrequency: 'PT12H' },
  GOLD: { maxKeywords: 15, maxEntities: 15, maxMentionsPerMonth: 40000, collectionFrequency: 'PT1H' },
  DIAMOND: { maxKeywords: 25, maxEntities: 20, maxMentionsPerMonth: 100000, collectionFrequency: 'PT10M' },
};

export const TIER_COLORS = {
  BRONZE: 'text-amber-700',
  SILVER: 'text-slate-300',
  GOLD: 'text-yellow-400',
  DIAMOND: 'text-cyan-300',
};

/**
 * Human-friendly rendering of an ISO-8601 duration like "PT24H" / "PT10M" / "PT1H".
 * Falls back to the raw string for anything unexpected.
 */
export const formatCollectionFrequency = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return iso;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  if (hours && minutes) return `every ${hours}h ${minutes}m`;
  if (hours) return hours === 1 ? 'every hour' : `every ${hours}h`;
  if (minutes) return `every ${minutes}m`;
  return iso;
};
