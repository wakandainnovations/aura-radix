import apiClient from './client';

/**
 * Admin-only licensing management endpoints (all under /api/admin/*).
 * These require ROLE_ADMIN on the backend; the UI also gates them behind
 * the admin probe in LicenseContext.
 *
 * Price data is exposed ONLY here (F3 req 14) — never on user-facing endpoints.
 */
export const adminLicenseService = {
  // GET /api/admin/users → [{ id, username }]
  listUsers: async () => {
    return apiClient.get('/admin/users');
  },

  // --- Licenses ---
  // GET /api/admin/licenses
  // → [{ id, licenseKey, tier, userId, username, active, issuedAt, expiresAt }]
  listLicenses: async () => {
    return apiClient.get('/admin/licenses');
  },

  // POST /api/admin/licenses { userId, tier, expiresAt? } → { licenseKey }
  issueLicense: async ({ userId, tier, expiresAt }) => {
    const body = { userId, tier };
    if (expiresAt) body.expiresAt = expiresAt;
    return apiClient.post('/admin/licenses', body);
  },

  // PATCH /api/admin/licenses/{id} { tier?, active? } → summary
  updateLicense: async (id, { tier, active } = {}) => {
    const body = {};
    if (tier !== undefined) body.tier = tier;
    if (active !== undefined) body.active = active;
    return apiClient.patch(`/admin/licenses/${id}`, body);
  },

  // --- Tier prices (admin-only) ---
  // GET /api/admin/license-prices → [{ tier, price, currency, updatedAt }]
  listPrices: async () => {
    return apiClient.get('/admin/license-prices');
  },

  // PUT /api/admin/license-prices [{ tier, price, currency? }] → updated list
  updatePrices: async (prices) => {
    return apiClient.put('/admin/license-prices', prices);
  },

  // --- Offer keys (F7) ---
  // GET /api/admin/offer-keys
  // → [{ id, code, grantsTier, active, expiresAt, maxRedemptions, redemptionCount }]
  listOfferKeys: async () => {
    return apiClient.get('/admin/offer-keys');
  },

  getOfferKey: async (id) => {
    return apiClient.get(`/admin/offer-keys/${id}`);
  },

  // POST /api/admin/offer-keys { code, grantsTier?, active?, expiresAt?, maxRedemptions? }
  createOfferKey: async ({ code, grantsTier, active, expiresAt, maxRedemptions }) => {
    const body = { code };
    if (grantsTier !== undefined) body.grantsTier = grantsTier;
    if (active !== undefined) body.active = active;
    if (expiresAt) body.expiresAt = expiresAt;
    if (maxRedemptions !== undefined && maxRedemptions !== null && maxRedemptions !== '') {
      body.maxRedemptions = Number(maxRedemptions);
    }
    return apiClient.post('/admin/offer-keys', body);
  },

  // PATCH /api/admin/offer-keys/{id} { grantsTier?, active?, expiresAt?, maxRedemptions? }
  updateOfferKey: async (id, patch = {}) => {
    const body = {};
    if (patch.grantsTier !== undefined) body.grantsTier = patch.grantsTier;
    if (patch.active !== undefined) body.active = patch.active;
    if (patch.expiresAt !== undefined) body.expiresAt = patch.expiresAt || null;
    if (patch.maxRedemptions !== undefined) {
      body.maxRedemptions =
        patch.maxRedemptions === '' || patch.maxRedemptions === null
          ? null
          : Number(patch.maxRedemptions);
    }
    return apiClient.patch(`/admin/offer-keys/${id}`, body);
  },

  // DELETE /api/admin/offer-keys/{id} → 204
  deleteOfferKey: async (id) => {
    return apiClient.delete(`/admin/offer-keys/${id}`);
  },
};
