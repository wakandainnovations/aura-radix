import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Star,
  Copy,
  Pencil,
  Loader2,
  AlertCircle,
  Check,
  X,
  Tag,
} from 'lucide-react';
import { playbookService } from '../../api';

export default function PlaybooksView({ entities = [] }) {
  const queryClient = useQueryClient();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', planText: '', tags: '' });
  const [editError, setEditError] = useState('');

  const {
    data: playbooks = [],
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['playbooks'],
    queryFn: () => playbookService.getAll(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['playbooks'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => playbookService.update(id, data),
    onSuccess: () => {
      invalidate();
      cancelEdit();
    },
    onError: (err) => setEditError(err?.message || 'Failed to save playbook'),
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => playbookService.update(id, { isFavorite }),
    onSuccess: invalidate,
  });

  const cloneMutation = useMutation({
    mutationFn: ({ id, title }) => playbookService.clone(id, title ? { title } : {}),
    onSuccess: invalidate,
  });

  const allTags = useMemo(() => {
    const set = new Set();
    playbooks.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [playbooks]);

  const filtered = useMemo(() => {
    return playbooks.filter((p) => {
      if (favoritesOnly && !p.isFavorite) return false;
      if (activeTag && !(p.tags || []).includes(activeTag)) return false;
      return true;
    });
  }, [playbooks, favoritesOnly, activeTag]);

  const entityName = (entityId) => {
    const match = entities.find((e) => e.id === entityId);
    return match ? match.name : `Entity #${entityId}`;
  };

  const startEdit = (pb) => {
    setEditingId(pb.id);
    setEditForm({
      title: pb.title || '',
      planText: pb.planText || '',
      tags: (pb.tags || []).join(', '),
    });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', planText: '', tags: '' });
    setEditError('');
  };

  const handleEditSave = (pb) => {
    setEditError('');
    if (!editForm.planText.trim()) {
      setEditError('Plan text cannot be empty');
      return;
    }
    const tags = editForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    // Only send changed fields (partial update).
    const data = {};
    const newTitle = editForm.title.trim();
    if (newTitle !== (pb.title || '')) data.title = newTitle;
    if (editForm.planText !== pb.planText) data.planText = editForm.planText;
    if (JSON.stringify(tags) !== JSON.stringify(pb.tags || [])) data.tags = tags;
    if (Object.keys(data).length === 0) {
      cancelEdit();
      return;
    }
    updateMutation.mutate({ id: pb.id, data });
  };

  const handleClone = (pb) => {
    const title = window.prompt('Title for the cloned playbook (leave blank for "Copy of …")', '');
    // Cancel returns null; empty string means use the default server title.
    if (title === null) return;
    cloneMutation.mutate({ id: pb.id, title: title.trim() || undefined });
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Crisis Playbooks</h2>
            <p className="text-sm text-muted-foreground">
              Your library of crisis-response plans. Favorite the ones that work, tag them, and clone to reuse.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              favoritesOnly
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
            }`}
          >
            <Star className={`w-4 h-4 ${favoritesOnly ? 'fill-amber-400' : ''}`} />
            Favorites
          </button>
          {allTags.length > 0 && <div className="h-5 w-px bg-border" />}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag((t) => (t === tag ? null : tag))}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                activeTag === tag
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                  : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-muted-foreground">{loadError?.message || 'Failed to load playbooks.'}</p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {playbooks.length === 0
                  ? 'No playbooks yet. They are created from the crisis response flow.'
                  : 'No playbooks match the current filters.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((pb) =>
                editingId === pb.id ? (
                  <div key={pb.id} className="p-4 bg-accent/30 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Untitled playbook"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={editForm.tags}
                        onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                        placeholder="e.g. boycott, miscast, leak"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Plan</label>
                      <textarea
                        value={editForm.planText}
                        onChange={(e) => setEditForm((f) => ({ ...f, planText: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                      />
                    </div>
                    {editError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {editError}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSave(pb)}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={pb.id} className="p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{pb.title || 'Untitled playbook'}</span>
                          <span className="text-xs text-muted-foreground">{entityName(pb.entityId)}</span>
                        </div>
                        {pb.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {pb.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words line-clamp-6">
                          {pb.planText}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => favoriteMutation.mutate({ id: pb.id, isFavorite: !pb.isFavorite })}
                          disabled={favoriteMutation.isPending}
                          className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                            pb.isFavorite
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                          title={pb.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-3.5 h-3.5 ${pb.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleClone(pb)}
                          disabled={cloneMutation.isPending}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          title="Clone playbook"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(pb)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit playbook"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
