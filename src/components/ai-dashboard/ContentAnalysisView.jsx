import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ThumbsUp, ThumbsDown, Info, TrendingUp, TrendingDown,
  MessageSquare, BarChart3, Layers,
} from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import { marketingAggregationService } from '../../api/marketingAggregationService';
import {
  PlatformBadge, KeyValueCards,
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

// Keys (case-insensitive) we recognise inside a per-platform entry so we can
// render them as purpose-built widgets instead of a raw key/value dump.
const PLATFORM_COUNT_KEYS = ['posts', 'postcount', 'totalposts', 'total', 'count', 'mentions', 'postsmentioning', 'totalpostsanalyzed'];
const PLATFORM_SENTIMENT_KEYS = ['avgsentiment', 'averagesentiment', 'sentiment', 'sentimentscore', 'avgsentimentscore'];
const SENTIMENT_DIST_KEYS = ['positive', 'negative', 'neutral'];

function prettyLabel(key) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatNum(v) {
  if (typeof v !== 'number') return String(v);
  return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1);
}

// Pull a {positive, neutral, negative} distribution out of a platform entry if
// those numeric keys are present (case-insensitive).
function extractSentimentDist(obj) {
  const out = {};
  let found = false;
  for (const [k, v] of Object.entries(obj)) {
    const lk = k.toLowerCase();
    if (SENTIMENT_DIST_KEYS.includes(lk) && typeof v === 'number') { out[lk] = v; found = true; }
  }
  return found ? { positive: out.positive || 0, neutral: out.neutral || 0, negative: out.negative || 0 } : null;
}

function SentimentDistBar({ dist }) {
  const total = dist.positive + dist.neutral + dist.negative;
  if (total <= 0) return null;
  const seg = (v, cls) => (v > 0 ? <div className={cls} style={{ width: `${(v / total) * 100}%` }} /> : null);
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-border">
        {seg(dist.positive, 'bg-emerald-400')}
        {seg(dist.neutral, 'bg-slate-400')}
        {seg(dist.negative, 'bg-red-400')}
      </div>
      <div className="mt-1 flex justify-between text-[10px]">
        <span className="text-emerald-400">{formatNum(dist.positive)} pos</span>
        <span className="text-slate-400">{formatNum(dist.neutral)} neu</span>
        <span className="text-red-400">{formatNum(dist.negative)} neg</span>
      </div>
    </div>
  );
}

function AspectChips({ items, strength }) {
  const cls = strength ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400';
  return (
    <div>
      <p className={`mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${strength ? 'text-emerald-400' : 'text-red-400'}`}>
        {strength ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
        {strength ? 'Strengths' : 'Weaknesses'}
      </p>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 6).map((it, i) => {
          const label = it && typeof it === 'object' ? (it.aspect ?? JSON.stringify(it)) : String(it);
          return <span key={i} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>;
        })}
        {items.length > 6 && <span className="text-[10px] text-muted-foreground">+{items.length - 6}</span>}
      </div>
    </div>
  );
}

function PlatformCard({ platform, value }) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return (
      <div className="rounded-xl border border-border bg-background p-3">
        <PlatformBadge platform={platform} />
        <p className="mt-2 text-sm font-semibold text-foreground">{String(value ?? '—')}</p>
      </div>
    );
  }

  const lower = (k) => k.toLowerCase();
  const entries = Object.entries(value);
  const used = new Set();

  const countEntry = entries.find(([k, v]) => typeof v === 'number' && PLATFORM_COUNT_KEYS.includes(lower(k)));
  if (countEntry) used.add(countEntry[0]);

  const sentEntry = entries.find(([k, v]) => typeof v === 'number' && PLATFORM_SENTIMENT_KEYS.includes(lower(k)));
  if (sentEntry) used.add(sentEntry[0]);

  const dist = extractSentimentDist(value);
  if (dist) entries.forEach(([k, v]) => { if (typeof v === 'number' && SENTIMENT_DIST_KEYS.includes(lower(k))) used.add(k); });

  const strengthEntry = entries.find(([k, v]) => Array.isArray(v) && lower(k).includes('strength'));
  if (strengthEntry) used.add(strengthEntry[0]);
  const weaknessEntry = entries.find(([k, v]) => Array.isArray(v) && lower(k).includes('weak'));
  if (weaknessEntry) used.add(weaknessEntry[0]);

  const restScalars = entries.filter(([k, v]) => !used.has(k) && (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean'));
  const restOther = entries.filter(([k, v]) => !used.has(k) && v && typeof v === 'object');

  const sentScore = sentEntry ? sentEntry[1] : null;
  const tone = sentScore != null ? sentimentTone(sentScore) : null;

  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <PlatformBadge platform={platform} />
        {countEntry && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{formatNum(countEntry[1])}</span> {prettyLabel(countEntry[0]).toLowerCase()}
          </span>
        )}
      </div>

      {sentScore != null && (
        <div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Avg. sentiment</span>
            <span className={`font-mono font-semibold ${tone.text}`}>{formatNum(sentScore)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(Math.max(sentScore, 0), 100)}%` }} />
          </div>
        </div>
      )}

      {dist && <SentimentDistBar dist={dist} />}

      {strengthEntry && strengthEntry[1].length > 0 && <AspectChips items={strengthEntry[1]} strength />}
      {weaknessEntry && weaknessEntry[1].length > 0 && <AspectChips items={weaknessEntry[1]} strength={false} />}

      {restScalars.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {restScalars.map(([k, v]) => (
            <span key={k} className="text-[11px] text-muted-foreground">
              {prettyLabel(k)}: <span className="font-medium text-foreground">{formatNum(v)}</span>
            </span>
          ))}
        </div>
      )}

      {restOther.map(([k, v]) => (
        <div key={k}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{prettyLabel(k)}</p>
          <KeyValueCards data={v} />
        </div>
      ))}
    </div>
  );
}

function PlatformBreakdown({ data }) {
  const entries = Object.entries(data || {});
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Layers className="h-4 w-4 text-blue-400" />
        Per-Platform Breakdown
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([platform, value]) => (
          <PlatformCard key={platform} platform={platform} value={value} />
        ))}
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
        <PlatformBreakdown data={data.byPlatform} />
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
