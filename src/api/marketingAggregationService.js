import apiClient from './client';

export const marketingAggregationService = {
  getTopSpreaders: async (filters = {}, groupBy) => {
    const params = buildParams(filters, groupBy);
    return apiClient.get('/marketing/aggregate/top-spreaders', { params });
  },

  getViralSeeds: async (filters = {}, groupBy) => {
    const params = buildParams(filters, groupBy);
    return apiClient.get('/marketing/aggregate/viral-seeds', { params });
  },

  getAspectDrivers: async (filters = {}, groupBy) => {
    const params = buildParams(filters, groupBy);
    return apiClient.get('/marketing/aggregate/aspect-drivers', { params });
  },

  getBrandEvangelists: async (filters = {}, groupBy) => {
    const params = buildParams(filters, groupBy);
    return apiClient.get('/marketing/aggregate/brand-evangelists', { params });
  },

  getGenreData: async (subType, filters = {}, groupBy) => {
    const params = buildParams(filters, groupBy === 'genre' ? 'genre' : groupBy);
    return apiClient.get(`/marketing/aggregate/genre/${encodeURIComponent(subType)}`, { params });
  },
};

function buildParams(filters, groupBy) {
  const params = {};
  if (filters.language) params.language = filters.language;
  if (filters.industry) params.industry = filters.industry;
  if (filters.genre) params.genre = filters.genre;
  if (filters.state) params.state = filters.state;
  if (filters.entityId) params.entityId = filters.entityId;
  if (groupBy) params.groupBy = groupBy;
  return params;
}
