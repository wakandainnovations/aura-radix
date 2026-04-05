import apiClient from './client';

export const dashboardService = {
  // Get entity statistics (KPIs, counts, sentiment ratios)
  // Path: GET /api/dashboard/{entityId}/stats
  // Response: { totalMentions, positiveSentiment, negativeSentiment }
  getStats: async (entityId) => {
    try {
      const response = await apiClient.get(
        `/dashboard/${entityId}/stats`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch stats for entity ${entityId}:`, error);
      throw error;
    }
  },

  // Get competitor comparison snapshot (entity + competitors stats)
  // Path: GET /api/dashboard/{entityId}/competitor-snapshot
  // Response: Array of { entityName, totalMentions, positiveSentiment }
  getCompetitorSnapshot: async (entityId) => {
    try {
      const response = await apiClient.get(
        `/dashboard/${entityId}/competitor-snapshot`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch competitor snapshot for entity ${entityId}:`, error);
      throw error;
    }
  },

  // Get sentiment data over time for trend analysis
  // Path: GET /api/dashboard/sentiment-over-time
  // Query Params: entityIds (comma-separated), period (DAY|WEEK|MONTH)
  // Response: { entities: [{ name, sentiments: [{ date, positive, negative, neutral }] }] }
  getSentimentOverTime: async (entityId, period = 'DAY', entityIds = []) => {
    try {
      const entityIdParam = entityIds.length > 0 
        ? (Array.isArray(entityIds) ? entityIds.join(',') : entityIds)
        : entityId;
      const response = await apiClient.get(
        `/dashboard/sentiment-over-time`,
        { params: { period, entityIds: entityIdParam } }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch sentiment over time for entity ${entityId}:`, error);
      throw error;
    }
  },

  // Get platform breakdown (mentions by platform)
  // Path: GET /api/dashboard/{entityId}/platform-mentions
  // Response: { X: number, REDDIT: number, YOUTUBE: number, INSTAGRAM: number }
  getPlatformMentions: async (entityId) => {
    try {
      const response = await apiClient.get(
        `/dashboard/${entityId}/platform-mentions`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch platform mentions for entity ${entityId}:`, error);
      throw error;
    }
  },

  // Get filtered mentions with pagination
  // Path: GET /api/dashboard/{entityId}/mentions
  // Query Params: platform?, page (default: 0), size (default: 10)
  // Response: { content: Mention[], pageable, totalElements, totalPages, last }
  getMentions: async (entityId, filters = {}) => {
    try {
      const params = {
        page: filters.page || 0,
        size: filters.size || 200,
        ...(filters.platform && { platform: filters.platform }),
      };
      const response = await apiClient.get(
        `/dashboard/${entityId}/mentions`,
        { params }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch mentions for entity ${entityId}:`, error);
      throw error;
    }
  },

  // ========== CLUSTER APIs (for multiple entities) ==========

  // Get average statistics for multiple entities
  // Path: GET /api/dashboard/cluster/stats/avg
  // Query Params: entityIds (comma-separated list of entity IDs)
  // Response: { totalMentions, overallSentiment, positiveRatio, netSentimentScore }
  getClusterStats: async (entityIds = []) => {
    try {
      const entityIdParam = Array.isArray(entityIds) ? entityIds.join(',') : entityIds;
      const response = await apiClient.get(
        `/dashboard/cluster/stats/avg`,
        { params: { entityIds: entityIdParam } }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch cluster stats for entities ${entityIds}:`, error);
      throw error;
    }
  },

  // Get platform mentions for a cluster of entities
  // Path: POST /api/dashboard/cluster/platform-mentions
  // Request Body: [entityId1, entityId2, ...]
  // Response: { PLATFORM: { POSITIVE: number, NEGATIVE: number, NEUTRAL: number } }
  getClusterPlatformMentions: async (entityIds = []) => {
    try {
      const response = await apiClient.post(
        `/dashboard/cluster/platform-mentions`,
        entityIds
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch cluster platform mentions for entities ${entityIds}:`, error);
      throw error;
    }
  },

  // Get filtered mentions for a cluster of entities
  // Path: GET /api/dashboard/cluster/mentions
  // Query Params: entityIds (comma-separated), platform?, page, size
  // Response: { content: Mention[], pageable, totalElements, totalPages, last }
  getClusterMentions: async (entityIds = [], filters = {}) => {
    try {
      const entityIdParam = Array.isArray(entityIds) ? entityIds.join(',') : entityIds;
      const params = {
        entityIds: entityIdParam,
        page: filters.page || 0,
        size: filters.size || 200,
        ...(filters.platform && { platform: filters.platform }),
      };
      const response = await apiClient.get(
        `/dashboard/cluster/mentions`,
        { params }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch cluster mentions for entities ${entityIds}:`, error);
      throw error;
    }
  },
};
