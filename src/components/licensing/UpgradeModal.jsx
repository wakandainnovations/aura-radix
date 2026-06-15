import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Lock, Check, Sparkles } from 'lucide-react';
import { useLicense } from '../../contexts/LicenseContext';
import { licenseService } from '../../api/licenseService';
import {
  TIERS,
  TIER_LIMITS,
  TIER_COLORS,
  formatCollectionFrequency,
} from '../../lib/licensing';

const OFFER_ERROR_COPY = {
  INVALID: 'That offer code is not valid.',
  INACTIVE: 'That offer code is no longer active.',
  EXPIRED: 'That offer code has expired.',
  EXHAUSTED: 'That offer code has reached its redemption limit.',
};

/**
 * Upgrade prompt shown when a feature is locked (F8) or a tier limit is hit (F4).
 * Displays the tier-comparison table (no prices — never returned to users) and the
 * Diamond override offer-key redemption form (F7).
 *
 * `context` shapes the heading:
 *   { type: 'feature', featureName, requiredTier }
 *   { type: 'limit',   limitType: 'ENTITIES'|'KEYWORDS', limit, current }
 */
export default function UpgradeModal({ open, onOpenChange, context = {} }) {
  const { tier: currentTier, refresh } = useLicense();
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);
    try {
      const res = await licenseService.redeemOffer(code.trim());
      setRedeemSuccess(res);
      setCode('');
      refresh(); // propagate the new effective tier app-wide
    } catch (err) {
      const reason = err?.data?.reason;
      setRedeemError(OFFER_ERROR_COPY[reason] || err?.message || 'Could not redeem that code.');
    } finally {
      setRedeeming(false);
    }
  };

  const heading =
    context.type === 'limit'
      ? `You've reached your ${context.limitType === 'KEYWORDS' ? 'keyword' : 'entity'} limit`
      : context.featureName
        ? `${context.featureName} requires ${context.requiredTier || 'a higher tier'}`
        : 'Upgrade your plan';

  const subheading =
    context.type === 'limit'
      ? `Your current plan allows ${context.limit} ${
          context.limitType === 'KEYWORDS' ? 'keywords' : 'entities'
        } (you're using ${context.current}). Upgrade to track more.`
      : 'Unlock premium features by upgrading your tier or redeeming an offer code.';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,720px)] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {heading}
                </Dialog.Title>
                <p className="text-sm text-muted-foreground mt-1">{subheading}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tier comparison */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background/50 text-muted-foreground">
                  <th className="text-left font-medium px-3 py-2">Tier</th>
                  <th className="text-right font-medium px-3 py-2">Entities</th>
                  <th className="text-right font-medium px-3 py-2">Keywords</th>
                  <th className="text-right font-medium px-3 py-2">Mentions/mo</th>
                  <th className="text-right font-medium px-3 py-2">Collection</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t) => {
                  const limits = TIER_LIMITS[t];
                  const isCurrent = t === currentTier;
                  return (
                    <tr
                      key={t}
                      className={`border-t border-border ${isCurrent ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-3 py-2">
                        <span className={`font-semibold ${TIER_COLORS[t] || 'text-foreground'}`}>
                          {t}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary">
                            <Check className="w-3 h-3" /> current
                          </span>
                        )}
                      </td>
                      <td className="text-right px-3 py-2 text-foreground">{limits.maxEntities}</td>
                      <td className="text-right px-3 py-2 text-foreground">{limits.maxKeywords}</td>
                      <td className="text-right px-3 py-2 text-foreground">
                        {limits.maxMentionsPerMonth.toLocaleString()}
                      </td>
                      <td className="text-right px-3 py-2 text-muted-foreground">
                        {formatCollectionFrequency(limits.collectionFrequency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            To change your tier, contact your account administrator. Have an offer code? Redeem it
            below for instant access.
          </p>

          {/* Offer-key redemption (F7) */}
          <form onSubmit={handleRedeem} className="mt-4 border-t border-border pt-4">
            <label htmlFor="offer-code" className="text-sm font-medium text-foreground">
              Redeem an offer code
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="offer-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter offer code"
                disabled={redeeming}
                className="flex-1 px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={redeeming || !code.trim()}
                className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {redeeming && <Loader2 className="w-4 h-4 animate-spin" />}
                Redeem
              </button>
            </div>

            {redeemError && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-500">{redeemError}</p>
              </div>
            )}
            {redeemSuccess && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-emerald-500 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Unlocked! Your effective tier is now{' '}
                  <span className="font-semibold">{redeemSuccess.effectiveTier}</span>
                  {redeemSuccess.overrideExpiresAt
                    ? ` until ${new Date(redeemSuccess.overrideExpiresAt).toLocaleDateString()}.`
                    : '.'}
                </p>
              </div>
            )}
          </form>

          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
            >
              {redeemSuccess ? 'Done' : 'Close'}
            </button>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Premium features stay visible — only the data is locked
            until you upgrade.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
