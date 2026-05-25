import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Zap, Network, Users, Info } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import { marketingAggregationService } from '../../api/marketingAggregationService';
import {
  PlatformBadge, ScoreBar, getDominantReach, fmt,
  Section, KeywordSearch, KeyValueCards,
} from './audienceIntelShared';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

function ViralSeedsTable({ data }) {
  const rows = Array.isArray(data) ? data : [];
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.min(Math.ceil(rows.length / perPage), 5);
  const pageRows = rows.slice(page * perPage, (page + 1) * perPage);
  if (rows.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Seed Score</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tribe</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reach</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Link</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, i) => {
            const reach = getDominantReach(row.reachSignals);
            const profileUrl = row.outreachHandle?.profile_url;
            return (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-2 px-3 text-foreground font-mono">{row.rank ?? page * perPage + i + 1}</td>
                <td className="py-2 px-3 text-foreground font-medium">{row.author || '—'}</td>
                <td className="py-2 px-3"><ScoreBar value={row.seedScore} /></td>
                <td className="py-2 px-3"><PlatformBadge platform={row.primaryPlatform || row.outreachHandle?.platform} /></td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px] font-medium">{row.tribe || '—'}</span></td>
                <td className="py-2 px-3 text-foreground">{reach.label}</td>
                <td className="py-2 px-3">
                  {profileUrl ? (
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  ) : '—'}
                </td>
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
  const rows = Array.isArray(data) ? data : [];
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.min(Math.ceil(rows.length / perPage), 5);
  const pageRows = rows.slice(page * perPage, (page + 1) * perPage);
  if (rows.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Viral Score</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium">Views</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium">Likes</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium">Comments</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Eng. Rate</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
              <td className="py-2 px-3 text-foreground font-mono">{page * perPage + i + 1}</td>
              <td className="py-2 px-3 text-foreground font-medium">{row.author || '—'}</td>
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

function LookalikeCellValue({ value, columnKey }) {
  if (value == null) return '—';
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
  const [page, setPage] = useState(0);
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No lookalikes found</p>;
    if (typeof data[0] === 'object') {
      const cols = Object.keys(data[0]).filter((c) => c !== 'moi_score').slice(0, 8);
      const perPage = 10;
      const totalPages = Math.min(Math.ceil(data.length / perPage), 5);
      const pageRows = data.slice(page * perPage, (page + 1) * perPage);
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {cols.map((c) => <th key={c} className="text-left py-2 px-3 text-muted-foreground font-medium">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                  {cols.map((c) => (
                    <td key={c} className="py-2 px-3 text-foreground">
                      <LookalikeCellValue value={row[c]} columnKey={c} />
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

export default function SpreaderAnalysisView({ selectedEntity }) {
  const [viralSeeds, setViralSeeds] = useState(null);
  const [topSpreaders, setTopSpreaders] = useState(null);
  const [lookalikes, setLookalikes] = useState(null);
  const [loading, setLoading] = useState({});
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [autoLoadError, setAutoLoadError] = useState(null);
  const lastLoadedEntityRef = useRef(null);

  const withLoading = useCallback(async (key, fn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      return await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const autoLoadForEntity = useCallback(async (entity) => {
    const filters = { entityId: entity.id };
    setLoading({ viralSeeds: true, topSpreaders: true });
    setAutoLoaded(false);
    setAutoLoadError(null);
    try {
      const [seeds, spreaders] = await Promise.all([
        marketingAggregationService.getViralSeeds(filters),
        marketingAggregationService.getTopSpreaders(filters),
      ]);
      setViralSeeds(seeds);
      setTopSpreaders(spreaders);
      setAutoLoaded(true);
    } catch (err) {
      setAutoLoadError(err?.message || 'Failed to load aggregated data');
    } finally {
      setLoading({});
    }
  }, []);

  useEffect(() => {
    if (!selectedEntity) return;
    if (lastLoadedEntityRef.current === selectedEntity.id) return;
    lastLoadedEntityRef.current = selectedEntity.id;
    autoLoadForEntity(selectedEntity);
  }, [selectedEntity, autoLoadForEntity]);

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

        {selectedEntity && autoLoaded && (
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
            <p className="text-xs text-red-400">{autoLoadError}</p>
          </div>
        )}

        <Section icon={Zap} title="Viral Seeds" subtitle="Early adopters whose activity signals the start of a viral cascade" color="text-amber-400">
          <KeywordSearch
            label="Search by keyword to override..."
            loading={loading.viralSeeds}
            onSearch={(kw) => {
              setAutoLoaded(false);
              setAutoLoadError(null);
              withLoading('viralSeeds', () => auraMathService.getViralSeeds(kw).then(setViralSeeds));
            }}
          />
          <ViralSeedsTable data={viralSeeds} />
        </Section>

        <Section icon={Network} title="Top Spreaders" subtitle="High-reach individuals who amplify content to the widest audiences" color="text-purple-400">
          <KeywordSearch
            label="Search by keyword to override..."
            loading={loading.topSpreaders}
            onSearch={(kw) => {
              setAutoLoaded(false);
              setAutoLoadError(null);
              withLoading('topSpreaders', () => auraMathService.getTopSpreaders(kw).then(setTopSpreaders));
            }}
          />
          <TopSpreadersTable data={topSpreaders} />
        </Section>

        <Section icon={Users} title="Find Lookalikes" subtitle="Discover new audiences that behave like your best-performing seed authors" color="text-emerald-400">
          <KeywordSearch
            label="Enter seed author ID..."
            loading={loading.lookalikes}
            onSearch={(id) => withLoading('lookalikes', () => auraMathService.findLookalikes(id).then(setLookalikes))}
          />
          <LookalikesDisplay data={lookalikes} />
        </Section>
      </div>
    </div>
  );
}
