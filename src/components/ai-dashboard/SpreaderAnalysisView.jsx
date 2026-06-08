import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Network, Users, Info } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import { marketingAggregationService } from '../../api/marketingAggregationService';
import {
  PlatformBadge, ScoreBar, getDominantReach, fmt,
  Section, KeywordSearch, KeyValueCards,
} from './audienceIntelShared';
import { useSortableRows, SortableHeader } from '../shared';

// Resolve an author's platform profile URL from the various shapes the backend
// returns across the three sections: viral seeds expose `outreachHandle`, top
// spreaders may expose a flat `profile_url`, and lookalikes nest URLs under
// `platform_handles.by_platform`. Returns null when no link is available.
function resolveProfileUrl(row) {
  if (!row || typeof row !== 'object') return null;
  if (row.profile_url) return row.profile_url;
  if (row.profileUrl) return row.profileUrl;
  if (row.outreachHandle?.profile_url) return row.outreachHandle.profile_url;
  const ph = row.platform_handles || row.platformHandles;
  if (ph) {
    const primary = ph.primary_platform || ph.primaryPlatform;
    const byPlatform = ph.by_platform || ph.byPlatform || {};
    if (primary && byPlatform[primary]?.profile_url) return byPlatform[primary].profile_url;
    const withUrl = Object.values(byPlatform).find((d) => d?.profile_url);
    if (withUrl) return withUrl.profile_url;
  }
  return null;
}

// Renders an author name as a link to their platform profile when the backend
// provides one, otherwise as plain text.
function AuthorName({ row, name }) {
  const label = name || '—';
  const url = resolveProfileUrl(row);
  if (!url) return <span className="font-medium text-foreground">{label}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary hover:underline"
    >
      {label}
    </a>
  );
}

// Column keys that hold an author's name across the lookalikes result set.
const AUTHOR_COLUMN_KEYS = new Set([
  'author', 'authorName', 'author_name', 'name',
  'global_user_id', 'globalUserId', 'user', 'username', 'handle',
]);

function ViralSeedsTable({ data }) {
  const baseRows = Array.isArray(data) ? data : [];
  const { rows, sortState, requestSort } = useSortableRows(baseRows, null, {
    platform: (r) => r.primaryPlatform || r.outreachHandle?.platform,
    reach: (r) => getDominantReach(r.reachSignals).value,
  });
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.min(Math.ceil(rows.length / perPage), 5);
  const pageRows = rows.slice(page * perPage, (page + 1) * perPage);
  const sp = (sortKey) => ({ sortKey, sortState, onSort: requestSort });
  if (rows.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <SortableHeader label="#" />
            <SortableHeader label="Author" {...sp('author')} />
            <SortableHeader label="Seed Score" {...sp('seedScore')} />
            <SortableHeader label="Platform" {...sp('platform')} />
            <SortableHeader label="Tribe" {...sp('tribe')} />
            <SortableHeader label="Reach" {...sp('reach')} />
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, i) => {
            const reach = getDominantReach(row.reachSignals);
            return (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-2 px-3 text-foreground font-mono">{row.rank ?? page * perPage + i + 1}</td>
                <td className="py-2 px-3"><AuthorName row={row} name={row.author} /></td>
                <td className="py-2 px-3"><ScoreBar value={row.seedScore} /></td>
                <td className="py-2 px-3"><PlatformBadge platform={row.primaryPlatform || row.outreachHandle?.platform} /></td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px] font-medium">{row.tribe || '—'}</span></td>
                <td className="py-2 px-3 text-foreground">{reach.label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, rows.length)} of {Math.min(rows.length, perPage * 5)}</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded text-xs font-medium ${page === i ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground hover:bg-accent/80'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopSpreadersTable({ data }) {
  // Hide authors whose sentiment is 0 (or missing) — they add noise without signal.
  const filtered = (Array.isArray(data) ? data : []).filter(
    (row) => (row.average_sentiment_score ?? 0) !== 0,
  );
  const { rows, sortState, requestSort } = useSortableRows(filtered, null);
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.min(Math.ceil(rows.length / perPage), 5);
  const pageRows = rows.slice(page * perPage, (page + 1) * perPage);
  const sp = (sortKey, align) => ({ sortKey, sortState, onSort: requestSort, align });
  if (rows.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <SortableHeader label="#" />
            <SortableHeader label="Author" {...sp('author')} />
            <SortableHeader label="Viral Score" {...sp('viral_potential_score')} />
            <SortableHeader label="Views" {...sp('total_views', 'right')} />
            <SortableHeader label="Likes" {...sp('total_likes', 'right')} />
            <SortableHeader label="Comments" {...sp('total_comments', 'right')} />
            <SortableHeader label="Eng. Rate" {...sp('engagement_rate')} />
            <SortableHeader label="Sentiment" {...sp('average_sentiment_score')} />
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
              <td className="py-2 px-3 text-foreground font-mono">{page * perPage + i + 1}</td>
              <td className="py-2 px-3"><AuthorName row={row} name={row.author} /></td>
              <td className="py-2 px-3 font-mono text-foreground">{fmt(row.viral_potential_score, 1)}</td>
              <td className="py-2 px-3 text-right text-foreground font-mono">{row.total_views?.toLocaleString() ?? '—'}</td>
              <td className="py-2 px-3 text-right text-foreground font-mono">{row.total_likes?.toLocaleString() ?? '—'}</td>
              <td className="py-2 px-3 text-right text-foreground font-mono">{row.total_comments?.toLocaleString() ?? '—'}</td>
              <td className="py-2 px-3"><ScoreBar value={row.engagement_rate} max={1} color="bg-cyan-400" /></td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  (row.average_sentiment_score ?? 0) >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                  (row.average_sentiment_score ?? 0) >= 40 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {fmt(row.average_sentiment_score, 1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, rows.length)} of {Math.min(rows.length, perPage * 5)}</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded text-xs font-medium ${page === i ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground hover:bg-accent/80'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformHandlesCell({ value }) {
  const primary = value.primary_platform || value.primaryPlatform || '';
  const byPlatform = value.by_platform || value.byPlatform || {};
  const platforms = Object.entries(byPlatform);
  if (platforms.length === 0) {
    return <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">{primary || '—'}</span>;
  }
  return (
    <div className="space-y-1">
      {platforms.map(([platform, details]) => (
        <div key={platform} className="flex flex-wrap items-center gap-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${platform === primary ? 'bg-blue-500/20 text-blue-400' : 'bg-accent text-foreground'}`}>
            {platform}
          </span>
          {details?.profile_url && (
            <a href={details.profile_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline truncate max-w-[120px]">
              {details.profile_url.replace(/https?:\/\/(www\.)?/, '').split('/').pop()}
            </a>
          )}
          {details?.post_count != null && (
            <span className="text-[10px] text-muted-foreground">{details.post_count} posts</span>
          )}
          {details?.total_views != null && (
            <span className="text-[10px] text-muted-foreground">{Number(details.total_views).toLocaleString()} views</span>
          )}
        </div>
      ))}
    </div>
  );
}

function LookalikeCellValue({ value, columnKey, row }) {
  if (value == null) return '—';
  // The author column links to the author's platform profile when available.
  if (AUTHOR_COLUMN_KEYS.has(columnKey) && typeof value !== 'object') {
    return <AuthorName row={row} name={String(value)} />;
  }
  if (typeof value !== 'object') return String(value);
  if (columnKey === 'platform_handles' || columnKey === 'platformHandles') {
    return <PlatformHandlesCell value={value} />;
  }
  const entries = Object.entries(value);
  if (entries.length <= 4) {
    return (
      <div className="flex flex-wrap gap-1">
        {entries.map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent text-[10px]">
            <span className="text-muted-foreground">{k}:</span>
            <span className="text-foreground">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
          </span>
        ))}
      </div>
    );
  }
  return <span className="text-[10px] text-muted-foreground">{JSON.stringify(value)}</span>;
}

function LookalikesDisplay({ data }) {
  const arr = Array.isArray(data) ? data : [];
  const { rows, sortState, requestSort } = useSortableRows(arr, null);
  const [page, setPage] = useState(0);
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No lookalikes found</p>;
    if (typeof data[0] === 'object') {
      const HIDDEN_COLS = ['moi_score', 'similarity_score', 'topic_sim', 'sentiment_sim', 'moi_sim'];
      const cols = Object.keys(data[0]).filter((c) => !HIDDEN_COLS.includes(c)).slice(0, 8);
      // Only allow sorting on columns whose values are scalars — object columns
      // (e.g. platform_handles) have no meaningful sort order.
      const sortableCols = new Set(cols.filter((c) => typeof data[0][c] !== 'object' || data[0][c] === null));
      const sp = (c) => (sortableCols.has(c) ? { sortKey: c, sortState, onSort: requestSort } : {});
      const perPage = 10;
      const totalPages = Math.min(Math.ceil(rows.length / perPage), 5);
      const pageRows = rows.slice(page * perPage, (page + 1) * perPage);
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {cols.map((c) => <SortableHeader key={c} label={c} {...sp(c)} />)}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                  {cols.map((c) => (
                    <td key={c} className="py-2 px-3 text-foreground">
                      <LookalikeCellValue value={row[c]} columnKey={c} row={row} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, data.length)} of {Math.min(data.length, perPage * 5)}</p>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded text-xs font-medium ${page === i ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground hover:bg-accent/80'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return <ul className="mt-3 space-y-1">{data.map((item, i) => <li key={i} className="text-xs text-foreground">{String(item)}</li>)}</ul>;
  }
  if (typeof data === 'object') return <div className="mt-3"><KeyValueCards data={data} /></div>;
  return null;
}

// Spreader data is stable for a given entity/keyword, so cache it indefinitely:
// a request only fires for a new query key (new entity or a newly typed keyword).
// The React Query cache lives at the app root and survives this view unmounting,
// so navigating back to the section shows cached data instead of refetching.
const SPREADER_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
  retry: false,
};

export default function SpreaderAnalysisView({ selectedEntity }) {
  const entityId = selectedEntity?.id ?? null;

  // A typed keyword overrides the entity-aggregated data for that section.
  const [viralKeyword, setViralKeyword] = useState(null);
  const [spreaderKeyword, setSpreaderKeyword] = useState(null);
  const [seedId, setSeedId] = useState(null);

  // Reset keyword overrides when a different entity is selected so its
  // aggregated data shows by default.
  useEffect(() => {
    setViralKeyword(null);
    setSpreaderKeyword(null);
    setSeedId(null);
  }, [entityId]);

  const viralSeedsQuery = useQuery({
    queryKey: viralKeyword
      ? ['spreader', 'viralSeeds', 'keyword', viralKeyword]
      : ['spreader', 'viralSeeds', 'entity', entityId],
    queryFn: () => (viralKeyword
      ? auraMathService.getViralSeeds(viralKeyword)
      : marketingAggregationService.getViralSeeds({ entityId })),
    enabled: Boolean(viralKeyword || entityId),
    ...SPREADER_QUERY_OPTIONS,
  });

  const topSpreadersQuery = useQuery({
    queryKey: spreaderKeyword
      ? ['spreader', 'topSpreaders', 'keyword', spreaderKeyword]
      : ['spreader', 'topSpreaders', 'entity', entityId],
    queryFn: () => (spreaderKeyword
      ? auraMathService.getTopSpreaders(spreaderKeyword)
      : marketingAggregationService.getTopSpreaders({ entityId })),
    enabled: Boolean(spreaderKeyword || entityId),
    ...SPREADER_QUERY_OPTIONS,
  });

  const lookalikesQuery = useQuery({
    queryKey: ['spreader', 'lookalikes', seedId],
    queryFn: () => auraMathService.findLookalikes(seedId),
    enabled: Boolean(seedId),
    ...SPREADER_QUERY_OPTIONS,
  });

  const showEntityBanner = Boolean(
    selectedEntity && !viralKeyword && !spreaderKeyword
    && (viralSeedsQuery.data || topSpreadersQuery.data),
  );
  const autoLoadError = (!viralKeyword && viralSeedsQuery.error)
    || (!spreaderKeyword && topSpreadersQuery.error);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-7 h-7 text-amber-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Spreader Analysis</h2>
            <p className="text-sm text-muted-foreground">Find viral seeds, top spreaders, and lookalike audiences</p>
          </div>
        </div>

        {showEntityBanner && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-xs text-primary">
              Showing aggregated data for <span className="font-semibold">{selectedEntity.name}</span>. Use the search fields below to look up a different keyword.
            </p>
          </div>
        )}

        {autoLoadError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <Info className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{autoLoadError.message || 'Failed to load aggregated data'}</p>
          </div>
        )}

        <Section icon={Zap} title="Viral Seeds" subtitle="Early adopters whose activity signals the start of a viral cascade" color="text-amber-400">
          <KeywordSearch
            label="Search by keyword to override..."
            loading={viralSeedsQuery.isFetching}
            onSearch={(kw) => setViralKeyword(kw)}
          />
          <ViralSeedsTable data={viralSeedsQuery.data} />
        </Section>

        <Section icon={Network} title="Top Spreaders" subtitle="High-reach individuals who amplify content to the widest audiences" color="text-purple-400">
          <KeywordSearch
            label="Search by keyword to override..."
            loading={topSpreadersQuery.isFetching}
            onSearch={(kw) => setSpreaderKeyword(kw)}
          />
          <TopSpreadersTable data={topSpreadersQuery.data} />
        </Section>

        <Section icon={Users} title="Find Lookalikes" subtitle="Discover new audiences that behave like your best-performing seed authors" color="text-emerald-400">
          <KeywordSearch
            label="Enter seed author ID..."
            loading={lookalikesQuery.isFetching}
            onSearch={(id) => setSeedId(id)}
          />
          <LookalikesDisplay data={lookalikesQuery.data} />
        </Section>
      </div>
    </div>
  );
}
