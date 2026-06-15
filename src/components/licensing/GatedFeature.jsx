import React from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import FeatureGate from './FeatureGate';

/**
 * Convenience wrapper that resolves entitlement from the /license/features catalog
 * (via useLicense) and renders FeatureGate. Wrap any premium view's content with this
 * so it stays visible but blurs with an upgrade CTA when the user isn't entitled (F8).
 *
 *   <GatedFeature featureKey={FEATURE_KEYS.CHECKPOINTS} featureName="Checkpoints">
 *     ...view...
 *   </GatedFeature>
 */
export default function GatedFeature({ featureKey, featureName, children }) {
  const { hasFeature, featureByKey } = useLicense();
  const entitled = hasFeature(featureKey);
  const requiredTier = featureByKey(featureKey)?.requiredTier;

  return (
    <FeatureGate entitled={entitled} requiredTier={requiredTier} featureName={featureName}>
      {children}
    </FeatureGate>
  );
}
