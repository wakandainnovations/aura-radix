import React, { useState, useCallback } from 'react';
import { Zap, Network, Users } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
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

function LookalikesDisplay({ data }) {
  const [page, setPage] = useState(0);
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No lookalikes found</p>;
    if (typeof data[0] === 'object') {
      const cols = Object.keys(data[0]).slice(0, 8);
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
                      {typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : String(row[c] ?? '—')}
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

export default function SpreaderAnalysisView() {
  const [viralSeeds, setViralSeeds] = useState(null);
  const [topSpreaders, setTopSpreaders] = useState(null);
  const [lookalikes, setLookalikes] = useState(null);
  const [loading, setLoading] = useState({});

  const withLoading = useCallback(async (key, fn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      return await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

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

        <Section icon={Zap} title="Viral Seeds" color="text-amber-400">
          <KeywordSearch
            label="Enter keyword to find viral seeds..."
            loading={loading.viralSeeds}
            onSearch={(kw) => withLoading('viralSeeds', () => auraMathService.getViralSeeds(kw).then(setViralSeeds))}
          />
          <ViralSeedsTable data={viralSeeds} />
        </Section>

        <Section icon={Network} title="Top Spreaders" color="text-purple-400">
          <KeywordSearch
            label="Enter keyword to find top spreaders..."
            loading={loading.topSpreaders}
            onSearch={(kw) => withLoading('topSpreaders', () => auraMathService.getTopSpreaders(kw).then(setTopSpreaders))}
          />
          <TopSpreadersTable data={topSpreaders} />
        </Section>

        <Section icon={Users} title="Find Lookalikes" color="text-emerald-400">
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
