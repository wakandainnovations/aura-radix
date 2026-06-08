import React, { useState, useCallback, useEffect } from 'react';
import { Target, Sun, Sunrise, Sunset, Moon, Loader2, Search } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import { marketingService } from '../../api/marketingService';
import {
  PLATFORM_COLORS, fmt, PlatformBadge,
  Section,
} from './audienceIntelShared';
import { useSortableRows, SortableHeader } from '../shared';

// Genre picker: a dropdown of all available genres plus a search button.
// Mirrors KeywordSearch's onSearch(value) contract so each Section stays unchanged.
function GenreSearch({ genres, genresLoading, loading, onSearch }) {
  const [selected, setSelected] = useState('');
  return (
    <div className="flex gap-2 mt-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={genresLoading || genres.length === 0}
        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
      >
        <option value="">
          {genresLoading ? 'Loading genres…' : genres.length === 0 ? 'No genres available' : 'Select a genre…'}
        </option>
        {genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <button
        onClick={() => selected && onSearch(selected)}
        disabled={loading || !selected}
        className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Search
      </button>
    </div>
  );
}

function PeakActivityIndicators({ times }) {
  if (!times) return null;
  const slots = [
    { key: 'morning', icon: Sunrise, label: 'Morning' },
    { key: 'afternoon', icon: Sun, label: 'Afternoon' },
    { key: 'evening', icon: Sunset, label: 'Evening' },
    { key: 'night', icon: Moon, label: 'Night' },
  ];
  return (
    <div className="flex items-center gap-1">
      {slots.map(({ key, icon: Icon, label }) => {
        const val = times[key] ?? 0;
        return (
          <div key={key} title={`${label}: ${fmt(val)}`} style={{ opacity: Math.max(0.15, val) }}>
            <Icon className="w-3 h-3 text-foreground" />
          </div>
        );
      })}
    </div>
  );
}

const PAGE_SIZE = 10;

function GenreViewersSpreadersTable({ data, type }) {
  const isSpreaders = type === 'spreaders';
  const baseRows = data ? (isSpreaders ? (data.spreaders || []) : (data.viewers || [])) : [];
  const { rows, sortState, requestSort } = useSortableRows(baseRows, null, {
    platform: (r) => r.platform_handles?.primary_platform,
    score: (r) => (isSpreaders ? r.hawkes_alpha : r.genre_interest_score),
  });
  const total = data ? (isSpreaders ? data.totalSpreaders : data.totalViewers) : 0;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  const sp = (sortKey) => ({ sortKey, sortState, onSort: requestSort, compact: true });
  if (!data) return null;
  const pageRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
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
                <SortableHeader label="User ID" {...sp('global_user_id')} />
                <SortableHeader label="Tribe" {...sp('tribe_label')} />
                <SortableHeader label="Platform" {...sp('platform')} />
                <SortableHeader label={isSpreaders ? 'Hawkes Alpha' : 'Interest Score'} {...sp('score')} />
                <SortableHeader label="Peak Activity" compact />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => {
                const primaryPlat = r.platform_handles?.primary_platform || '';
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-1.5 px-2 text-foreground font-mono text-[10px]">{r.global_user_id || '—'}</td>
                    <td className="py-1.5 px-2"><span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]">{r.tribe_label || '—'}</span></td>
                    <td className="py-1.5 px-2"><PlatformBadge platform={primaryPlat} /></td>
                    <td className="py-1.5 px-2 text-foreground font-mono">{fmt(isSpreaders ? r.hawkes_alpha : r.genre_interest_score, 4)}</td>
                    <td className="py-1.5 px-2"><PeakActivityIndicators times={r.peak_activity_times} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                Showing {safePage * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE + PAGE_SIZE, rows.length)} of {rows.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs px-2 py-0.5 rounded border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/20"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 0}
                >
                  Prev
                </button>
                <span className="text-xs text-muted-foreground">Page {safePage + 1} of {totalPages}</span>
                <button
                  className="text-xs px-2 py-0.5 rounded border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/20"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages - 1}
                >
                  Next
                </button>
              </div>
            </div>
          )}
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

export default function GenreIntelligenceView() {
  const [genreViewers, setGenreViewers] = useState(null);
  const [genreSpreaders, setGenreSpreaders] = useState(null);
  const [genreStrategy, setGenreStrategy] = useState(null);
  const [loading, setLoading] = useState({});
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setGenresLoading(true);
    marketingService.listGenres()
      .then((list) => {
        if (!active) return;
        const names = (list || [])
          .map((item) => (typeof item === 'string' ? item : item?.name || item?.genre || ''))
          .filter(Boolean);
        setGenres([...new Set(names)].sort());
      })
      .catch(() => { if (active) setGenres([]); })
      .finally(() => { if (active) setGenresLoading(false); });
    return () => { active = false; };
  }, []);

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
          <Target className="w-7 h-7 text-rose-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Genre Intelligence</h2>
            <p className="text-sm text-muted-foreground">Discover potential viewers, super spreaders, and optimal channel strategies by genre</p>
          </div>
        </div>

        <Section icon={Target} title="Potential Viewers" subtitle="Users most likely to watch content in this genre based on behavioral signals" color="text-cyan-400">
          <GenreSearch
            genres={genres}
            genresLoading={genresLoading}
            loading={loading.genreViewers}
            onSearch={(g) => withLoading('genreViewers', () => auraMathService.getGenrePotentialViewers(g).then(setGenreViewers))}
          />
          <GenreViewersSpreadersTable data={genreViewers} type="viewers" />
        </Section>

        <Section icon={Target} title="Super Spreaders" subtitle="Top influencers who can amplify content within this genre" color="text-amber-400">
          <GenreSearch
            genres={genres}
            genresLoading={genresLoading}
            loading={loading.genreSpreaders}
            onSearch={(g) => withLoading('genreSpreaders', () => auraMathService.getGenreSuperSpreaders(g).then(setGenreSpreaders))}
          />
          <GenreViewersSpreadersTable data={genreSpreaders} type="spreaders" />
        </Section>

        <Section icon={Target} title="Channel Strategy" subtitle="Optimal platform mix and posting strategy for reaching this genre's audience" color="text-emerald-400">
          <GenreSearch
            genres={genres}
            genresLoading={genresLoading}
            loading={loading.genreStrategy}
            onSearch={(g) => withLoading('genreStrategy', () => auraMathService.getGenreChannelStrategy(g).then(setGenreStrategy))}
          />
          <GenreStrategyDisplay data={genreStrategy} />
        </Section>
      </div>
    </div>
  );
}
