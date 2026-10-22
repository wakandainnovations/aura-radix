import { entityService } from '../../../api/entityService';
import { createReportId, saveReport } from './reportsStore';

// The backend's marketing report runs ~140 KB, mostly raw series (hourly
// heatmap, momentum curves, every spreader's posts). Reports live in
// localStorage, so keep only what the PDF and the Reports table show.
export function slimMovieReport(data) {
  const {
    momentumIntelligence: momentum,
    hourlyActivity: _hourlyActivity, // dropped: the PDF doesn't chart it
    topSpreaders,
    sentimentTrend,
    recommendedActions,
    auraMathIntelligence: aura,
    ...rest
  } = data;
  const name = data.entity?.name;
  const ownTrend = sentimentTrend?.entities?.find((e) => e.name === name) ?? sentimentTrend?.entities?.[0];

  return {
    ...rest,
    sentimentTrend: ownTrend ? { sentiments: ownTrend.sentiments ?? [], checkpoints: ownTrend.checkpoints ?? [] } : undefined,
    topSpreaders: topSpreaders && {
      spreaders: (topSpreaders.spreaders ?? []).slice(0, 10).map(({ globalUserId, profileUrl, totalViews }) => ({ globalUserId, profileUrl, totalViews })),
    },
    recommendedActions: recommendedActions && {
      daysToRelease: recommendedActions.daysToRelease,
      actions: (recommendedActions.actions ?? []).map(({ title, reason, category, confidencePct, windowLabel, status }) => ({
        title, reason, category, confidencePct, windowLabel, status,
      })),
    },
    auraMathIntelligence: aura && { ...aura, topAdvocates: (aura.topAdvocates ?? []).slice(0, 5) },
    momentumIntelligence: momentum && { peakDay: momentum.vmiTrend?.peakDay ?? null },
  };
}

export function createMovieReport({ data, preparedBy }) {
  return {
    id: createReportId(),
    kind: 'movie-intelligence',
    title: data.entity?.name ?? 'Movie report',
    createdAt: new Date().toISOString(),
    preparedBy: preparedBy || null,
    data: slimMovieReport(data),
  };
}

export class ReportNotEntitledError extends Error {
  constructor(requiredTier) {
    super(`The movie report needs the ${requiredTier ?? 'DIAMOND'} plan.`);
    this.name = 'ReportNotEntitledError';
    this.requiredTier = requiredTier;
  }
}

// Regenerates the report live (refresh=true, so it reflects today rather than
// the daily cache, which stops updating 30 days after release) and saves it.
// Saving happens here, not in a component callback, so the report still lands
// in Reports if the user navigates away during the ~45s generation.
export async function generateMovieReport({ movie, username }) {
  const response = await entityService.getMarketingReport('movie', movie.id, { refresh: true });
  if (!response?.entitled || !response.data) throw new ReportNotEntitledError(response?.requiredTier);
  const report = createMovieReport({ data: response.data, preparedBy: username });
  saveReport(username, report);
  return report;
}

// One-line summary for the Reports table and the WhatsApp message.
export function movieReportSummary(data) {
  const health = data.movieHealth;
  const metrics = data.headlineMetrics ?? {};
  return {
    healthLabel: health?.healthLabel ?? null,
    healthPct: health?.healthPercentage != null ? Math.round(health.healthPercentage) : null,
    mentions: metrics.totalMentions ?? null,
    positivePct: metrics.positivityRatio != null ? Math.round(metrics.positivityRatio * 100) : null,
    rank: data.competitivePositioning?.rank ?? null,
    totalTracked: data.competitivePositioning?.totalTracked ?? null,
  };
}
