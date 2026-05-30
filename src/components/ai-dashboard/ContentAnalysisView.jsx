import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ThumbsUp, ThumbsDown, Info, TrendingUp, TrendingDown,
  MessageSquare, BarChart3,
} from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import { marketingAggregationService } from '../../api/marketingAggregationService';
import {
  PlatformBadge, CollapsibleKV,
  Section, KeywordSearch,
} from './audienceIntelShared';

// Cap the number of aspect drivers surfaced so the view stays focused on the
// highest-impact signals rather than dumping the full API payload.
const MAX_DRIVERS = 10;

// Normalize a strength/weakness entry: the API usually returns objects, but
// older responses sometimes send bare aspect strings.
function normalizeDriver(item, sentimentLabel) {
  if (item && typeof item === 'object') return { ...item, sentimentLabel };
  return { aspect: String(item ?? ''), sentimentLabel };
}

// Map a 0–100 sentiment score to a tone palette for badges/bars.
function sentimentTone(score) {
  if (score == null) return { text: 'text-muted-foreground', bg: 'bg-muted', bar: 'bg-muted-foreground/40' };
  if (score >= 60) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', bar: 'bg-emerald-400' };
  if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500/15', bar: 'bg-amber-400' };
  return { text: 'text-red-400', bg: 'bg-red-500/15', bar: 'bg-red-400' };
}

function StatCard({ value, label, badge, highlight }) {
  return (
    <div className={`min-w-[110px] rounded-xl border px-4 py-3 text-center ${
      highlight ? 'bg-blue-500/10 border-blue-500/30' : 'bg-background border-border'
    }`}>
      <p className={`text-xl font-bold ${highlight ? 'text-blue-300' : 'text-foreground'}`}>
        {(value ?? 0).toLocaleString()}
      </p>
      {badge || <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>}
    </div>
  );
}

function AspectDriverRow({ driver, rank, maxImpact }) {
  const isStrength = driver.sentimentLabel === 'strength';
  const sentiment = driver.averageSentiment;
  const tone = sentimentTone(sentiment);
  const impact = driver.impactScore ?? 0;
  const impactPct = maxImpact > 0 ? Math.max((impact / maxImpact) * 100, 2) : 0;
  const Icon = isStrength ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 hover:bg-accent/20 transition-colors">
      <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground">{rank}</span>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        isStrength ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
      }`}>
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{driver.aspect || '—'}</span>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isStrength ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {isStrength ? 'Strength' : 'Weakness'}
          </span>
        </div>
        {driver.postsMentioning != null && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {driver.postsMentioning.toLocaleString()} posts mentioning
          </p>
        )}
      </div>

      {sentiment != null && (
        <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${tone.bg} ${tone.text}`}>
          {sentiment.toFixed(0)}
          <span className="ml-0.5 text-[9px] font-normal opacity-70">sent.</span>
        </span>
      )}

      <div className="hidden w-28 shrink-0 sm:block" title={`Impact ${impact.toFixed(1)}`}>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Impact</span>
          <span className="font-mono text-foreground">{impact.toFixed(1)}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
          <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${impactPct}%` }} />
        </div>
      </div>
    </div>
  );
}

function AspectDriversDisplay({ data }) {
  if (!data) return null;

  const platforms = data.totalPostsAnalyzed || {};
  const platformEntries = Object.entries(platforms).filter(([k]) => k !== 'total');

  const strengths = (data.strengths || []).map((s) => normalizeDriver(s, 'strength'));
  const weaknesses = (data.weaknesses || []).map((w) => normalizeDriver(w, 'weakness'));

  // Rank all aspect drivers by impact and keep only the top 20 so the most
  // meaningful sentiment drivers lead, regardless of strength/weakness split.
  const allDrivers = [...strengths, ...weaknesses]
    .sort((a, b) => (b.impactScore ?? 0) - (a.impactScore ?? 0));
  const topDrivers = allDrivers.slice(0, MAX_DRIVERS);
  const maxImpact = topDrivers.reduce((m, d) => Math.max(m, d.impactScore ?? 0), 0);
  const shownStrengths = topDrivers.filter((d) => d.sentimentLabel === 'strength').length;
  const shownWeaknesses = topDrivers.length - shownStrengths;

  return (
    <div className="mt-3 space-y-5">
      <div className="flex flex-wrap items-stretch gap-3">
        <StatCard value={platforms.total} label="Total Posts" highlight />
        {platformEntries.map(([plat, count]) => (
          <StatCard
            key={plat}
            value={count}
            badge={<div className="mt-1 flex justify-center"><PlatformBadge platform={plat} /></div>}
          />
        ))}
        {data.keyword && (
          <div className="flex min-w-[110px] flex-col justify-center rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Keyword</p>
            <p className="truncate text-sm font-semibold text-foreground">{data.keyword}</p>
          </div>
        )}
      </div>

      {topDrivers.length > 0 ? (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Top Aspect Drivers
            </h4>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400"><ThumbsUp className="h-3 w-3" />{shownStrengths} strengths</span>
              <span className="flex items-center gap-1 text-red-400"><ThumbsDown className="h-3 w-3" />{shownWeaknesses} weaknesses</span>
              {allDrivers.length > topDrivers.length && (
                <span className="text-muted-foreground">Top {topDrivers.length} of {allDrivers.length}</span>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            {topDrivers.map((driver, i) => (
              <AspectDriverRow key={`${driver.aspect}-${i}`} driver={driver} rank={i + 1} maxImpact={maxImpact} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No aspect drivers found.</p>
      )}

      {data.byPlatform && Object.keys(data.byPlatform).length > 0 && (
        <CollapsibleKV title="Per-Platform Breakdown" data={data.byPlatform} />
      )}
    </div>
  );
}

// Aspect-driver data is stable for a given entity/keyword, so cache it indefinitely:
// a request only fires for a new query key (new entity or a newly typed keyword).
// The React Query cache lives at the app root and survives this view unmounting,
// so navigating back to the section shows cached data instead of refetching.
const CONTENT_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
  retry: false,
};

export default function ContentAnalysisView({ selectedEntity }) {
  const entityId = selectedEntity?.id ?? null;

  // A typed keyword overrides the entity-aggregated data for this section.
  const [aspectKeyword, setAspectKeyword] = useState(null);

  // Reset the keyword override when a different entity is selected so its
  // aggregated data shows by default.
  useEffect(() => {
    setAspectKeyword(null);
  }, [entityId]);

  const aspectDriversQuery = useQuery({
    queryKey: aspectKeyword
      ? ['content', 'aspectDrivers', 'keyword', aspectKeyword]
      : ['content', 'aspectDrivers', 'entity', entityId],
    queryFn: () => (aspectKeyword
      ? auraMathService.getAspectDrivers(aspectKeyword)
      : marketingAggregationService.getAspectDrivers({ entityId })),
    enabled: Boolean(aspectKeyword || entityId),
    ...CONTENT_QUERY_OPTIONS,
  });

  const showEntityBanner = Boolean(
    selectedEntity && !aspectKeyword && aspectDriversQuery.data,
  );
  const autoLoadError = !aspectKeyword && aspectDriversQuery.error;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-7 h-7 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Analysis</h2>
            <p className="text-sm text-muted-foreground">Analyze aspect-level sentiment drivers across platforms</p>
          </div>
        </div>

        {showEntityBanner && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-primary">
              Showing aggregated data for <span className="font-semibold">{selectedEntity.name}</span>. Use the search field below to look up a different keyword.
            </p>
          </div>
        )}

        {autoLoadError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <Info className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{autoLoadError.message || 'Failed to load aggregated data'}</p>
          </div>
        )}

        <Section icon={Search} title="Aspect Drivers" subtitle="Strengths and weaknesses driving audience sentiment across platforms" color="text-blue-400">
          <KeywordSearch
            label="Search by keyword to override..."
            loading={aspectDriversQuery.isFetching}
            onSearch={(kw) => setAspectKeyword(kw)}
          />
          <AspectDriversDisplay data={aspectDriversQuery.data} />
        </Section>
      </div>
    </div>
  );
}
