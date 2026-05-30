import apiClient from './client';

// The backend deserializes keywords into KeywordDto objects, so a bare string
// (e.g. "blast") fails with "no String-argument constructor". Wrap each keyword
// string as { keyword: "..." }; pass through values that are already objects.
const toKeywordDtos = (keywords) => {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map((k) => (k && typeof k === 'object' ? k : { keyword: String(k).trim() }))
    .filter((k) => k.keyword);
};

export const entityService = {
  // Get all entities of a specific type
  // Path: GET /api/entities/{entityType}
  // Response: Array of entities
  getAll: async (entityType = 'movie') => {
    try {
      const response = await apiClient.get(`/entities/${entityType}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch all entities of type ${entityType}:`, error);
      throw error;
    }
  },

  // Get specific entity details by ID
  // Path: GET /api/entities/{entityType}/{id}
  // Response: Entity with full details including competitors
  getById: async (entityId, entityType = 'movie') => {
    try {
      const response = await apiClient.get(`/entities/${entityType}/${entityId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch entity ${entityId} of type ${entityType}:`, error);
      throw error;
    }
  },

  // Create new managed entity
  // Path: POST /api/entities/{entityType}
  // Request: { name, type, director?, actors?, keywords? }
  // Response: Created entity object
  create: async (entityType = 'movie', entityData) => {
    try {
      const payload = entityData?.keywords
        ? { ...entityData, keywords: toKeywordDtos(entityData.keywords) }
        : entityData;
      const response = await apiClient.post(`/entities/${entityType}`, payload);
      return response;
    } catch (error) {
      console.error(`Failed to create entity of type ${entityType}:`, error);
      throw error;
    }
  },

  // Update entity competitors list
  // Path: PUT /api/entities/{entityType}/{id}/competitors
  // Request: { competitorIds: number[] }
  // Response: Updated entity with competitors
  updateCompetitors: async (entityType, entityId, competitorIds) => {
    try {
      const response = await apiClient.put(`/entities/${entityType}/${entityId}/competitors`, { 
        competitorIds 
      });
      return response;
    } catch (error) {
      console.error(`Failed to update competitors for entity ${entityId}:`, error);
      throw error;
    }
  },

  // Update entity keywords
  // Path: PUT /api/entities/{entityType}/{id}/keywords
  // Request: { keywords: string[] }
  // Response: Updated entity with new keywords
  updateKeywords: async (entityType, entityId, keywords) => {
    try {
      const response = await apiClient.put(`/entities/${entityType}/${entityId}/keywords`, {
        keywords: toKeywordDtos(keywords)
      });
      return response;
    } catch (error) {
      console.error(`Failed to update keywords for entity ${entityId}:`, error);
      throw error;
    }
  },

  // Delete an entity
  // Path: DELETE /api/entities/{entityType}/{id}
  // Response: No content (204)
  delete: async (entityType, entityId) => {
    try {
      const response = await apiClient.delete(`/entities/${entityType}/${entityId}`);
      return response;
    } catch (error) {
      console.error(`Failed to delete entity ${entityId} of type ${entityType}:`, error);
      throw error;
    }
  },
};
