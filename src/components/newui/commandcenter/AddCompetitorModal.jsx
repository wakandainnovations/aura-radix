import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Swords, AlertCircle, Check } from 'lucide-react';
import { entityService } from '../../../api/entityService';
import { useLicense } from '../../../hooks/useLicense';

// Movies already tracked as competitors (by id, falling back to name when
// the snapshot entry has no id — see useCommandCenterData) are excluded from
// the picker, along with the primary movie itself.
export default function AddCompetitorModal({ open, onOpenChange, entityId, existingCompetitors = [] }) {
  const queryClient = useQueryClient();
  const { isAdmin } = useLicense();
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState('');

  // The backend only allows linking competitors owned by the same user as the
  // primary entity (silently dropping any id that isn't — see EntityService.
  // updateCompetitors), and an admin's plain GET /entities/movie spans every
  // owner's catalog. So for admins, resolve the primary entity's actual owner
  // first and scope the candidate list to it; every option shown then reliably
  // links. Non-admins are already pinned to their own entities server-side
  // (and get a 403 if they pass ownerId at all), so they skip this lookup.
  const { data: primaryEntity } = useQuery({
    queryKey: ['entity-detail', entityId, 'movie', 'add-competitor-modal'],
    queryFn: () => entityService.getById(entityId, 'movie'),
    enabled: open && isAdmin && entityId != null,
  });
  const ownerId = isAdmin ? primaryEntity?.ownerId : undefined;

  const { data: candidateMovies = [] } = useQuery({
    queryKey: ['entities', 'movie', 'add-competitor-modal', ownerId ?? 'self'],
    queryFn: () => entityService.getAll('movie', { ownerId }),
    enabled: open && (!isAdmin || primaryEntity != null),
  });

  const availableMovies = useMemo(() => {
    const existingIds = new Set(existingCompetitors.map((c) => c.id).filter((id) => id != null));
    const existingNames = new Set(existingCompetitors.map((c) => c.name));
    return candidateMovies.filter(
      (m) => m.id !== entityId && !existingIds.has(m.id) && !existingNames.has(m.name)
    );
  }, [candidateMovies, existingCompetitors, entityId]);

  function reset() {
    setSelectedIds([]);
    setError('');
  }

  function handleOpenChange(next) {
    if (!next) reset();
    onOpenChange(next);
  }

  function toggleMovie(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  const addMutation = useMutation({
    mutationFn: () => {
      const existingIds = existingCompetitors.map((c) => c.id).filter((id) => id != null);
      const competitorIds = Array.from(new Set([...existingIds, ...selectedIds]));
      return entityService.updateCompetitors('movie', entityId, competitorIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitive-snapshot', entityId, 'newui-command-center'] });
      handleOpenChange(false);
    },
    onError: (err) => setError(err?.message || 'Failed to add competitor'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (selectedIds.length === 0) return setError('Pick at least one movie');
    addMutation.mutate();
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06]">
            <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              ADD COMPETITOR
            </Dialog.Title>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Movies</label>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2 space-y-1">
                {availableMovies.length > 0 ? (
                  availableMovies.map((movie) => {
                    const isSelected = selectedIds.includes(movie.id);
                    return (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() => toggleMovie(movie.id)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                          isSelected ? 'bg-blue-500/15 text-blue-300' : 'text-white/75 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="truncate">{movie.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-white/30 text-center py-4">No other movies to add</p>
                )}
              </div>
              {selectedIds.length > 0 && (
                <span className="text-[11px] text-white/30 mt-1 block">{selectedIds.length} selected</span>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMutation.isPending || selectedIds.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
              >
                {addMutation.isPending ? 'Adding…' : 'Add competitor'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
