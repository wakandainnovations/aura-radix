import apiClient from './client';

export const alertService = {
  getAlerts: async (filters = {}) => {
    const params = {
      page: filters.page || 0,
      size: filters.size || 20,
      ...(filters.entityId && { entityId: filters.entityId }),
      ...(filters.status && { status: filters.status }),
    };
    const response = await apiClient.get('/alerts', { params });
    return response;
  },

  acknowledge: async (alertId) => {
    const response = await apiClient.post(`/alerts/${alertId}/ack`);
    return response;
  },

  dismiss: async (alertId, reason) => {
    const response = await apiClient.post(`/alerts/${alertId}/dismiss`, { reason });
    return response;
  },

  create: async (alertData) => {
    const response = await apiClient.post('/alerts', alertData);
    return response;
  },
};
