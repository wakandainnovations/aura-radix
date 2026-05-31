import apiClient from './client';

/**
 * Custom alert-rule persistence — user-scoped sentiment alert rules.
 * Backend: /api/alert-rules (see AlertRuleController)
 *
 * kind is one of SentimentAlert.Kind: 'SPIKE' | 'INFLUENCER_NEGATIVE'
 * entityId is nullable (null = applies to every entity the user watches)
 */
export const alertRuleService = {
  getAll: async () => {
    const response = await apiClient.get('/alert-rules');
    return response;
  },

  get: async (id) => {
    const response = await apiClient.get(`/alert-rules/${id}`);
    return response;
  },

  create: async ({ entityId = null, kind, threshold = 0, channels = [], enabled = true } = {}) => {
    const response = await apiClient.post('/alert-rules', {
      entityId,
      kind,
      threshold,
      channels,
      enabled,
    });
    return response;
  },

  update: async (id, { entityId = null, kind, threshold = 0, channels = [], enabled = true } = {}) => {
    const response = await apiClient.put(`/alert-rules/${id}`, {
      entityId,
      kind,
      threshold,
      channels,
      enabled,
    });
    return response;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/alert-rules/${id}`);
    return response;
  },
};
