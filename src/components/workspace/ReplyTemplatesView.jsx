import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquareText,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Copy,
  CopyCheck,
} from 'lucide-react';
import { replyTemplateService } from '../../api';

const TONE_OPTIONS = ['Apologetic', 'Empathetic', 'Professional', 'Assertive', 'Friendly', 'Neutral'];

const emptyForm = { name: '', body: '', tone: '' };

export default function ReplyTemplatesView() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const {
    data: templates = [],
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['reply-templates'],
    queryFn: () => replyTemplateService.getAll(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['reply-templates'] });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: (data) => replyTemplateService.create(data),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (err) => setError(err?.message || 'Failed to save template'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => replyTemplateService.update(id, data),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (err) => setError(err?.message || 'Failed to save template'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => replyTemplateService.delete(id),
    onSuccess: invalidate,
  });

  const useMutation_ = useMutation({
    mutationFn: (id) => replyTemplateService.use(id),
    onSuccess: async (result, id) => {
      try {
        await navigator.clipboard.writeText(result?.body ?? '');
        setCopiedId(id);
        setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      } catch {
        // Clipboard may be unavailable (insecure context); the use is still recorded.
      }
      invalidate();
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (tpl) => {
    setForm({ name: tpl.name, body: tpl.body, tone: tpl.tone || '' });
    setEditingId(tpl.id);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.body.trim()) {
      setError('Body is required');
      return;
    }
    const data = {
      name: form.name.trim(),
      body: form.body.trim(),
      tone: form.tone.trim() || null,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (tpl) => {
    if (window.confirm(`Delete template "${tpl.name}"?`)) {
      deleteMutation.mutate(tpl.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const sorted = [...templates].sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0));

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <MessageSquareText className="w-7 h-7 text-sky-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Reply Templates</h2>
              <p className="text-sm text-muted-foreground">
                Save reusable responses. The more you use them, the faster you respond — most-used rise to the top.
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>

        {/* Create / edit form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Apology for delayed response"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="w-48">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tone (optional)</label>
                <input
                  type="text"
                  list="reply-template-tones"
                  value={form.tone}
                  onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
                  placeholder="e.g. Empathetic"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <datalist id="reply-template-tones">
                  {TONE_OPTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Body</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={5}
                placeholder="The reply text. You can refine the wording before sending each time."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create template'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-muted-foreground">{loadError?.message || 'Failed to load templates.'}</p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
              >
                Retry
              </button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <MessageSquareText className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No reply templates yet.</p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first template
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sorted.map((tpl) => (
                <div key={tpl.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{tpl.name}</span>
                        {tpl.tone && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {tpl.tone}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          used {tpl.useCount ?? 0}×
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap break-words">
                        {tpl.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => useMutation_.mutate(tpl.id)}
                        disabled={useMutation_.isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-50"
                        title="Copy to clipboard and record a use"
                      >
                        {copiedId === tpl.id ? (
                          <>
                            <CopyCheck className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Use
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(tpl)}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit template"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
