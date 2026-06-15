import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Loader2, Plus, Trash2 } from 'lucide-react';
import { adminLicenseService } from '../../api/adminLicenseService';
import { TIERS } from '../../lib/licensing';

/**
 * Admin console (F7): create, list, toggle, and delete Diamond override offer keys.
 */
export default function OfferKeyAdminView() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [grantsTier, setGrantsTier] = useState('DIAMOND');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [formError, setFormError] = useState(null);

  const {
    data: keys = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin', 'offer-keys'],
    queryFn: adminLicenseService.listOfferKeys,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'offer-keys'] });

  const createMutation = useMutation({
    mutationFn: adminLicenseService.createOfferKey,
    onSuccess: () => {
      setCode('');
      setExpiresAt('');
      setMaxRedemptions('');
      setFormError(null);
      invalidate();
    },
    onError: (err) => setFormError(err?.message || 'Failed to create offer key.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => adminLicenseService.updateOfferKey(id, patch),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: adminLicenseService.deleteOfferKey,
    onSuccess: invalidate,
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setFormError('Enter a code.');
      return;
    }
    createMutation.mutate({
      code: code.trim(),
      grantsTier,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      maxRedemptions: maxRedemptions === '' ? undefined : Number(maxRedemptions),
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <KeyRound className="w-7 h-7 text-amber-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Offer Keys</h2>
            <p className="text-sm text-muted-foreground">
              Create override codes that grant Diamond-level access on redemption.
            </p>
          </div>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Create offer key</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. DIAMOND-TRIAL"
                className="px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Grants tier
              <select
                value={grantsTier}
                onChange={(e) => setGrantsTier(e.target.value)}
                className="px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Expires (optional)
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Max redemptions
              <input
                type="number"
                min="1"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                placeholder="∞"
                className="w-28 px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              />
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
        </form>

        {/* Key list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-red-500">{error?.message || 'Failed to load offer keys.'}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Grants</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold">Redemptions</th>
                  <th className="px-4 py-3 font-semibold">Expires</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{k.code}</td>
                    <td className="px-4 py-3 text-foreground">{k.grantsTier}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => updateMutation.mutate({ id: k.id, patch: { active: !k.active } })}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          k.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {k.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {k.redemptionCount}
                      {k.maxRedemptions != null ? ` / ${k.maxRedemptions}` : ''}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete offer key "${k.code}"?`)) deleteMutation.mutate(k.id);
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No offer keys yet.
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
