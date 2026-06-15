import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import UpgradeModal from './UpgradeModal';
import { ErrorBoundary } from '../shared/ErrorBoundary';

// Neutral blurred placeholder shown behind the upgrade overlay if the masked preview
// payload can't be rendered by the underlying view (shape mismatch). Keeps the gate
// from ever crashing while still reading as a "locked, blurred" teaser.
function PreviewSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-1/3 rounded bg-muted/40" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/30" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-muted/30" />
    </div>
  );
}

/**
 * F8 — universal feature visibility with blurred previews.
 *
 * The feature is ALWAYS rendered (never a hard 403/blank). When the user is
 * entitled, `children` render normally. When not entitled, the consumer feeds the
 * masked `preview` payload into its render, and this gate blurs that content and
 * overlays an "Upgrade to {tier}" call-to-action that opens the UpgradeModal.
 *
 * Props:
 *  - entitled:     boolean from the EntitledResponse envelope
 *  - requiredTier: the minimum tier needed (shown in the CTA)
 *  - featureName:  human label for the feature (e.g. "Intelligence Report")
 *  - children:     the view content (rendered with real data OR the preview payload)
 */
export default function FeatureGate({ entitled, requiredTier, featureName, children }) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (entitled) {
    return children;
  }

  return (
    <div className="relative">
      {/* Blurred teaser — the consumer renders the masked preview payload here.
          Guarded so an unexpected preview shape falls back to a skeleton, never a crash. */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
        <ErrorBoundary fallback={<PreviewSkeleton />}>{children}</ErrorBoundary>
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center rounded-xl border border-border bg-card/90 backdrop-blur-sm shadow-xl p-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {featureName || 'This feature'} is locked
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {requiredTier
              ? `Upgrade to ${requiredTier} to unlock the full ${
                  featureName || 'feature'
                }.`
              : 'Upgrade your plan to unlock the full data.'}
          </p>
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="mt-4 px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            {requiredTier ? `Upgrade to ${requiredTier}` : 'Upgrade'}
          </button>
        </div>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        context={{ type: 'feature', featureName, requiredTier }}
      />
    </div>
  );
}
