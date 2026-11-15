import apiClient from './client';

/**
 * Admin-only management of the movies the social-media collector scans
 * (GET/POST/PATCH/DELETE /api/admin/tracked-releases, ROLE_ADMIN).
 *
 * Every India-origin TMDB release is added automatically and tracked from 7 days
 * before to 7 days after release; admins exclude ones not worth the budget, edit
 * keywords, or add releases TMDB doesn't list.
 *
 * Row: { id, tmdbId, entityName, title, originalTitle, language, releaseDate,
 *        trackFrom, trackUntil, keywords[], source: 'TMDB'|'MANUAL', popularity,
 *        posterUrl, excluded, excludedReason, excludedAt,
 *        status: 'UPCOMING'|'TRACKING'|'ENDED'|'EXCLUDED',
 *        collected: { x, instagram, reddit, youtubeComments, youtubeVideos }, collectedTotal }
 */
export const adminTrackedReleaseService = {
  // scope: 'current' (upcoming + tracking) | 'excluded' | 'ended' | 'all'
  list: async (scope = 'current') => apiClient.get('/admin/tracked-releases', { params: { scope } }),

  // { title, releaseDate: 'YYYY-MM-DD', language?, keywords?: string[] }
  create: async (body) => apiClient.post('/admin/tracked-releases', body),

  // Partial: { keywords?: string[], excluded?: boolean, excludedReason?: string, releaseDate? (MANUAL only) }
  update: async (id, patch) => apiClient.patch(`/admin/tracked-releases/${id}`, patch),

  // MANUAL rows only (TMDB rows are excluded instead).
  remove: async (id) => apiClient.delete(`/admin/tracked-releases/${id}`),
};
