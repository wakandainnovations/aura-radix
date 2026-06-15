import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Loader2, Check } from 'lucide-react';
import { adminLicenseService } from '../../api/adminLicenseService';
import { TIERS } from '../../lib/licensing';

/**
 * Admin console (F3): view and edit the tier price catalog. This is the ONLY place
 * prices are exposed — they are never returned on user-facing endpoints.
 */
export default function PriceAdminView() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({});
  const [saved, setSaved] = useState(false);

  const {
    data: prices = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin', 'license-prices'],
    queryFn: adminLicenseService.listPrices,
  });

  // Seed the editable draft from the loaded catalog (keyed by tier).
  useEffect(() => {
    if (prices.length) {
      const byTier = {};
      prices.forEach((p) => {
        byTier[p.tier] = { price: p.price ?? '', currency: p.currency ?? 'USD' };
      });
      setDraft(byTier);
    }
  }, [prices]);

  const saveMutation = useMutation({
    mutationFn: adminLicenseService.updatePrices,
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['admin', 'license-prices'] });
    },
  });

  const setField = (tier, field, value) =>
    setDraft((d) => ({ ...d, [tier]: { ...d[tier], [field]: value } }));

  const handleSave = (e) => {
    e.preventDefault();
    const payload = TIERS.filter((t) => draft[t] && draft[t].price !== '').map((t) => ({
      tier: t,
      price: Number(draft[t].price),
      currency: draft[t].currency || 'USD',
    }));
    saveMutation.mutate(payload);
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Tag className="w-7 h-7 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tier Prices</h2>
            <p className="text-sm text-muted-foreground">
              Internal price catalog. Never shown to users.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-sm text-red-500">{error?.message || 'Failed to load prices.'}</p>
        ) : (
          <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-5 space-y-4">
            {TIERS.map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-24 text-sm font-semibold text-foreground">{t}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft[t]?.price ?? ''}
                  onChange={(e) => setField(t, 'price', e.target.value)}
                  placeholder="Price"
                  className="flex-1 px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
                />
                <input
                  type="text"
                  value={draft[t]?.currency ?? 'USD'}
                  onChange={(e) => setField(t, 'currency', e.target.value)}
                  className="w-24 px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground uppercase"
                />
              </div>
            ))}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save prices
              </button>
              {saved && (
                <span className="text-sm text-emerald-500 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved
                </span>
              )}
              {saveMutation.isError && (
                <span className="text-sm text-red-500">
                  {saveMutation.error?.message || 'Failed to save.'}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
