import React, { useState, useCallback, useEffect } from 'react';
import {
  Layers, Network, Zap, Search, Heart, Film,
  Loader2, Filter, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, HelpCircle,
  ArrowUp, ArrowDown, ChevronsUpDown, ExternalLink,
} from 'lucide-react';
import { marketingAggregationService } from '../../api/marketingAggregationService';
import {
  ScoreBar, fmt, PlatformBadge,
  Section, SmallJsonFallback, KeyValueCards,
} from './audienceIntelShared';
import { useSortableRows, SortableHeader } from '../shared';

const GENRE_SUB_TYPES = [
  { value: 'potential-viewers', label: 'Potential Viewers' },
  { value: 'super-spreaders', label: 'Super Spreaders' },
  { value: 'channel-strategy', label: 'Channel Strategy' },
];

// Plain-language explanations of what each column means and how the marketing
// team can act on it. Keyed by a normalized header (lowercased, alphanumerics
// only) so both the fixed Top Spreaders table and the dynamic GenericTable —
// whose columns arrive as snake_case backend keys — can share one source.
const COLUMN_TOOLTIPS = {
  rank: 'Rank by Viral Score (highest first) — work the list top-down to prioritize the authors most likely to amplify your keyword.',
  author: 'The account amplifying your keyword. This is your target for outreach, partnerships, or seeding a campaign.',
  viralscore: 'Relative viral potential — how likely this author’s posts are to spark a cascade. Open-ended (can exceed 100), so compare authors against each other rather than to a fixed ceiling; higher = a better amplification bet.',
  viralpotentialscore: 'Relative viral potential — how likely this author’s posts are to spark a cascade. Open-ended (can exceed 100), so compare authors against each other rather than to a fixed ceiling; higher = a better amplification bet.',
  engagement: 'Total interactions (likes + comments + shares) on this author’s posts. A quick gauge of overall impact.',
  engagementcount: 'Total interactions (likes + comments + shares) on this author’s posts. A quick gauge of overall impact.',
  likes: 'Total likes across the author’s posts for this keyword — a fast read on positive reception.',
  totallikes: 'Total likes across the author’s posts for this keyword — a fast read on positive reception.',
  comments: 'Total comments — signals real conversation and audience involvement, not just passive approval.',
  totalcomments: 'Total comments — signals real conversation and audience involvement, not just passive approval.',
  views: 'Total views / impressions — the size of the audience this author puts your keyword in front of.',
  totalviews: 'Total views / impressions — the size of the audience this author puts your keyword in front of.',
  engrate: 'Engagement ÷ views. A high rate means a small but highly responsive audience — ideal for niche, high-conversion campaigns.',
  engagementrate: 'Engagement ÷ views. A high rate means a small but highly responsive audience — ideal for niche, high-conversion campaigns.',
  sentiment: 'Average sentiment of the author’s posts (0–100). Green ≥ 70 positive, amber 40–69 mixed, red < 40 negative — vet the tone before partnering.',
  averagesentimentscore: 'Average sentiment of the author’s posts (0–100). Green ≥ 70 positive, amber 40–69 mixed, red < 40 negative — vet the tone before partnering.',
  aspect: 'A specific theme audiences talk about (e.g. cast, music, pacing). Use it to focus messaging on what resonates.',
  keyword: 'The campaign keyword these results were aggregated from.',
  mentions: 'How many times this came up — higher counts mean the theme is on more people’s minds.',
  mentioncount: 'How many times this came up — higher counts mean the theme is on more people’s minds.',
  impact: 'How strongly this aspect moves overall sentiment — prioritize the high-impact strengths to promote and weaknesses to address.',
  strength: 'A positive driver to lean into in messaging and creative.',
  weakness: 'A negative driver to get ahead of with messaging or product fixes.',
  outreachhandle: 'How to reach this author — their platform and public profile. Click to open their page directly for seeding, outreach, or partnerships.',
  reachsignals: 'This author’s audience reach broken down by signal (followers, retweets, views…). Longer bars mean bigger reach on that signal.',
};

const normalizeHeader = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// Internal scoring columns that carry no actionable meaning for the marketing
// team — hidden from the dynamic aggregation tables. Matched via normalizeHeader
// so both camelCase (hawkesAlpha) and snake_case (hawkes_alpha) keys are caught.
const HIDDEN_COLUMNS = new Set(['hawkesalpha', 'moiscore', 'scorebreakdown']);

// Table header cell that surfaces a hover tooltip explaining the column to the
// marketing team. Uses a custom popover (native `title` is unreliable/slow and
// some browsers suppress it) so the description is actually visible on hover.
// Falls back to a plain header when no description is known for the column.
// When `sortKey`/`onSort` are supplied the header becomes a clickable sort
// control: click to sort by it (descending first), click again to flip.
function ColHeader({ label, align = 'left', tip, sortKey, sortState, onSort }) {
  const description = tip ?? COLUMN_TOOLTIPS[normalizeHeader(label)];
  const sortable = !!(sortKey && onSort);
  const active = sortable && sortState?.key === sortKey;
  const right = align === 'right';
  const handleSort = sortable ? () => onSort(sortKey) : undefined;
  return (
    <th className={`${right ? 'text-right' : 'text-left'} py-2 px-3 text-muted-foreground font-medium whitespace-nowrap`}>
      <span
        className={`group relative inline-flex items-center gap-1 ${
          sortable ? 'cursor-pointer select-none hover:text-foreground' : description ? 'cursor-help' : ''
        } ${active ? 'text-foreground' : ''}`}
        onClick={handleSort}
        role={sortable ? 'button' : undefined}
        tabIndex={sortable ? 0 : undefined}
        onKeyDown={
          sortable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSort();
                }
              }
            : undefined
        }
      >
        {label}
        {sortable &&
          (active ? (
            sortState.dir === 'asc'
              ? <ArrowUp className="w-3 h-3" />
              : <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-30" />
          ))}
        {description && <HelpCircle className="w-3 h-3 opacity-50" />}
        {description && (
          <span
            role="tooltip"
            className={`pointer-events-none absolute ${right ? 'right-0' : 'left-0'} top-full z-20 mt-1 hidden w-64 whitespace-normal rounded-lg border border-border bg-popover px-3 py-2 text-[11px] font-normal leading-snug text-popover-foreground normal-case tracking-normal shadow-lg group-hover:block`}
          >
            {description}
          </span>
        )}
      </span>
    </th>
  );
}

function FilterBar({ filters, onChange, loading, onSearch, extraRight }) {
  const update = (key, val) => onChange({ ...filters, [key]: val || '' });
  const hasAnyFilter = Object.values(filters).some((v) => v);
  return (
    <div className="flex flex-wrap items-end gap-2 mt-3">
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Language</label>
        <input
          type="text"
          value={filters.language || ''}
          onChange={(e) => update('language', e.target.value)}
          placeholder="e.g. Tamil"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Industry</label>
        <input
          type="text"
          value={filters.industry || ''}
          onChange={(e) => update('industry', e.target.value)}
          placeholder="e.g. Kollywood"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Genre</label>
        <input
          type="text"
          value={filters.genre || ''}
          onChange={(e) => update('genre', e.target.value)}
          placeholder="e.g. action"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">State</label>
        <input
          type="text"
          value={filters.state || ''}
          onChange={(e) => update('state', e.target.value)}
          placeholder="e.g. Tamil Nadu"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Entity ID</label>
        <input
          type="number"
          value={filters.entityId || ''}
          onChange={(e) => update('entityId', e.target.value ? Number(e.target.value) : '')}
          placeholder="ID"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-20 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {extraRight}
      <button
        onClick={onSearch}
        disabled={loading || !hasAnyFilter}
        className="px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1 self-end"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Filter className="w-3 h-3" />}
        Search
      </button>
    </div>
  );
}

function GroupByToggle({ value, onChange, groupLabel = 'keyword' }) {
  const active = !!value;
  return (
    <div className="space-y-1 self-end">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Group by</label>
      <button
        onClick={() => onChange(active ? null : groupLabel)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
          active
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-background text-muted-foreground hover:text-foreground'
        }`}
      >
        {active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
        {groupLabel}
      </button>
    </div>
  );
}

function ResultCount({ data }) {
  if (!data) return null;
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  const isGrouped = !Array.isArray(data) && typeof data === 'object';
  return (
    <span className="text-xs text-muted-foreground">
      {isGrouped
        ? `${count} group${count !== 1 ? 's' : ''}`
        : `${count} result${count !== 1 ? 's' : ''}`}
    </span>
  );
}

function GenericTable({ data, maxRows = 50, perPage = 10 }) {
  const arr = Array.isArray(data) ? data : [];
  const { rows, sortState, requestSort } = useSortableRows(arr, null);
  const [page, setPage] = useState(0);
  // Jump back to the first page whenever the result set or sort order changes,
  // so the user isn't stranded on a now-empty page.
  useEffect(() => { setPage(0); }, [data, sortState]);
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
    if (typeof data[0] !== 'object') {
      return (
        <ul className="mt-3 list-disc list-inside text-xs text-foreground space-y-0.5">
          {data.map((item, i) => <li key={i}>{String(item)}</li>)}
        </ul>
      );
    }
    const cols = Object.keys(data[0]).filter((c) => !HIDDEN_COLUMNS.has(normalizeHeader(c))).slice(0, 10);
    // Only scalar columns are sortable; object columns have no clear order.
    const sortableCols = new Set(cols.filter((c) => typeof data[0][c] !== 'object' || data[0][c] === null));
    const sp = (c) => (sortableCols.has(c) ? { sortKey: c, sortState, onSort: requestSort } : {});
    const capped = rows.slice(0, maxRows);
    const totalPages = Math.ceil(capped.length / perPage);
    const safePage = Math.min(page, Math.max(0, totalPages - 1));
    const pageRows = capped.slice(safePage * perPage, (safePage + 1) * perPage);
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {cols.map((c) => {
                const label = c.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
                return (
                  <SortableHeader
                    key={c}
                    label={label}
                    tip={COLUMN_TOOLTIPS[normalizeHeader(label)]}
                    {...sp(c)}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={safePage * perPage + i} className="border-b border-border/50 hover:bg-accent/20">
                {cols.map((c) => (
                  <td key={c} className="py-2 px-3 text-foreground">
                    {renderCell(row[c], c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {capped.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Showing {safePage * perPage + 1}–{Math.min((safePage + 1) * perPage, capped.length)} of {capped.length}
              {data.length > capped.length ? ` (top ${capped.length} of ${data.length})` : ''}
            </p>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 0}
                  className="px-2 h-7 rounded text-xs font-medium bg-accent text-foreground hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded text-xs font-medium ${safePage === i ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground hover:bg-accent/80'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages - 1}
                  className="px-2 h-7 rounded text-xs font-medium bg-accent text-foreground hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  if (typeof data === 'object') {
    return <GroupedResults data={data} />;
  }
  return <SmallJsonFallback data={data} />;
}

// The backend's `outreachHandle` is an object describing how to contact an
// author (platform + public handle + profile URL). Rendered raw it shows up as
// an unreadable JSON blob, so present it as a clean, clickable contact chip:
// a platform badge, the @handle when known, and a link out to the profile.
function OutreachHandleCell({ value }) {
  if (!value || typeof value !== 'object') return '—';
  const platform = value.platform || value.primaryPlatform;
  const url = value.profile_url || value.profileUrl;
  const rawHandle = value.handle || value.username || value.screen_name || value.screenName;
  const handle = rawHandle
    ? (String(rawHandle).startsWith('@') ? String(rawHandle) : `@${rawHandle}`)
    : null;
  if (!platform && !url && !handle) return JSON.stringify(value);
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      {platform && <PlatformBadge platform={platform} />}
      <span className="text-foreground">{handle || (url ? 'View profile' : '—')}</span>
      {url && <ExternalLink className="w-3 h-3 opacity-70" />}
    </span>
  );
  if (!url) return inner;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
      {inner}
    </a>
  );
}

// Humanizes a metric key for the breakdown maps below, e.g.
// `x_followers_count` → `followers`, `recency_decay` → `recency decay`.
function humanizeMetricKey(key) {
  return (
    String(key)
      .replace(/_count$/, '')
      .replace(/_/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/^(x|instagram|reddit|youtube)\s+/i, '')
      .trim() || String(key)
  );
}

const fmtMetric = (v) => (Number.isInteger(v) ? v.toLocaleString() : fmt(v, 2));

// Renders an object of { label: number } — like `reachSignals` — as a compact,
// sorted list of labeled bars instead of a raw JSON blob. Bars are scaled to the
// largest value in the map so the user can see at a glance which signals dominate
// and by how much. Falls back to JSON if the object has no numeric entries
// (unexpected shape).
function MetricBreakdownCell({ value }) {
  if (!value || typeof value !== 'object') return '—';
  const entries = Object.entries(value)
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  if (entries.length === 0) return JSON.stringify(value);
  const max = Math.max(...entries.map(([, v]) => Math.abs(v))) || 1;
  return (
    <div className="flex flex-col gap-1 min-w-[160px] max-w-[240px] py-0.5">
      {entries.map(([k, v]) => {
        const label = humanizeMetricKey(k);
        return (
          <div key={k} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground capitalize w-24 truncate" title={label}>{label}</span>
            <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden min-w-[24px]">
              <div className="h-full rounded-full bg-amber-400/70" style={{ width: `${(Math.abs(v) / max) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-foreground text-right whitespace-nowrap">{fmtMetric(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

// Columns that are inherently whole numbers and should never show decimals
// (a rank of "1.00" reads as a bug). Matched via normalizeHeader.
const INTEGER_COLUMNS = new Set(['rank']);

function renderCell(value, col) {
  if (value === null || value === undefined) return '—';
  if (col) {
    const nc = normalizeHeader(col);
    if (nc === 'outreachhandle') return <OutreachHandleCell value={value} />;
    if (nc === 'reachsignals') return <MetricBreakdownCell value={value} />;
    if (INTEGER_COLUMNS.has(nc) && typeof value === 'number') return Math.round(value).toLocaleString();
  }
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'number') return fmt(value);
  return String(value);
}

function GroupedResults({ data }) {
  const [expanded, setExpanded] = useState({});
  const groups = Object.entries(data);
  if (groups.length === 0) return <p className="text-xs text-muted-foreground mt-3">No groups</p>;
  return (
    <div className="mt-3 space-y-2">
      {groups.map(([groupKey, items]) => {
        const isOpen = expanded[groupKey] ?? true;
        const count = Array.isArray(items) ? items.length : 1;
        return (
          <div key={groupKey} className="border border-border/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [groupKey]: !isOpen }))}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors"
            >
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">{groupKey}</span>
                <span className="text-muted-foreground font-normal">{count} item{count !== 1 ? 's' : ''}</span>
              </span>
              {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
            </button>
            {isOpen && (
              <div className="px-3 py-2 border-t border-border/50">
                {Array.isArray(items) ? <GenericTable data={items} maxRows={20} /> : <KeyValueCards data={items} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopSpreadersResults({ data }) {
  // Default sort matches the ranked "#" column: highest viral potential first.
  const [sortState, setSortState] = useState({ key: 'viral_potential_score', dir: 'desc' });
  const handleSort = useCallback((key) => {
    setSortState((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' },
    );
  }, []);

  if (!data) return null;
  if (!Array.isArray(data)) return <GenericTable data={data} />;
  if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;

  // The backend returns authors in dedup/insertion order, not by impact, so we
  // sort client-side by the active column. Nulls always sort last regardless of
  // direction; strings compare lexically, everything else numerically.
  const { key, dir } = sortState;
  const rows = [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const an = av == null;
    const bn = bv == null;
    if (an || bn) return an === bn ? 0 : an ? 1 : -1;
    const cmp =
      typeof av === 'string' || typeof bv === 'string'
        ? String(av).localeCompare(String(bv))
        : av - bv;
    return dir === 'asc' ? cmp : -cmp;
  });

  const sortProps = (sortKey) => ({ sortKey, sortState, onSort: handleSort });
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <ColHeader label="#" tip={COLUMN_TOOLTIPS.rank} />
            <ColHeader label="Author" {...sortProps('author')} />
            <ColHeader label="Viral Score" {...sortProps('viral_potential_score')} />
            <ColHeader label="Engagement" align="right" {...sortProps('engagement_count')} />
            <ColHeader label="Likes" align="right" {...sortProps('total_likes')} />
            <ColHeader label="Comments" align="right" {...sortProps('total_comments')} />
            <ColHeader label="Views" align="right" {...sortProps('total_views')} />
            <ColHeader label="Eng. Rate" align="right" {...sortProps('engagement_rate')} />
            <ColHeader label="Sentiment" align="right" {...sortProps('average_sentiment_score')} />
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
              <td className="py-2 px-3 text-foreground font-mono">{i + 1}</td>
              <td className="py-2 px-3 text-foreground font-medium">{row.author || '—'}</td>
              <td className="py-2 px-3"><ScoreBar value={row.viral_potential_score} max={100} color="bg-purple-400" /></td>
              <td className="py-2 px-3 text-right text-foreground">{fmt(row.engagement_count)}</td>
              <td className="py-2 px-3 text-right text-foreground">{fmt(row.total_likes)}</td>
              <td className="py-2 px-3 text-right text-foreground">{fmt(row.total_comments)}</td>
              <td className="py-2 px-3 text-right text-foreground">{fmt(row.total_views)}</td>
              <td className="py-2 px-3 text-right text-foreground">{row.engagement_rate != null ? (row.engagement_rate * 100).toFixed(2) + '%' : '—'}</td>
              <td className="py-2 px-3 text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  row.average_sentiment_score >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                  row.average_sentiment_score >= 40 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {row.average_sentiment_score != null ? row.average_sentiment_score.toFixed(1) : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {data.length} results</p>}
    </div>
  );
}

function AggregationSection({ icon, title, subtitle, color, description, serviceFn, groupLabel = 'keyword', ResultComponent = GenericTable }) {
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceFn(filters, groupBy);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Request failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, groupBy, serviceFn]);

  return (
    <Section icon={icon} title={title} subtitle={subtitle} color={color}>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        loading={loading}
        onSearch={doSearch}
        extraRight={<GroupByToggle value={groupBy} onChange={setGroupBy} groupLabel={groupLabel} />}
      />
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {data && (
        <div className="mt-2 flex items-center gap-2">
          <ResultCount data={data} />
        </div>
      )}
      <ResultComponent data={data} />
    </Section>
  );
}

function GenreAggregationSection() {
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState(null);
  const [subType, setSubType] = useState('potential-viewers');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await marketingAggregationService.getGenreData(subType, filters, groupBy);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Request failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, groupBy, subType]);

  return (
    <Section icon={Film} title="Genre Aggregation" subtitle="Aggregate viewers, spreaders, and channel data across genres" color="text-rose-400">
      <p className="text-xs text-muted-foreground mt-1">
        Aggregate genre-level data (viewers, spreaders, channel strategy) across all genres matching your filters.
      </p>
      <div className="flex flex-wrap items-end gap-2 mt-3">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Data Type</label>
          <select
            value={subType}
            onChange={(e) => setSubType(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground w-44 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            {GENRE_SUB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        loading={loading}
        onSearch={doSearch}
        extraRight={<GroupByToggle value={groupBy} onChange={setGroupBy} groupLabel="genre" />}
      />
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {data && (
        <div className="mt-2 flex items-center gap-2">
          <ResultCount data={data} />
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-medium">{subType}</span>
        </div>
      )}
      <GenericTable data={data} />
    </Section>
  );
}

export default function MarketingAggregationView() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-7 h-7 text-teal-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Aggregated Intel</h2>
            <p className="text-sm text-muted-foreground">
              Cross-keyword marketing intelligence aggregated by language, industry, genre, state, or entity
            </p>
          </div>
        </div>

        <AggregationSection
          icon={Network}
          title="Aggregated Top Spreaders"
          subtitle="Cross-keyword top spreaders deduplicated by author"
          color="text-purple-400"
          description="Union of top spreaders across all keywords matching your filters, deduplicated by author."
          serviceFn={marketingAggregationService.getTopSpreaders}
          ResultComponent={TopSpreadersResults}
        />

        <AggregationSection
          icon={Zap}
          title="Aggregated Viral Seeds"
          subtitle="Cross-keyword early adopters who spark viral cascades"
          color="text-amber-400"
          description="Union of viral seed authors across all matching keywords."
          serviceFn={marketingAggregationService.getViralSeeds}
        />

        <AggregationSection
          icon={Search}
          title="Aggregated Aspect Drivers"
          subtitle="Combined sentiment strengths and weaknesses across keywords"
          color="text-blue-400"
          description="Union of aspect drivers (strengths & weaknesses) across all matching keywords."
          serviceFn={marketingAggregationService.getAspectDrivers}
        />

        <AggregationSection
          icon={Heart}
          title="Aggregated Brand Evangelists"
          subtitle="Loyal advocates consistently promoting positive sentiment"
          color="text-emerald-400"
          description="Union of brand evangelists across all matching keywords."
          serviceFn={marketingAggregationService.getBrandEvangelists}
        />

        <GenreAggregationSection />
      </div>
    </div>
  );
}
