export function formatCompact(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `${value}`;
}

// Rounds up to a "nice" number (quarter-magnitude steps) so axis ticks divide
// evenly into round labels (750K, 1.5M, ...) instead of odd values like 653.4K.
export function niceAxisMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const niceNormalized = Math.ceil(normalized * 4) / 4;
  return niceNormalized * magnitude;
}

// Builds `steps + 1` evenly-spaced axis ticks from 0 to a nice-rounded max.
export function niceAxisTicks(maxValue, steps = 5) {
  const niceMax = niceAxisMax(maxValue);
  return Array.from({ length: steps + 1 }, (_, i) => Math.round((niceMax * i) / steps));
}
