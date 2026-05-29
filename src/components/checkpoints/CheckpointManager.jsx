import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Flag, Calendar, AlertCircle, Pencil, Check, X } from 'lucide-react';
import { checkpointService } from '../../api';

export default function CheckpointManager({ entityId, entityName }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [checkpointDate, setCheckpointDate] = useState('');
  const [error, setError] = useState('');

  // Inline edit state (per-checkpoint)
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState('');

  const { data: checkpoints = [], isLoading } = useQuery({
    queryKey: ['checkpoints', entityId],
    queryFn: () => checkpointService.listByEntity(entityId),
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => checkpointService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoints', entityId] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-trend'] });
      queryClient.invalidateQueries({ queryKey: ['checkpoint-impact', entityId] });
      queryClient.invalidateQueries({ queryKey: ['checkpoint-trend', entityId] });
      setDescription('');
      setCheckpointDate('');
      setShowForm(false);
      setError('');
    },
    onError: (err) => {
      setError(err?.message || 'Failed to create checkpoint');
    },
  });

  const invalidateCheckpointQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['checkpoints', entityId] });
    queryClient.invalidateQueries({ queryKey: ['sentiment-trend'] });
    queryClient.invalidateQueries({ queryKey: ['checkpoint-impact', entityId] });
    queryClient.invalidateQueries({ queryKey: ['checkpoint-trend', entityId] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ checkpointId, data }) => checkpointService.update(checkpointId, data),
    onSuccess: () => {
      invalidateCheckpointQueries();
      cancelEdit();
    },
    onError: (err) => {
      setEditError(err?.message || 'Failed to update checkpoint');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (checkpointId) => checkpointService.delete(checkpointId),
    onSuccess: invalidateCheckpointQueries,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (description.length > 20) {
      setError('Description must be 20 characters or less');
      return;
    }
    if (!checkpointDate) {
      setError('Date is required');
      return;
    }
    createMutation.mutate({ entityId, checkpointDate, description: description.trim() });
  };

  const startEdit = (cp) => {
    setEditingId(cp.id);
    setEditDescription(cp.description);
    setEditDate(cp.checkpointDate);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
    setEditDate('');
    setEditError('');
  };

  const handleEditSubmit = (cp) => {
    setEditError('');
    const trimmed = editDescription.trim();
    if (!trimmed) {
      setEditError('Description is required');
      return;
    }
    if (trimmed.length > 20) {
      setEditError('Description must be 20 characters or less');
      return;
    }
    if (!editDate) {
      setEditError('Date is required');
      return;
    }
    // Only send fields that actually changed (PATCH is a partial update).
    const data = {};
    if (trimmed !== cp.description) data.description = trimmed;
    if (editDate !== cp.checkpointDate) data.checkpointDate = editDate;
    if (Object.keys(data).length === 0) {
      cancelEdit();
      return;
    }
    updateMutation.mutate({ checkpointId: cp.id, data });
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Checkpoints</h3>
          <span className="text-xs text-muted-foreground">for {entityName}</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Checkpoint
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-border bg-accent/30">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Description (max 20 chars)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={20}
                placeholder="e.g. Trailer Launch"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-xs text-muted-foreground mt-0.5 block">{description.length}/20</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
              <input
                type="date"
                value={checkpointDate}
                onChange={(e) => setCheckpointDate(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-md text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </form>
      )}

      <div className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading checkpoints...</p>
        ) : checkpoints.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No checkpoints yet. Add one to mark significant events.
          </p>
        ) : (
          <div className="space-y-2">
            {checkpoints.map((cp) => (
              editingId === cp.id ? (
                <div
                  key={cp.id}
                  className="px-3 py-2.5 rounded-md bg-accent/40 border border-amber-500/40"
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Description (max 20 chars)
                      </label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        maxLength={20}
                        placeholder="e.g. Trailer Launch"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="text-xs text-muted-foreground mt-0.5 block">{editDescription.length}/20</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => handleEditSubmit(cp)}
                      disabled={updateMutation.isPending}
                      className="p-2 rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {editError && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {editError}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  key={cp.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md bg-accent/40 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-amber-500/70" />
                    <span className="text-sm font-medium text-foreground">{cp.description}</span>
                    <span className="text-xs text-muted-foreground">{cp.checkpointDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(cp)}
                      className="p-1.5 rounded hover:bg-amber-500/20 text-muted-foreground hover:text-amber-400 transition-colors"
                      title="Edit checkpoint"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(cp.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete checkpoint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
