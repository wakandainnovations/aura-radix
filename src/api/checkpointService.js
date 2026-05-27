import apiClient from './client';

export const checkpointService = {
  create: async ({ entityId, checkpointDate, description }) => {
    const response = await apiClient.post('/checkpoints', {
      entityId,
      checkpointDate,
      description,
    });
    return response;
  },

  listByEntity: async (entityId) => {
    const response = await apiClient.get(`/checkpoints/entity/${entityId}`);
    return response;
  },

  delete: async (checkpointId) => {
    const response = await apiClient.delete(`/checkpoints/${checkpointId}`);
    return response;
  },

  getSentimentDelta: async (entityId, { fromDate, toDate, windowDays = 7 }) => {
    const response = await apiClient.get(`/dashboard/${entityId}/sentiment-delta`, {
      params: { fromDate, toDate, windowDays },
    });
    return response;
  },

  getCheckpointImpact: async (entityId, { windowDays = 7 } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/checkpoint-impact`, {
      params: { windowDays },
    });
    return response;
  },

  getCheckpointTrend: async (entityId) => {
    const response = await apiClient.get(`/dashboard/${entityId}/checkpoint-trend`);
    return response;
  },
};
