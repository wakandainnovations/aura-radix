/**
 * Map an AI threat score to a severity tier. Kept in sync with the
 * ThreatLevelFilter options.
 * @param {number} score
 * @returns {'critical'|'elevated'|'low'}
 */
export function threatLevelForScore(score) {
  const value = Number(score) || 0;
  if (value > 70) return 'critical';
  if (value > 40) return 'elevated';
  return 'low';
}

/**
 * Filter mentions by platform, sentiment, and threat level.
 * @param {Array} mentions - Array of mention objects
 * @param {Object} filters - Filter configuration
 * @param {Array} filters.platforms - Platform filters (match mention.platform)
 * @param {Array} filters.sentiments - Sentiment filters (match mention.aiSentiment)
 * @param {Array} filters.threatLevels - Threat-tier filters ('critical'|'elevated'|'low')
 * @returns {Array} Filtered mentions
 */
export function filterMentions(mentions, { platforms = [], sentiments = [], threatLevels = [] } = {}) {
  let filtered = mentions;

  if (platforms.length > 0) {
    filtered = filtered.filter(m => platforms.includes(m.platform));
  }

  if (sentiments.length > 0) {
    filtered = filtered.filter(m => sentiments.includes(m.aiSentiment));
  }

  if (threatLevels.length > 0) {
    filtered = filtered.filter(m => threatLevels.includes(threatLevelForScore(m.aiThreatScore)));
  }

  return filtered;
}
