import axios from 'axios';

const v1Client = axios.create({
  baseURL: '/v1',
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
});

v1Client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

v1Client.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error),
);

export const auraMathService = {
  getViralSeeds: async (keyword) => {
    return v1Client.get('/viral-seeds', { params: { keyword } });
  },

  getAspectDrivers: async (keyword) => {
    return v1Client.get(`/aspect-drivers/${encodeURIComponent(keyword)}`);
  },

  getTopSpreaders: async (keyword) => {
    return v1Client.get(`/top-spreaders/${encodeURIComponent(keyword)}`);
  },

  findLookalikes: async (seedAuthorId) => {
    return v1Client.post('/find-lookalikes', { seedAuthorId });
  },

  getUserProfile: async (globalUserId) => {
    return v1Client.get(`/users/${encodeURIComponent(globalUserId)}/profile`);
  },

  getUserReport: async (author) => {
    return v1Client.get(`/users/${encodeURIComponent(author)}/report`);
  },

  listUsers: async (filters = {}) => {
    const params = {};
    if (filters.audienceClassification) params.audienceClassification = filters.audienceClassification;
    if (filters.influenceTier) params.influenceTier = filters.influenceTier;
    if (filters.postingStyle) params.postingStyle = filters.postingStyle;
    if (filters.dominantTone) params.dominantTone = filters.dominantTone;
    if (filters.primaryPlatform) params.primaryPlatform = filters.primaryPlatform;
    return v1Client.get('/users', { params });
  },

  getUserCategories: async () => {
    return v1Client.get('/users/categories');
  },

  syncUsers: async () => {
    return v1Client.post('/users/sync');
  },

  getGenrePotentialViewers: async (genre) => {
    return v1Client.get(`/genres/${encodeURIComponent(genre)}/potential-viewers`);
  },

  getGenreSuperSpreaders: async (genre) => {
    return v1Client.get(`/genres/${encodeURIComponent(genre)}/super-spreaders`);
  },

  getGenreChannelStrategy: async (genre) => {
    return v1Client.get(`/genres/${encodeURIComponent(genre)}/channel-strategy`);
  },

  listTargets: async (filters = {}) => {
    const params = {};
    if (filters.genre) params.genre = filters.genre;
    if (filters.minInfluenceScore != null) params.minInfluenceScore = filters.minInfluenceScore;
    if (filters.platform) params.platform = filters.platform;
    return v1Client.get('/targets', { params });
  },

  getDiagnosticsRawMapping: async (author) => {
    return v1Client.get(`/diagnostics/raw-mapping/${encodeURIComponent(author)}`);
  },

  getDiagnosticsTemporalAudit: async (author) => {
    return v1Client.get(`/diagnostics/temporal-audit/${encodeURIComponent(author)}`);
  },

  getDiagnosticsProcessUser: async (author) => {
    return v1Client.get(`/diagnostics/process-user/${encodeURIComponent(author)}`);
  },
};
