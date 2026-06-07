import axios from 'axios';

const marketingClient = axios.create({
  baseURL: '/v1/marketing',
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
});

marketingClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

marketingClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error),
);

export const marketingService = {
  listGenres: async () => {
    const result = await marketingClient.get('/genre');
    return result.genres || [];
  },

  getGenrePotentialViewers: async (genre) => {
    return marketingClient.get(`/genre/${encodeURIComponent(genre)}/potential-viewers`);
  },

  getGenreSuperSpreaders: async (genre) => {
    return marketingClient.get(`/genre/${encodeURIComponent(genre)}/super-spreaders`);
  },

  getGenreChannelStrategy: async (genre) => {
    return marketingClient.get(`/genre/${encodeURIComponent(genre)}/channel-strategy`);
  },

  listParties: async () => {
    const result = await marketingClient.get('/party');
    return result.parties || [];
  },

  getPartyPotentialVoters: async (party) => {
    return marketingClient.get(`/party/${encodeURIComponent(party)}/potential-voters`);
  },

  getPartySuperSpreaders: async (party) => {
    return marketingClient.get(`/party/${encodeURIComponent(party)}/super-spreaders`);
  },

  getPartyChannelStrategy: async (party) => {
    return marketingClient.get(`/party/${encodeURIComponent(party)}/channel-strategy`);
  },

  listCelebrities: async () => {
    const result = await marketingClient.get('/celebrity');
    return result.celebrities || [];
  },

  getCelebrityPotentialFans: async (celebrity) => {
    return marketingClient.get(`/celebrity/${encodeURIComponent(celebrity)}/potential-fans`);
  },

  getCelebritySuperFans: async (celebrity) => {
    return marketingClient.get(`/celebrity/${encodeURIComponent(celebrity)}/super-fans`);
  },

  getCelebrityChannelStrategy: async (celebrity) => {
    return marketingClient.get(`/celebrity/${encodeURIComponent(celebrity)}/channel-strategy`);
  },

  getCatalog: async () => {
    return marketingClient.get('/_catalog');
  },

  // Entity intelligence reports.
  // Both upstream routes return the IDENTICAL payload; the difference is intent:
  //   - getEntityReport         → in-app view a signed-in user opens for an entity
  //   - getShareableEntityReport→ shareable, prospect-facing version of the same report
  // entityId is treated as an opaque string and URL-encoded. The backend translates
  // an unknown entity to 404 and a still-empty (no scored history) entity to a 200
  // payload carrying only { entityId, name, trackedKeywords, message }.
  getEntityReport: async (entityId) => {
    return marketingClient.get(`/entity/${encodeURIComponent(entityId)}/report`);
  },

  getShareableEntityReport: async (entityId) => {
    return marketingClient.get(`/entity-report/${encodeURIComponent(entityId)}`);
  },
};
