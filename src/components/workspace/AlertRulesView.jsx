import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellRing, Plus, Pencil, Trash2, Loader2, AlertCircle, Power } from 'lucide-react';
import { alertRuleService } from '../../api';

const KIND_OPTIONS = [
  {
    value: 'SPIKE',
    label: 'Sentiment spike',
    description: 'Fire when negative-sentiment ratio rises by at least the threshold over baseline.',
    usesThreshold: true,
  },
  {
    value: 'INFLUENCER_NEGATIVE',
    label: 'Influencer turns negative',
    description: 'Fire when a high-reach account posts negative sentiment. Threshold is not used.',
    usesThreshold: false,
  },
];

const CHANNEL_OPTIONS = ['email', 'slack', 'sms', 'webhook'];

const emptyForm = {
  entityId: '',
  kind: 'SPIKE',
  threshold: 0.1,
  channels: ['email'],
  enabled: true,
};

const kindMeta = (kind) => KIND_OPTIONS.find((k) => k.value === kind) || KIND_OPTIONS[0];

export default function AlertRulesView({ entities = [] }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const {
    data: rules = [],
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => alertRuleService.getAll(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['alert-rules'] });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: (data) => alertRuleService.create(data),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (err) => setError(err?.message || 'Failed to save alert rule'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => alertRuleService.update(id, data),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (err) => setError(err?.message || 'Failed to save alert rule'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => alertRuleService.delete(id),
    onSuccess: invalidate,
  });

  // Toggle enabled inline without opening the form.
  const toggleMutation = useMutation({
    mutationFn: (rule) =>
      alertRuleService.update(rule.id, {
        entityId: rule.entityId ?? null,
        kind: rule.kind,
        threshold: rule.threshold ?? 0,
        channels: rule.channels ?? [],
        enabled: !rule.enabled,
      }),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (rule) => {
    setForm({
      entityId: rule.entityId == null ? '' : String(rule.entityId),
      kind: rule.kind,
      threshold: rule.threshold ?? 0,
      channels: rule.channels ?? [],
      enabled: rule.enabled,
    });
    setEditingId(rule.id);
    setError('');
    setShowForm(true);
  };

  const toggleChannel = (channel) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(channel)
        ? f.channels.filter((c) => c !== channel)
        : [...f.channels, channel],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const meta = kindMeta(form.kind);
    const threshold = meta.usesThreshold ? Number(form.threshold) : 0;
    if (meta.usesThreshold && (Number.isNaN(threshold) || threshold < 0)) {
      setError('Threshold must be zero or greater');
      return;
    }
    const data = {
      entityId: form.entityId === '' ? null : Number(form.entityId),
      kind: form.kind,
      threshold,
      channels: form.channels,
      enabled: form.enabled,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (rule) => {
    if (window.confirm('Delete this alert rule?')) {
      deleteMutation.mutate(rule.id);
    }
  };

  const entityName = (entityId) => {
    if (entityId == null) return 'All entities';
    const match = entities.find((e) => e.id === entityId);
    return match ? match.name : `Entity #${entityId}`;
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const formKindMeta = kindMeta(form.kind);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <BellRing className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Alert Rules</h2>
              <p className="text-sm text-muted-foreground">
                Decide what's worth waking up for. Rules persist across sessions and apply to every refresh.
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        </div>

        {/* Create / edit form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="w-56">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Trigger</label>
                <select
                  value={form.kind}
                  onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {KIND_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-56">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Entity</label>
                <select
                  value={form.entityId}
                  onChange={(e) => setForm((f) => ({ ...f, entityId: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All entities</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              {formKindMeta.usesThreshold && (
                <div className="w-40">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Threshold (ratio)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.threshold}
                    onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground -mt-1">{formKindMeta.description}</p>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Channels</label>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((channel) => {
                  const active = form.channels.includes(channel);
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${
                        active
                          ? 'bg-primary/20 text-primary border-primary/50'
                          : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {channel}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                className="rounded border-border"
              />
              Enabled
            </label>

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
                {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create rule'}
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
              <p className="text-sm text-muted-foreground">{loadError?.message || 'Failed to load alert rules.'}</p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
              >
                Retry
              </button>
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <BellRing className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No alert rules yet.</p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first rule
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rules.map((rule) => {
                const meta = kindMeta(rule.kind);
                return (
                  <div key={rule.id} className="p-4 flex items-start justify-between gap-3 hover:bg-accent/30 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{meta.label}</span>
                        {!rule.enabled && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-muted/40 text-muted-foreground border border-border">
                            disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entityName(rule.entityId)}
                        {meta.usesThreshold && <> · threshold {rule.threshold}</>}
                        {rule.channels?.length > 0 && <> · {rule.channels.join(', ')}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate(rule)}
                        disabled={toggleMutation.isPending}
                        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                          rule.enabled
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                        title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(rule)}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit rule"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
