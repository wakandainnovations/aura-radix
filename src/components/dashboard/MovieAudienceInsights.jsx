import React, { useEffect, useState } from 'react';
import { Globe, Users, Gauge, Loader2, AlertCircle, Award } from 'lucide-react';
import { audienceService } from '../../api';
import { formatCurrency } from '../../utils/helpers';

function Shell({ children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Audience Intelligence</h3>
      </div>
      {children}
    </div>
  );
}

function formatCount(value) {
  if (value == null) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString('en-US');
}

// Some rates arrive as a 0-1 fraction, others already as a 0-100 percentage.
// Normalize to a 0-100 percentage the same way the rest of the dashboard does.
function toPercent(value) {
  if (value == null) return null;
  return value <= 1 ? value * 100 : value;
}

function percentileColor(pct) {
  if (pct == null) return 'text-muted-foreground';
  if (pct >= 66) return 'text-green-500';
  if (pct >= 33) return 'text-yellow-500';
  return 'text-red-500';
}

function percentileBarColor(pct) {
  if (pct == null) return 'bg-muted-foreground';
  if (pct >= 66) return 'bg-green-500';
  if (pct >= 33) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function MovieAudienceInsights({ selectedEntity, entityType }) {
  const movieName = selectedEntity?.name;
  const language = selectedEntity?.language;
  const isMovie = entityType === 'movie';

  const [languageAudience, setLanguageAudience] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [budgetComparison, setBudgetComparison] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    if (!isMovie || !movieName || !language) {
      setLanguageAudience(null);
      setMovieDetail(null);
      setBudgetComparison(null);
      setStatus({ loading: false, error: null });
      return;
    }

    let cancelled = false;
    setStatus({ loading: true, error: null });

    Promise.allSettled([
      audienceService.getLanguageAudience(language),
      audienceService.getMovieAudienceDetail(movieName, language, { limit: 10 }),
      audienceService.getBudgetComparison(movieName, { language }),
    ]).then(([languageRes, detailRes, budgetRes]) => {
      if (cancelled) return;
      setLanguageAudience(languageRes.status === 'fulfilled' ? languageRes.value : null);
      setMovieDetail(detailRes.status === 'fulfilled' ? detailRes.value : null);
      setBudgetComparison(budgetRes.status === 'fulfilled' ? budgetRes.value : null);

      // Only surface a hard error when every call failed — a single 404 (e.g.
      // no budget recorded) just means that section stays empty.
      const allFailed = [languageRes, detailRes, budgetRes].every((r) => r.status === 'rejected');
      setStatus({
        loading: false,
        error: allFailed ? (languageRes.reason || detailRes.reason || budgetRes.reason) : null,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [isMovie, movieName, language]);

  if (!isMovie || !movieName || !language) return null;

  if (status.loading) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading audience intelligence…</span>
        </div>
      </Shell>
    );
  }

  if (status.error) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-red-500 py-8 justify-center">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">
            {status.error.message || 'Failed to load audience intelligence.'}
          </span>
        </div>
      </Shell>
    );
  }

  const targetPercentile = budgetComparison?.targetAudiencePercentileInRange;
  const comparableMovies = budgetComparison?.comparableMovies || [];
  const users = movieDetail?.users || [];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Audience Intelligence</h3>
        <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-accent text-muted-foreground">
          {language}
        </span>
      </div>

      {/* Stat overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-accent/30 border border-border rounded-lg">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Users className="w-3 h-3" />
            Movie Audience
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCount(movieDetail?.uniqueAudienceCount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {movieDetail ? `${formatCount(movieDetail.totalPosts)} qualifying posts` : 'No audience data yet'}
          </p>
        </div>

        <div className="p-4 bg-accent/30 border border-border rounded-lg">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Globe className="w-3 h-3" />
            {language} Audience
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCount(languageAudience?.uniqueAudienceCount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {languageAudience
              ? `across ${languageAudience.movieCount} tracked movie${languageAudience.movieCount === 1 ? '' : 's'}`
              : 'No language data yet'}
          </p>
        </div>

        <div className="p-4 bg-accent/30 border border-border rounded-lg">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Gauge className="w-3 h-3" />
            Budget Percentile
          </div>
          <p className={`text-2xl font-bold ${percentileColor(targetPercentile)}`}>
            {targetPercentile != null ? `${targetPercentile.toFixed(0)}th` : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {budgetComparison
              ? `vs. movies budgeted ${formatCurrency(budgetComparison.budgetRangeMinUsd)}–${formatCurrency(budgetComparison.budgetRangeMaxUsd)}`
              : 'No budget on record'}
          </p>
        </div>
      </div>

      {/* Budget comparison */}
      {budgetComparison && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Audience vs. Similarly-Budgeted Movies
            </p>
          </div>
          <div className="space-y-2">
            {/* Target movie row, always first and highlighted */}
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {budgetComparison.targetMovieName}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {budgetComparison.targetLanguage} · {formatCurrency(budgetComparison.targetBudget)}
                  </span>
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCount(budgetComparison.targetUniqueAudienceCount)}
                </span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full ${percentileBarColor(targetPercentile)}`}
                  style={{ width: `${targetPercentile ?? 0}%` }}
                />
              </div>
            </div>

            {comparableMovies.length > 0 ? (
              comparableMovies.map((movie, idx) => (
                <div key={idx} className="p-3 bg-accent/20 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">
                      {movie.movieName}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {movie.language} · {formatCurrency(movie.budget)}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCount(movie.uniqueAudienceCount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full ${percentileBarColor(movie.audiencePercentileInRange)}`}
                      style={{ width: `${movie.audiencePercentileInRange ?? 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                No other similarly-budgeted movies tracked yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top audience members for the movie */}
      {users.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Top Audience Members</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-4 font-medium">Author</th>
                  <th className="pb-2 pr-4 font-medium">Posts</th>
                  <th className="pb-2 pr-4 font-medium">Engagement</th>
                  <th className="pb-2 pr-4 font-medium">Positive</th>
                  <th className="pb-2 font-medium">Avg. Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-foreground font-medium">{user.author}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{user.postCount}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {(toPercent(user.engagementRatio) ?? 0).toFixed(1)}%
                    </td>
                    <td className="py-2 pr-4 text-green-500">
                      {(toPercent(user.positiveRatio) ?? 0).toFixed(0)}%
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {(toPercent(user.averageSentimentScore) ?? 0).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!movieDetail && !budgetComparison && !languageAudience && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No audience data available for this movie yet.
        </p>
      )}
    </div>
  );
}
