import { INDIA_VIEWBOX, INDIA_STATES } from './indiaStatesData';

// `region` on the backend is a free-text column populated by an external
// LLM classifier, not a governed enum — there's no fixed, versioned list of
// possible values, and spelling/casing has already drifted across runs
// (Title Case with spaces, snake_case, Mixed_Case_With_Underscores; and the
// same bucket showing up as both "hindi_belt_north_regions" and
// "hindi_belt_north_india"). So beyond exact Indian state names, buckets are
// matched by substring pattern rather than an exact, ever-growing alias
// list — that degrades gracefully as the classifier's wording keeps shifting.
function normalize(value) {
  return (value ?? '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Sentinel values the backend itself treats as "not a real region" (see
// AuraService's isUnknownRegion()/the 'irrelevant' SQL filter) — skipped
// entirely rather than shown as a map marker or an off-map badge.
function isNonRegionSentinel(key) {
  return key === '' || key === 'unknown' || key === 'irrelevant' || key === 'null' || key === 'none';
}

// Andhra Pradesh + Telangana is sometimes reported as one combined bucket.
// Matched by pattern to survive "telangana" vs. the misspelling "telengana",
// and whatever separators/casing the classifier used.
function isAndhraTelanganaRegion(key) {
  return key.includes('andhra') && (key.includes('telangana') || key.includes('telengana'));
}

// The Hindi-belt/North-India bucket doesn't get its own marker spread across
// its many member states — it's pinned to Mumbai (Maharashtra) instead,
// since Mumbai is the hub of the Hindi film industry this bucket represents.
const HINDI_BELT_NORTH_POINT = { x: 99, y: 430, stateIds: ['mh'] };

function isHindiBeltNorthRegion(key) {
  return key.includes('hindibelt') || key === 'northregions' || key === 'northindia';
}

// Non-Indian buckets (no location to plot at all) get a small off-map badge
// instead of a marker. Matched by pattern for the same reason as above.
function isInternationalRegion(key) {
  return (
    key.includes('international') ||
    key.includes('diaspora') ||
    key.includes('overseas') ||
    key === 'nri'
  );
}

const MARKER_COLORS = ['#3987e5', '#a78bfa', '#34d399', '#f59e0b', '#22d3ee'];

// Backend values for the non-Indian bucket (e.g. "Diaspora_International")
// should read simply as "International" in the UI rather than a literal,
// word-split rendering of the raw classifier string.
function displayName(value) {
  const key = normalize(value);
  if (isInternationalRegion(key)) return 'International';
  return (value ?? '')
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATE_BY_ID = Object.fromEntries(INDIA_STATES.map((s) => [s.id, s]));
const STATE_ID_BY_NAME = Object.fromEntries(INDIA_STATES.map((s) => [normalize(s.name), s.id]));

function unionCentroid(stateIds) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of stateIds) {
    const state = STATE_BY_ID[id];
    if (!state) continue;
    const [x0, y0, x1, y1] = state.bbox;
    minX = Math.min(minX, x0);
    minY = Math.min(minY, y0);
    maxX = Math.max(maxX, x1);
    maxY = Math.max(maxY, y1);
  }
  if (!Number.isFinite(minX)) return null;
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

// Resolves a backend region name to the state(s) it should highlight and the
// point its marker should be drawn at. Fixed-point regions (see above) pin
// to a hardcoded point instead of the centroid of their member states.
// Returns { stateIds: null, point: null } when the region has no Indian
// location at all (e.g. "international") — it belongs in the off-map badge.
function resolveRegion(regionName) {
  const key = normalize(regionName);
  if (isHindiBeltNorthRegion(key)) {
    const { x, y, stateIds } = HINDI_BELT_NORTH_POINT;
    return { stateIds, point: { x, y } };
  }
  if (isAndhraTelanganaRegion(key)) {
    return { stateIds: ['ap', 'tg'], point: unionCentroid(['ap', 'tg']) };
  }
  // Falls back to the state's own 2-letter id (e.g. "TN") in case the
  // classifier ever emits a code instead of the full state name.
  const stateIds = STATE_ID_BY_NAME[key] ? [STATE_ID_BY_NAME[key]] : STATE_BY_ID[key] ? [key] : null;
  if (!stateIds) return { stateIds: null, point: null };
  return { stateIds, point: unionCentroid(stateIds) };
}

// Real India map (state boundaries) with a glowing marker placed at the
// center of the state(s) covered by each region, sized by that region's
// share of known mentions. Regions that don't resolve to Indian territory
// (e.g. "international") have no location to plot, so they get a small
// dot+badge below the map instead of being dropped entirely.
export default function IndiaStatesMap({ regions = [], height = 220, className = '' }) {
  const resolved = regions
    .filter((r) => !isNonRegionSentinel(normalize(r.name)))
    .map((r, i) => ({
      region: r,
      color: MARKER_COLORS[i % MARKER_COLORS.length],
      ...resolveRegion(r.name),
    }));

  const markers = resolved
    .filter((m) => m.point)
    .map(({ region: r, color, point, stateIds }) => ({
      ...point,
      color,
      stateIds,
      radius: 8 + ((r.sharePct ?? 0) / 100) * 18,
      label: `${r.name} — ${r.sharePct}%`,
    }));

  const unmapped = resolved.filter((m) => !m.point);

  const highlightedStateIds = new Set(markers.flatMap((m) => m.stateIds));

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height, backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <svg viewBox={INDIA_VIEWBOX} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {INDIA_STATES.map((state) => {
            const isHighlighted = highlightedStateIds.has(state.id);
            return (
              <path
                key={state.id}
                d={state.d}
                fill={isHighlighted ? 'rgba(57,135,229,0.16)' : 'rgba(255,255,255,0.035)'}
                stroke={isHighlighted ? 'rgba(57,135,229,0.5)' : 'rgba(255,255,255,0.12)'}
                strokeWidth={0.75}
              >
                <title>{state.name}</title>
              </path>
            );
          })}
          {markers.map((m, i) => (
            <g key={i}>
              <circle cx={m.x} cy={m.y} r={m.radius * 1.8} fill={m.color} fillOpacity={0.18} />
              <circle cx={m.x} cy={m.y} r={m.radius} fill={m.color} fillOpacity={0.9}>
                <title>{m.label}</title>
              </circle>
            </g>
          ))}
        </svg>
      </div>
      {unmapped.length > 0 && (
        <div className="space-y-1 mt-1.5">
          {unmapped.map(({ region: r, color }) => (
            <div
              key={r.name}
              title={`${displayName(r.name)} — ${r.sharePct}%`}
              className="flex items-center gap-1 text-[9px] leading-tight text-white/70 bg-white/5 border border-white/10 rounded px-1.5 py-1 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span>{displayName(r.name)}</span>
              <span className="ml-auto text-white/90 font-semibold">{r.sharePct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
