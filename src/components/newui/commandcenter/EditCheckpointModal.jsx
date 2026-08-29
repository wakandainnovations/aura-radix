import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Pencil, AlertCircle } from 'lucide-react';
import { checkpointService } from '../../../api/checkpointService';
import { CHECKPOINT_IMPACT_WINDOW_DAYS } from './useCommandCenterData';

export default function EditCheckpointModal({ open, onOpenChange, entityId, checkpoint }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [checkpointDate, setCheckpointDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && checkpoint) {
      setDescription(checkpoint.description ?? '');
      setCheckpointDate(checkpoint.checkpointDate ?? '');
      setError('');
    }
  }, [open, checkpoint]);

  function handleOpenChange(next) {
    onOpenChange(next);
  }

  const updateMutation = useMutation({
    mutationFn: (data) => checkpointService.update(checkpoint.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoints', entityId, 'newui-command-center'] });
      queryClient.invalidateQueries({
        queryKey: ['checkpoint-impact', entityId, CHECKPOINT_IMPACT_WINDOW_DAYS, 'newui-command-center'],
      });
      handleOpenChange(false);
    },
    onError: (err) => setError(err?.message || 'Failed to update checkpoint'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmed = description.trim();
    if (!trimmed) return setError('Description is required');
    if (trimmed.length > 20) return setError('Description must be 20 characters or less');
    if (!checkpointDate) return setError('Date is required');

    const data = {};
    if (trimmed !== checkpoint.description) data.description = trimmed;
    if (checkpointDate !== checkpoint.checkpointDate) data.checkpointDate = checkpointDate;
    if (Object.keys(data).length === 0) return handleOpenChange(false);
    updateMutation.mutate(data);
  }

  if (!checkpoint) return null;

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
              <Pencil className="w-3.5 h-3.5 text-blue-400" />
              EDIT CHECKPOINT
            </Dialog.Title>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {checkpoint.isDefault && (
              <p className="text-[11px] text-white/35">
                Default lifecycle-stage checkpoint — you can set or change its date.
              </p>
            )}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Description (max 20 chars)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={20}
                placeholder="e.g. Trailer Launch"
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-white/30 mt-1 block">{description.length}/20</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Date</label>
              <input
                type="date"
                value={checkpointDate}
                onChange={(e) => setCheckpointDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
                disabled={updateMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
