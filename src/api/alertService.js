import apiClient from './client';

export const alertService = {
  getAlerts: async (filters = {}) => {
    const params = {
      page: filters.page || 0,
      size: filters.size || 20,
      ...(filters.managedEntityId && { managedEntityId: filters.managedEntityId }),
      ...(filters.status && { status: filters.status }),
    };
    const response = await apiClient.get('/alerts', { params });
    return response;
  },

  acknowledge: async (alertId) => {
    const response = await apiClient.post(`/alerts/${alertId}/ack`);
    return response;
  },

  // Backend requires a non-blank reason (DismissAlertRequest is @NotBlank);
  // the UI dismisses in one click, so we send a fixed default.
  dismiss: async (alertId) => {
    const response = await apiClient.post(`/alerts/${alertId}/dismiss`, { reason: 'Dismissed by user' });
    return response;
  },

  create: async (alertData) => {
    const response = await apiClient.post('/alerts', alertData);
    return response;
  },
};
