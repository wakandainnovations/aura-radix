import React, { useState, useCallback } from 'react';
import {
  Search, Users, Target, Zap, Network, Loader2,
  ChevronDown, ChevronUp, User, Filter, ExternalLink,
  ThumbsUp, ThumbsDown, Minus, Tag
} from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';

const PLATFORM_COLORS = {
  x: 'bg-blue-500/20 text-blue-400',
  twitter: 'bg-blue-500/20 text-blue-400',
  reddit: 'bg-orange-500/20 text-orange-400',
  youtube: 'bg-red-500/20 text-red-400',
  instagram: 'bg-pink-500/20 text-pink-400',
};

const TONE_CONFIG = {
  positive: { cls: 'text-emerald-400', icon: ThumbsUp },
  negative: { cls: 'text-red-400', icon: ThumbsDown },
  neutral: { cls: 'text-gray-400', icon: Minus },
};

const TIER_COLORS = {
  'Viral Node': 'bg-amber-500/20 text-amber-400',
  'Amplifier': 'bg-purple-500/20 text-purple-400',
  'Participant': 'bg-blue-500/20 text-blue-400',
  'Observer': 'bg-slate-500/20 text-slate-400',
  'Micro-Influencer': 'bg-cyan-500/20 text-cyan-400',
};

const CLASSIFICATION_COLORS = {
  'Brand Evangelist': 'bg-emerald-500/20 text-emerald-400',
  'Active Critic': 'bg-red-500/20 text-red-400',
  'Critical Power Influencer': 'bg-orange-500/20 text-orange-400',
  'Neutral Informer': 'bg-slate-500/20 text-slate-400',
  'Positive Engager': 'bg-cyan-500/20 text-cyan-400',
  'Casual Engager': 'bg-blue-500/20 text-blue-400',
  'Silent Observer': 'bg-gray-500/20 text-gray-400',
};

function fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  if (typeof n !== 'number') return String(n);
  if (Math.abs(n) < 0.01 && n !== 0) return n.toFixed(Math.max(decimals, 3));
  return n.toFixed(decimals);
}

function PlatformBadge({ platform }) {
  const p = (platform || '').toLowerCase();
  const cls = PLATFORM_COLORS[p] || 'bg-gray-500/20 text-gray-400';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${cls}`}>{platform || '—'}</span>;
}

function ColoredBadge({ value, colorMap }) {
  const cls = colorMap[value] || 'bg-gray-500/20 text-gray-400';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${cls}`}>{value || '—'}</span>;
}

function ScoreBar({ value, max = 2, color = 'bg-amber-400' }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono w-12 text-right">{fmt(value)}</span>
      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden max-w-[80px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function getDominantReach(signals) {
  if (!signals) return { label: '—', value: 0 };
  const entries = Object.entries(signals).filter(([, v]) => v > 0);
  if (entries.length === 0) return { label: '—', value: 0 };
  entries.sort((a, b) => b[1] - a[1]);
  const [key, val] = entries[0];
  const label = key.replace(/_count$/, '').replace(/_/g, ' ').replace(/^(x|instagram|reddit|youtube)\s*/i, '');
  return { label: `${val.toLocaleString()} ${label}`, value: val };
}

function SmallJsonFallback({ data }) {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;
  const json = JSON.stringify(data, null, 2);
  const isLong = json.length > 400;
  return (
    <div className="mt-2">
      <pre className="bg-background border border-border rounded-lg p-3 text-xs text-foreground overflow-x-auto max-h-60 overflow-y-auto">
        {isLong && !expanded ? json.slice(0, 400) + '\n...' : json}
      </pre>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary mt-1">
          {expanded ? 'Show less' : 'Show all'}
        </button>
      )}
    </div>
  );
}

function KeyValueCards({ data, depth = 0 }) {
  if (!data || typeof data !== 'object') return <span className="text-xs text-foreground">{String(data ?? '—')}</span>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-xs text-muted-foreground">Empty list</span>;
    if (typeof data[0] !== 'object') {
      return (
        <ul className="list-disc list-inside text-xs text-foreground space-y-0.5">
          {data.map((item, i) => <li key={i}>{String(item)}</li>)}
        </ul>
      );
    }
    if (data.length <= 20) {
      const cols = Object.keys(data[0]).slice(0, 8);
      return (
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {cols.map((c) => <th key={c} className="text-left py-1.5 px-2 text-muted-foreground font-medium">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                  {cols.map((c) => (
                    <td key={c} className="py-1.5 px-2 text-foreground">
                      {typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : String(row[c] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <SmallJsonFallback data={data} />;
  }
  const entries = Object.entries(data);
  if (depth > 2) return <SmallJsonFallback data={data} />;
  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-3 pl-3 border-l border-border/50' : ''}`}>
      {entries.map(([key, val]) => (
        <div key={key}>
          <span className="text-xs font-medium text-muted-foreground">{key}</span>
          {typeof val === 'object' && val !== null ? (
            <div className="mt-1"><KeyValueCards data={val} depth={depth + 1} /></div>
          ) : (
            <span className="text-xs text-foreground ml-2">{String(val ?? '—')}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CollapsibleKV({ title, data }) {
  const [open, setOpen] = useState(false);
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return null;
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden mt-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors">
        <span className="text-xs font-medium text-foreground">{title}</span>
        {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 py-2 border-t border-border/50"><KeyValueCards data={data} /></div>}
    </div>
  );
}

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
                      <ExternalLink className="w-3 h-3" />
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

function AspectDriversDisplay({ data }) {
  if (!data) return null;
  const platforms = data.totalPostsAnalyzed || {};
  const platformEntries = Object.entries(platforms).filter(([k]) => k !== 'total');
  return (
    <div className="mt-3 space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="bg-background border border-border rounded-lg px-4 py-3 text-center">
          <p className="text-lg font-bold text-foreground">{(platforms.total ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Posts</p>
        </div>
        {platformEntries.map(([plat, count]) => (
          <div key={plat} className="bg-background border border-border rounded-lg px-4 py-3 text-center">
            <p className="text-lg font-bold text-foreground">{(count ?? 0).toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-wider"><PlatformBadge platform={plat} /></p>
          </div>
        ))}
      </div>
      {data.keyword && (
        <p className="text-xs text-muted-foreground">Keyword: <span className="text-foreground font-medium">{data.keyword}</span></p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.strengths && data.strengths.length > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Strengths</p>
            <ul className="space-y-1">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-xs text-emerald-300/80">
                  {typeof s === 'object' ? (
                    <span><span className="font-medium">{s.aspect}</span> — sentiment {s.averageSentiment?.toFixed(1)}, {s.postsMentioning} posts, impact {s.impactScore?.toFixed(1)}</span>
                  ) : s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.weaknesses && data.weaknesses.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Weaknesses</p>
            <ul className="space-y-1">
              {data.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-red-300/80">
                  {typeof w === 'object' ? (
                    <span><span className="font-medium">{w.aspect}</span> — sentiment {w.averageSentiment?.toFixed(1)}, {w.postsMentioning} posts, impact {w.impactScore?.toFixed(1)}</span>
                  ) : w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {data.byPlatform && Object.keys(data.byPlatform).length > 0 && (
        <CollapsibleKV title="Per-Platform Breakdown" data={data.byPlatform} />
      )}
    </div>
  );
}

function ObjectCellDisplay({ value, columnKey }) {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded bg-accent text-[10px] text-foreground">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </span>
        ))}
      </div>
    );
  }
  if (columnKey === 'platform_handles' || columnKey === 'platformHandles') {
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
                  {cols.map((c) => {
                    let cellValue = row[c];
                    let isObject = typeof cellValue === 'object' && cellValue !== null;
                    if (!isObject && typeof cellValue === 'string' && (cellValue.startsWith('{') || cellValue.startsWith('['))) {
                      try { cellValue = JSON.parse(cellValue); isObject = true; } catch (_) {}
                    }
                    return (
                      <td key={c} className="py-2 px-3 text-foreground">
                        {isObject
                          ? <ObjectCellDisplay value={cellValue} columnKey={c} />
                          : String(row[c] ?? '—')}
                      </td>
                    );
                  })}
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
  return <SmallJsonFallback data={data} />;
}

function UsersDisplay({ data }) {
  if (!data) return null;
  const usersList = data.users || (Array.isArray(data) ? data : []);
  const totalUsers = data.totalUsers ?? usersList.length;
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-4">
        <div className="bg-background border border-border rounded-lg px-4 py-2">
          <span className="text-lg font-bold text-foreground">{totalUsers.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground ml-2">total users</span>
        </div>
        {data.filtersApplied && Object.keys(data.filtersApplied).length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="w-3 h-3" />
            {Object.entries(data.filtersApplied).map(([k, v]) => (
              <span key={k} className="px-1.5 py-0.5 bg-accent rounded text-[10px]">{k}: {v}</span>
            ))}
          </div>
        )}
      </div>
      {usersList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Classification</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Posting Style</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tone</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Posts</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Branch Ratio</th>
              </tr>
            </thead>
            <tbody>
              {usersList.slice(0, 50).map((u, i) => {
                const tone = TONE_CONFIG[u.dominant_tone] || TONE_CONFIG.neutral;
                const ToneIcon = tone.icon;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-2 px-3 text-foreground font-medium">{u.author || '—'}</td>
                    <td className="py-2 px-3"><ColoredBadge value={u.audience_classification} colorMap={CLASSIFICATION_COLORS} /></td>
                    <td className="py-2 px-3"><ColoredBadge value={u.influence_tier} colorMap={TIER_COLORS} /></td>
                    <td className="py-2 px-3 text-foreground">{u.posting_style || '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 ${tone.cls}`}>
                        <ToneIcon className="w-3 h-3" />
                        {u.dominant_tone || '—'}
                      </span>
                    </td>
                    <td className="py-2 px-3"><PlatformBadge platform={u.primary_platform} /></td>
                    <td className="py-2 px-3 text-foreground font-mono">{u.total_posts ?? '—'}</td>
                    <td className="py-2 px-3 text-foreground font-mono">{fmt(u.branching_ratio)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {usersList.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {usersList.length}</p>}
        </div>
      )}
    </div>
  );
}

function CategoriesDisplay({ data }) {
  if (!data) return null;
  const groups = Object.entries(data);
  if (groups.length === 0) return <p className="text-xs text-muted-foreground mt-3">No categories</p>;
  const groupColors = {
    audience_classification: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    influence_tier: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    posting_style: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dominant_tone: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    primary_platform: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return (
    <div className="mt-3 space-y-4">
      {groups.map(([group, values]) => (
        <div key={group}>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {group.replace(/_/g, ' ')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(values) ? values : [values]).map((v, i) => (
              <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${groupColors[group] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {String(v)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GenreViewersSpreadersTable({ data, type }) {
  if (!data) return null;
  const isSpreaders = type === 'spreaders';
  const rows = isSpreaders ? (data.spreaders || []) : (data.viewers || []);
  const total = isSpreaders ? data.totalSpreaders : data.totalViewers;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-3">
        {data.genre && <span className="text-xs text-muted-foreground">Genre: <span className="text-foreground font-medium">{data.genre}</span></span>}
        {data.threshold !== undefined && <span className="text-xs text-muted-foreground">Threshold: <span className="text-foreground font-mono">{data.threshold}</span></span>}
        <span className="text-xs bg-background border border-border rounded px-2 py-0.5 text-foreground font-medium">{(total ?? rows.length).toLocaleString()} {isSpreaders ? 'spreaders' : 'viewers'}</span>
      </div>
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">User ID</th>
                <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Tribe</th>
                <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Platform</th>
                <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">{isSpreaders ? 'Hawkes Alpha' : 'Interest Score'}</th>
                <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">MOI</th>
                <th className="text-left py-1.5 px-2 text-muted-foreground font-medium">Peak Activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 30).map((r, i) => {
                const primaryPlat = r.platform_handles?.primary_platform || '';
                const peakTimes = r.peak_activity_times || {};
                const peakLabel = ['morning', 'afternoon', 'evening', 'night']
                  .filter((t) => (peakTimes[t] || 0) > 0)
                  .map((t) => `${t} ${fmt(peakTimes[t])}`)
                  .join(', ') || '—';
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-1.5 px-2 text-foreground font-mono text-[10px]">{r.global_user_id || '—'}</td>
                    <td className="py-1.5 px-2"><span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]">{r.tribe_label || '—'}</span></td>
                    <td className="py-1.5 px-2"><PlatformBadge platform={primaryPlat} /></td>
                    <td className="py-1.5 px-2 text-foreground font-mono">{fmt(isSpreaders ? r.hawkes_alpha : r.genre_interest_score, 4)}</td>
                    <td className="py-1.5 px-2 text-foreground font-mono">{fmt(r.moi_score, 4)}</td>
                    <td className="py-1.5 px-2 text-foreground text-[10px]">{peakLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > 30 && <p className="text-xs text-muted-foreground mt-1">Showing 30 of {rows.length}</p>}
        </div>
      )}
    </div>
  );
}

function GenreStrategyDisplay({ data }) {
  if (!data) return null;
  const channels = data.channels || [];
  const maxStrength = Math.max(...channels.map((c) => c.relative_strength || 0), 1);
  return (
    <div className="mt-2 space-y-3">
      {data.headline && <p className="text-sm font-medium text-foreground">{data.headline}</p>}
      <div className="flex flex-wrap gap-3">
        {data.audienceSize !== undefined && (
          <div className="bg-background border border-border rounded-lg px-3 py-2 text-center">
            <p className="text-sm font-bold text-foreground">{data.audienceSize.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Audience</p>
          </div>
        )}
        {data.topChannel && (
          <div className="bg-background border border-border rounded-lg px-3 py-2 text-center">
            <PlatformBadge platform={data.topChannel} />
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Top Channel</p>
          </div>
        )}
        {data.genre && (
          <div className="bg-background border border-border rounded-lg px-3 py-2 text-center">
            <p className="text-sm font-bold text-foreground">{data.genre}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Genre</p>
          </div>
        )}
      </div>
      {channels.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Channel Strength</p>
          {channels.map((ch, i) => {
            const pct = ((ch.relative_strength || 0) / maxStrength) * 100;
            const barColor = PLATFORM_COLORS[ch.platform?.toLowerCase()]?.replace('bg-', '').replace('/20', '') || 'gray-400';
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20"><PlatformBadge platform={ch.platform} /></div>
                <div className="flex-1 h-5 bg-background rounded overflow-hidden relative">
                  <div className={`h-full rounded ${PLATFORM_COLORS[ch.platform?.toLowerCase()]?.split(' ')[0] || 'bg-gray-500/20'}`} style={{ width: `${pct}%` }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] text-foreground font-mono">{fmt(ch.relative_strength)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground w-20 text-right">{ch.reach?.toLocaleString() ?? '—'} reach / {ch.postCount ?? '—'} posts</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TargetsDisplay({ data }) {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No targets found</p>;
    const cols = Object.keys(data[0]).slice(0, 10);
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {cols.map((c) => <th key={c} className="text-left py-2 px-3 text-muted-foreground font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 50).map((row, i) => (
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
        {data.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {data.length}</p>}
      </div>
    );
  }
  return <div className="mt-3"><KeyValueCards data={data} /></div>;
}

function DiagnosticsDisplay({ data }) {
  if (!data) return null;
  return <div className="mt-2"><CollapsibleKV title="Details" data={data} /></div>;
}

function Section({ icon: Icon, title, subtitle, color, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 hover:bg-accent/20 transition-colors"
      >
        <Icon className={`w-5 h-5 ${color}`} />
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 pt-0 border-t border-border">{children}</div>}
    </div>
  );
}

function KeywordSearch({ label, onSearch, loading }) {
  const [keyword, setKeyword] = useState('');
  return (
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && keyword.trim() && onSearch(keyword.trim())}
        placeholder={label}
        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        onClick={() => keyword.trim() && onSearch(keyword.trim())}
        disabled={loading || !keyword.trim()}
        className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Search
      </button>
    </div>
  );
}

export default function AudienceIntelView() {
  const [viralSeeds, setViralSeeds] = useState(null);
  const [aspectDrivers, setAspectDrivers] = useState(null);
  const [topSpreaders, setTopSpreaders] = useState(null);
  const [lookalikes, setLookalikes] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [users, setUsers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [genreViewers, setGenreViewers] = useState(null);
  const [genreSpreaders, setGenreSpreaders] = useState(null);
  const [genreStrategy, setGenreStrategy] = useState(null);
  const [targets, setTargets] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState({});
  const [userFilters, setUserFilters] = useState({});
  const [targetFilters, setTargetFilters] = useState({});
  const [syncStatus, setSyncStatus] = useState(null);

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
          <Target className="w-7 h-7 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Audience Intelligence</h2>
            <p className="text-sm text-muted-foreground">AuraMath-powered spreader analysis, targeting, and user insights</p>
          </div>
        </div>

        <Section icon={Zap} title="Viral Seeds" subtitle="Early adopters whose activity signals the start of a viral cascade" color="text-amber-400">
          <KeywordSearch
            label="Enter keyword to find viral seeds..."
            loading={loading.viralSeeds}
            onSearch={(kw) => withLoading('viralSeeds', () => auraMathService.getViralSeeds(kw).then(setViralSeeds))}
          />
          <ViralSeedsTable data={viralSeeds} />
        </Section>

        <Section icon={Search} title="Aspect Drivers" subtitle="Strengths and weaknesses driving audience sentiment across platforms" color="text-blue-400">
          <KeywordSearch
            label="Enter keyword for aspect drivers..."
            loading={loading.aspectDrivers}
            onSearch={(kw) => withLoading('aspectDrivers', () => auraMathService.getAspectDrivers(kw).then(setAspectDrivers))}
          />
          <AspectDriversDisplay data={aspectDrivers} />
        </Section>

        <Section icon={Network} title="Top Spreaders" subtitle="High-reach individuals who amplify content to the widest audiences" color="text-purple-400">
          <KeywordSearch
            label="Enter keyword to find top spreaders..."
            loading={loading.topSpreaders}
            onSearch={(kw) => withLoading('topSpreaders', () => auraMathService.getTopSpreaders(kw).then(setTopSpreaders))}
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

        <Section icon={User} title="User Lookup" subtitle="Search for a specific user's profile or detailed influence report" color="text-sky-400">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Profile by Global User ID</p>
              <KeywordSearch
                label="Global user ID..."
                loading={loading.userProfile}
                onSearch={(id) => withLoading('userProfile', () => auraMathService.getUserProfile(id).then(setUserProfile))}
              />
              {userProfile && <div className="mt-3"><KeyValueCards data={userProfile} /></div>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Report by Author</p>
              <KeywordSearch
                label="Author name..."
                loading={loading.userReport}
                onSearch={(a) => withLoading('userReport', () => auraMathService.getUserReport(a).then(setUserReport))}
              />
              {userReport && <div className="mt-3"><KeyValueCards data={userReport} /></div>}
            </div>
          </div>
        </Section>

        <Section icon={Users} title="User Directory" subtitle="Browse and filter all tracked users by classification, tier, tone, or platform" color="text-indigo-400">
          <div className="flex flex-wrap gap-2 mt-3">
            {['audienceClassification', 'influenceTier', 'postingStyle', 'dominantTone', 'primaryPlatform'].map((f) => (
              <input
                key={f}
                type="text"
                value={userFilters[f] || ''}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, [f]: e.target.value }))}
                placeholder={f}
                className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-36 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ))}
            <button
              onClick={() => withLoading('users', () => auraMathService.listUsers(userFilters).then(setUsers))}
              disabled={loading.users}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.users ? <Loader2 className="w-3 h-3 animate-spin" /> : <Filter className="w-3 h-3" />}
              Search
            </button>
          </div>
          <UsersDisplay data={users} />

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => withLoading('categories', () => auraMathService.getUserCategories().then(setCategories))}
              disabled={loading.categories}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent text-foreground hover:bg-accent/80 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.categories ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Load Categories
            </button>
            <button
              onClick={() => withLoading('sync', () => auraMathService.syncUsers().then(() => setSyncStatus('Sync triggered')))}
              disabled={loading.sync}
              className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.sync ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Trigger User Sync
            </button>
            {syncStatus && <span className="text-xs text-emerald-400 self-center">{syncStatus}</span>}
          </div>
          <CategoriesDisplay data={categories} />
        </Section>

        <Section icon={Target} title="Genre Intelligence" subtitle="Discover potential viewers, super spreaders, and channel strategies by genre" color="text-rose-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Potential Viewers</p>
              <KeywordSearch
                label="Genre name..."
                loading={loading.genreViewers}
                onSearch={(g) => withLoading('genreViewers', () => auraMathService.getGenrePotentialViewers(g).then(setGenreViewers))}
              />
              <GenreViewersSpreadersTable data={genreViewers} type="viewers" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Super Spreaders</p>
              <KeywordSearch
                label="Genre name..."
                loading={loading.genreSpreaders}
                onSearch={(g) => withLoading('genreSpreaders', () => auraMathService.getGenreSuperSpreaders(g).then(setGenreSpreaders))}
              />
              <GenreViewersSpreadersTable data={genreSpreaders} type="spreaders" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Channel Strategy</p>
              <KeywordSearch
                label="Genre name..."
                loading={loading.genreStrategy}
                onSearch={(g) => withLoading('genreStrategy', () => auraMathService.getGenreChannelStrategy(g).then(setGenreStrategy))}
              />
              <GenreStrategyDisplay data={genreStrategy} />
            </div>
          </div>
        </Section>

        <Section icon={Target} title="Targets" subtitle="Filter high-value outreach targets by genre, influence score, and platform" color="text-orange-400">
          <div className="flex flex-wrap gap-2 mt-3">
            <input
              type="text"
              value={targetFilters.genre || ''}
              onChange={(e) => setTargetFilters((prev) => ({ ...prev, genre: e.target.value }))}
              placeholder="Genre"
              className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              value={targetFilters.minInfluenceScore ?? ''}
              onChange={(e) => setTargetFilters((prev) => ({ ...prev, minInfluenceScore: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="Min influence"
              className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={targetFilters.platform || ''}
              onChange={(e) => setTargetFilters((prev) => ({ ...prev, platform: e.target.value }))}
              placeholder="Platform"
              className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => withLoading('targets', () => auraMathService.listTargets(targetFilters).then(setTargets))}
              disabled={loading.targets}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.targets ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              Search
            </button>
          </div>
          <TargetsDisplay data={targets} />
        </Section>

        <Section icon={Search} title="Diagnostics" subtitle="Debug raw mappings, temporal audits, and user processing pipelines" color="text-slate-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Raw Mapping</p>
              <KeywordSearch
                label="Author..."
                loading={loading.diagRaw}
                onSearch={(a) => withLoading('diagRaw', () => auraMathService.getDiagnosticsRawMapping(a).then((d) => setDiagnostics((prev) => ({ ...prev, raw: d }))))}
              />
              <DiagnosticsDisplay data={diagnostics?.raw} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Temporal Audit</p>
              <KeywordSearch
                label="Author..."
                loading={loading.diagTemporal}
                onSearch={(a) => withLoading('diagTemporal', () => auraMathService.getDiagnosticsTemporalAudit(a).then((d) => setDiagnostics((prev) => ({ ...prev, temporal: d }))))}
              />
              <DiagnosticsDisplay data={diagnostics?.temporal} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Process User</p>
              <KeywordSearch
                label="Author..."
                loading={loading.diagProcess}
                onSearch={(a) => withLoading('diagProcess', () => auraMathService.getDiagnosticsProcessUser(a).then((d) => setDiagnostics((prev) => ({ ...prev, process: d }))))}
              />
              <DiagnosticsDisplay data={diagnostics?.process} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}