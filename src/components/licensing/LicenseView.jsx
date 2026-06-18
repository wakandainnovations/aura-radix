import React, { useState } from 'react';
import { Gem, Loader2, Check, KeyRound, ShieldCheck, ArrowUpCircle } from 'lucide-react';
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

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

/**
 * Account/license page (F3): shows the user's effective tier, per-tier limits, current
 * usage, collection cadence, and an offer-code redemption form (F7). No prices.
 */
export default function LicenseView() {
  const { license, usage, isAdmin, refresh } = useLicense();
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [requestingTier, setRequestingTier] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const tier = license?.tier;

  const handleRequest = async (chosenTier) => {
    if (requestingTier) return;
    setRequestingTier(chosenTier);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await licenseService.requestLicense(chosenTier);
      setRequestSuccess({ tier: chosenTier, licenseKey: res?.licenseKey });
      refresh();
    } catch (err) {
      setRequestError(err?.message || 'Could not issue that license. Please try again.');
    } finally {
      setRequestingTier(null);
    }
  };

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
      refresh();
    } catch (err) {
      const reason = err?.data?.reason;
      setRedeemError(OFFER_ERROR_COPY[reason] || err?.message || 'Could not redeem that code.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Gem className="w-7 h-7 text-cyan-300" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your License</h2>
            <p className="text-sm text-muted-foreground">
              Your plan tier, limits, and usage. Redeem an offer code to unlock more.
            </p>
          </div>
        </div>

        {/* Tier card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Current tier
              </span>
              <span className={`text-2xl font-bold ${TIER_COLORS[tier] || 'text-foreground'}`}>
                {tier || '—'}
              </span>
            </div>
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrator — all features unlocked
              </span>
            )}
          </div>

          {license && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <Stat label="Max entities" value={license.maxEntities} />
              <Stat label="Max keywords" value={license.maxKeywords} />
              <Stat
                label="Mentions / month"
                value={license.maxMentionsPerMonth?.toLocaleString?.() ?? license.maxMentionsPerMonth}
              />
              <Stat
                label="Collection"
                value={formatCollectionFrequency(license.collectionFrequency)}
              />
            </div>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Current usage</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Entities used" value={`${usage.entitiesUsed} / ${usage.entitiesMax}`} />
              <Stat label="Keywords used" value={`${usage.keywordsUsed} / ${usage.keywordsMax}`} />
            </div>
          </div>
        )}

        {/* Request / change license tier (self-service POST /licenses/me) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpCircle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Choose your plan</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Request a new license at the tier you need. This replaces your current license and takes
            effect right away.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TIERS.map((t) => {
              const limits = TIER_LIMITS[t];
              const isCurrent = t === tier;
              const isBusy = requestingTier === t;
              return (
                <div
                  key={t}
                  className={`flex flex-col rounded-lg border bg-background/50 p-4 ${
                    isCurrent ? 'border-primary/60 ring-1 ring-primary/30' : 'border-border'
                  }`}
                >
                  <span className={`text-lg font-bold ${TIER_COLORS[t] || 'text-foreground'}`}>
                    {t}
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground flex-1">
                    <li>{limits.maxEntities} entities</li>
                    <li>{limits.maxKeywords} keywords</li>
                    <li>{limits.maxMentionsPerMonth.toLocaleString()} mentions / mo</li>
                    <li>Collection {formatCollectionFrequency(limits.collectionFrequency)}</li>
                  </ul>
                  <button
                    type="button"
                    disabled={isCurrent || !!requestingTier}
                    onClick={() => handleRequest(t)}
                    className={`mt-3 w-full px-3 py-2 h-9 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCurrent ? 'Current plan' : 'Request'}
                  </button>
                </div>
              );
            })}
          </div>

          {requestError && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500">{requestError}</p>
            </div>
          )}
          {requestSuccess && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm text-emerald-500 flex items-center gap-2 flex-wrap">
                <Check className="w-4 h-4" />
                Your license is now{' '}
                <span className="font-semibold">{requestSuccess.tier}</span>.
              </p>
              {requestSuccess.licenseKey && (
                <p className="mt-1 text-xs text-muted-foreground break-all">
                  License key: <span className="font-mono">{requestSuccess.licenseKey}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Offer code redemption (F7) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Redeem an offer code</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Have a Diamond trial or promo code? Redeem it here to unlock premium features.
          </p>
          <form onSubmit={handleRedeem} className="flex items-center gap-2">
            <input
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
          </form>

          {redeemError && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500">{redeemError}</p>
            </div>
          )}
          {redeemSuccess && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm text-emerald-500 flex items-center gap-2 flex-wrap">
                <Check className="w-4 h-4" />
                Unlocked! Effective tier is now{' '}
                <span className="font-semibold">{redeemSuccess.effectiveTier}</span>
                {redeemSuccess.overrideExpiresAt
                  ? ` until ${new Date(redeemSuccess.overrideExpiresAt).toLocaleString()}.`
                  : ' (no expiry).'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
