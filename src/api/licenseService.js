import apiClient from './client';

/**
 * User-facing licensing endpoints. None of these return price data.
 */
export const licenseService = {
  // GET /api/licenses/me
  // → { tier, maxKeywords, maxEntities, maxMentionsPerMonth, collectionFrequency }
  // Returns the *effective* tier (honors an active offer-key override).
  getMyLicense: async () => {
    try {
      return await apiClient.get('/licenses/me');
    } catch (error) {
      console.error('Failed to fetch license:', error);
      throw error;
    }
  },

  // GET /api/license/usage → { entitiesUsed, entitiesMax, keywordsUsed, keywordsMax }
  getUsage: async () => {
    try {
      return await apiClient.get('/license/usage');
    } catch (error) {
      console.error('Failed to fetch license usage:', error);
      throw error;
    }
  },

  // GET /api/license/features → [{ key, name, requiredTier, entitled }]
  getFeatures: async () => {
    try {
      return await apiClient.get('/license/features');
    } catch (error) {
      console.error('Failed to fetch feature catalog:', error);
      throw error;
    }
  },

  // POST /api/licenses/me { tier }  (tier: BRONZE|SILVER|GOLD|DIAMOND)
  // → { licenseKey }
  // Self-service: issues a new active license at the chosen tier for the current
  // user, replacing any license they already held. Never expires. No price.
  // On failure: 400 if tier is missing/invalid, 403 if unauthenticated.
  requestLicense: async (tier) => {
    try {
      return await apiClient.post('/licenses/me', { tier });
    } catch (error) {
      console.error('Failed to request license:', error);
      throw error;
    }
  },

  // POST /api/license/redeem-offer { code }
  // → { baseTier, overrideTier, effectiveTier, overrideExpiresAt }
  // On failure: 400 with { reason: INVALID|INACTIVE|EXPIRED|EXHAUSTED, message }
  redeemOffer: async (code) => {
    try {
      return await apiClient.post('/license/redeem-offer', { code });
    } catch (error) {
      // Re-throw so callers can read error.data.reason for friendly copy.
      throw error;
    }
  },
};
