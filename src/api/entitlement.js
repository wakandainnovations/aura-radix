/**
 * F8 — entitlement-aware envelope helper.
 *
 * Gated backend endpoints now return HTTP 200 with an envelope instead of a 403:
 *   { entitled: boolean, requiredTier: LicenseTier, data: T | null, preview: object | null }
 * - entitled === true  → `data` holds the real payload; `preview` is null.
 * - entitled === false → `data` is null; `preview` holds a masked/blurred teaser.
 *
 * Non-gated (legacy) endpoints still return their raw payload. `unwrapEntitlement`
 * normalizes both shapes so call-sites can treat everything uniformly and old
 * call-sites stay backward-safe.
 */

const ENVELOPE_KEYS = ['entitled', 'requiredTier'];

/**
 * True when `res` looks like an EntitledResponse envelope.
 */
export const isEntitlementEnvelope = (res) =>
  !!res &&
  typeof res === 'object' &&
  !Array.isArray(res) &&
  ENVELOPE_KEYS.every((k) => k in res) &&
  typeof res.entitled === 'boolean';

/**
 * Normalize any gated-endpoint response into a consistent shape:
 *   { entitled, requiredTier, data, preview }
 * When `res` is not an envelope, treat it as fully entitled with the raw payload.
 */
export const unwrapEntitlement = (res) => {
  if (isEntitlementEnvelope(res)) {
    return {
      entitled: res.entitled,
      requiredTier: res.requiredTier ?? null,
      data: res.data ?? null,
      preview: res.preview ?? null,
    };
  }
  return { entitled: true, requiredTier: null, data: res, preview: null };
};

/**
 * Convenience: the payload a consumer should render — real `data` when entitled,
 * otherwise the masked `preview` (so the UI can blur it).
 */
export const entitlementPayload = (env) => (env.entitled ? env.data : env.preview);
