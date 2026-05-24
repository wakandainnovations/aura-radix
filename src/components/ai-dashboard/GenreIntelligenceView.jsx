import React, { useState, useCallback } from 'react';
import { Target } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import {
  PLATFORM_COLORS, fmt, PlatformBadge,
  Section, KeywordSearch,
} from './audienceIntelShared';

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
          <KeywordSearch
            label="Enter genre name..."
            loading={loading.genreViewers}
            onSearch={(g) => withLoading('genreViewers', () => auraMathService.getGenrePotentialViewers(g).then(setGenreViewers))}
          />
          <GenreViewersSpreadersTable data={genreViewers} type="viewers" />
        </Section>

        <Section icon={Target} title="Super Spreaders" subtitle="Top influencers who can amplify content within this genre" color="text-amber-400">
          <KeywordSearch
            label="Enter genre name..."
            loading={loading.genreSpreaders}
            onSearch={(g) => withLoading('genreSpreaders', () => auraMathService.getGenreSuperSpreaders(g).then(setGenreSpreaders))}
          />
          <GenreViewersSpreadersTable data={genreSpreaders} type="spreaders" />
        </Section>

        <Section icon={Target} title="Channel Strategy" subtitle="Optimal platform mix and posting strategy for reaching this genre's audience" color="text-emerald-400">
          <KeywordSearch
            label="Enter genre name..."
            loading={loading.genreStrategy}
            onSearch={(g) => withLoading('genreStrategy', () => auraMathService.getGenreChannelStrategy(g).then(setGenreStrategy))}
          />
          <GenreStrategyDisplay data={genreStrategy} />
        </Section>
      </div>
    </div>
  );
}
