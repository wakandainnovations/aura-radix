import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Film, Loader2, Plus, Trash2, Pencil, Check, X, Ban, RotateCcw } from 'lucide-react';
import { adminTrackedReleaseService } from '../../api/adminTrackedReleaseService';

const SCOPES = [
  { id: 'current', label: 'Upcoming & tracking' },
  { id: 'excluded', label: 'Excluded' },
  { id: 'ended', label: 'Ended' },
  { id: 'all', label: 'All' },
];

const STATUS_STYLES = {
  TRACKING: 'bg-emerald-500/15 text-emerald-400',
  UPCOMING: 'bg-sky-500/15 text-sky-400',
  ENDED: 'bg-muted text-muted-foreground',
  EXCLUDED: 'bg-red-500/15 text-red-400',
};

const PLATFORMS = [
  { key: 'x', label: 'X' },
  { key: 'instagram', label: 'IG' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'youtubeComments', label: 'YT comments' },
  { key: 'youtubeVideos', label: 'YT videos' },
];

const inputClass =
  'px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground';

const fmtDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—';

const splitKeywords = (text) =>
  text
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

/**
 * Admin console: the movies the social-media collector scans. Every India-origin
 * release on TMDB is added automatically and scanned from 7 days before to 7 days
 * after release. Exclude a movie to stop spending collection budget on it (takes
 * effect before the collector's next poll); its collected counts show what it has
 * cost so far.
 */
export default function TrackedReleasesAdminView() {
  const queryClient = useQueryClient();
  const [scope, setScope] = useState('current');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState('release');
  const [editingKeywords, setEditingKeywords] = useState(null); // { id, text }
  const [excluding, setExcluding] = useState(null); // { id, reason }
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', releaseDate: '', language: '', keywords: '' });

  const queryKey = ['admin', 'tracked-releases', scope];
  const { data: releases = [], isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => adminTrackedReleaseService.list(scope),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'tracked-releases'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => adminTrackedReleaseService.update(id, patch),
    onSuccess: () => {
      setEditingKeywords(null);
      setExcluding(null);
      invalidate();
    },
  });

  const createMutation = useMutation({
    mutationFn: adminTrackedReleaseService.create,
    onSuccess: () => {
      setForm({ title: '', releaseDate: '', language: '', keywords: '' });
      setShowAdd(false);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminTrackedReleaseService.remove,
    onSuccess: invalidate,
  });

  const languages = useMemo(
    () => [...new Set(releases.map((r) => r.language).filter(Boolean))].sort(),
    [releases]
  );

  const rows = useMemo(() => {
    const filtered = language ? releases.filter((r) => r.language === language) : releases;
    const sorted = [...filtered];
    if (sortBy === 'collected') sorted.sort((a, b) => (b.collectedTotal ?? 0) - (a.collectedTotal ?? 0));
    else if (sortBy === 'popularity') sorted.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return sorted;
  }, [releases, language, sortBy]);

  const summary = useMemo(() => {
    const tracking = rows.filter((r) => r.status === 'TRACKING').length;
    const upcoming = rows.filter((r) => r.status === 'UPCOMING').length;
    const collected = rows.reduce((sum, r) => sum + (r.collectedTotal ?? 0), 0);
    return { tracking, upcoming, collected };
  }, [rows]);

  const handleCreate = (e) => {
    e.preventDefault();
    const body = { title: form.title.trim(), releaseDate: form.releaseDate };
    if (form.language.trim()) body.language = form.language.trim();
    const keywords = splitKeywords(form.keywords);
    if (keywords.length) body.keywords = keywords;
    createMutation.mutate(body);
  };

  const mutationError = updateMutation.error || createMutation.error || deleteMutation.error;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Film className="w-7 h-7 text-violet-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Tracked Releases</h2>
              <p className="text-sm text-muted-foreground">
                Every Indian release is added automatically and scanned from 7 days before to 7 days
                after release. Exclude movies that aren't worth the collection budget.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add movie
          </button>
        </div>

        {showAdd && (
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_2fr_auto] items-end"
          >
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`${inputClass} w-full`}
                placeholder="Movie title"
              />
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Release date</span>
              <input
                required
                type="date"
                value={form.releaseDate}
                onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                className={`${inputClass} w-full`}
              />
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Language</span>
              <input
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className={`${inputClass} w-full`}
                placeholder="kannada"
              />
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Keywords (comma-separated, optional)</span>
              <input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                className={`${inputClass} w-full`}
                placeholder="Defaults to the title's hashtag + phrase"
              />
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Add
            </button>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden" role="tablist">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={scope === s.id}
                onClick={() => setScope(s.id)}
                className={`px-3 py-2 text-sm ${
                  scope === s.id ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={inputClass}
          >
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select aria-label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass}>
            <option value="release">Sort: release date</option>
            <option value="collected">Sort: most collected</option>
            <option value="popularity">Sort: TMDB popularity</option>
          </select>
          <span className="text-sm text-muted-foreground ml-auto">
            {rows.length} movies · {summary.tracking} tracking · {summary.upcoming} upcoming ·{' '}
            {summary.collected.toLocaleString()} items collected
          </span>
        </div>

        {mutationError && (
          <p className="text-sm text-red-500">{mutationError.message || 'Request failed.'}</p>
        )}

        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-red-500">{error?.message || 'Failed to load tracked releases.'}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Movie</th>
                  <th className="px-4 py-3 font-semibold">Release</th>
                  <th className="px-4 py-3 font-semibold">Window</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Keywords</th>
                  <th className="px-4 py-3 font-semibold">Collected</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {r.posterUrl ? (
                          <img src={r.posterUrl} alt="" className="w-8 h-12 rounded object-cover bg-muted" />
                        ) : (
                          <div className="w-8 h-12 rounded bg-muted" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{r.entityName}</div>
                          <div className="text-xs text-muted-foreground">
                            {[r.language, r.source === 'MANUAL' ? 'added manually' : 'TMDB',
                              r.popularity != null ? `popularity ${r.popularity.toFixed(1)}` : null]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                          {r.excluded && r.excludedReason && (
                            <div className="text-xs text-red-400 mt-1">Excluded: {r.excludedReason}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">{fmtDate(r.releaseDate)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(r.trackFrom)} – {fmtDate(r.trackUntil)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[14rem]">
                      {editingKeywords?.id === r.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            aria-label={`Keywords for ${r.entityName}`}
                            autoFocus
                            value={editingKeywords.text}
                            onChange={(e) => setEditingKeywords({ id: r.id, text: e.target.value })}
                            className="flex-1 px-2 py-1 h-8 bg-background border border-border rounded text-xs text-foreground"
                          />
                          <button
                            type="button"
                            title="Save keywords"
                            onClick={() =>
                              updateMutation.mutate({ id: r.id, patch: { keywords: splitKeywords(editingKeywords.text) } })
                            }
                            className="p-1 text-emerald-400 hover:opacity-80"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Cancel"
                            onClick={() => setEditingKeywords(null)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1">
                          <div className="flex flex-wrap gap-1">
                            {(r.keywords || []).map((k) => (
                              <span key={k} className="px-1.5 py-0.5 rounded bg-muted text-xs text-foreground">
                                {k}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            title="Edit keywords"
                            onClick={() => setEditingKeywords({ id: r.id, text: (r.keywords || []).join(', ') })}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="font-semibold text-foreground text-sm">
                        {(r.collectedTotal ?? 0).toLocaleString()}
                      </div>
                      {PLATFORMS.filter((p) => r.collected?.[p.key]).map((p) => (
                        <div key={p.key}>
                          {p.label}: {r.collected[p.key].toLocaleString()}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {excluding?.id === r.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            aria-label={`Reason for excluding ${r.entityName}`}
                            autoFocus
                            placeholder="Reason (optional)"
                            value={excluding.reason}
                            onChange={(e) => setExcluding({ id: r.id, reason: e.target.value })}
                            className="w-40 px-2 py-1 h-8 bg-background border border-border rounded text-xs text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateMutation.mutate({
                                id: r.id,
                                patch: { excluded: true, excludedReason: excluding.reason },
                              })
                            }
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            title="Cancel"
                            onClick={() => setExcluding(null)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {r.excluded ? (
                            <button
                              type="button"
                              onClick={() => updateMutation.mutate({ id: r.id, patch: { excluded: false } })}
                              className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExcluding({ id: r.id, reason: '' })}
                              className="px-2 py-1 rounded text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" /> Exclude
                            </button>
                          )}
                          {r.source === 'MANUAL' && (
                            <button
                              type="button"
                              title="Delete"
                              onClick={() => {
                                if (window.confirm(`Delete "${r.entityName}" from tracking?`)) deleteMutation.mutate(r.id);
                              }}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No releases in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
