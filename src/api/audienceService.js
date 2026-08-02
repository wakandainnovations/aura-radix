import apiClient from './client';

// Movie Audience APIs — audience-size analytics over tracked MOVIE entities:
// unique posters per language, per movie (with per-user engagement), and how
// a movie's audience compares to similarly-budgeted movies. Movies are
// scoped to the caller's own entities (admins may pass ownerId).
export const audienceService = {
  // Total unique users who posted about any tracked movie in a given language.
  // Path: GET /api/movies/audience
  // Response: { language, movieCount, uniqueAudienceCount, movieNames }
  getLanguageAudience: async (language, { ownerId } = {}) => {
    try {
      const params = { language };
      if (ownerId != null) params.ownerId = ownerId;
      const response = await apiClient.get('/movies/audience', { params });
      return response;
    } catch (error) {
      console.error(`Failed to fetch language audience for ${language}:`, error);
      throw error;
    }
  },

  // Every unique user who posted about movieName in language, with post
  // count, engagement ratio, average sentiment, and positive ratio.
  // Path: GET /api/movies/audience/detail
  // Response: { movieName, language, uniqueAudienceCount, totalPosts, users[] }
  getMovieAudienceDetail: async (movieName, language, { ownerId, limit } = {}) => {
    try {
      const params = { movieName, language };
      if (ownerId != null) params.ownerId = ownerId;
      if (limit != null) params.limit = limit;
      const response = await apiClient.get('/movies/audience/detail', { params });
      return response;
    } catch (error) {
      console.error(`Failed to fetch audience detail for ${movieName} (${language}):`, error);
      throw error;
    }
  },

  // Benchmarks movieName against other tracked movies budgeted within ±50%
  // of it, each with its own audience size and percentile within the range.
  // Path: GET /api/movies/audience/budget-comparison
  // Response: { targetMovieName, targetLanguage, targetBudget, targetUniqueAudienceCount,
  //             targetTotalPosts, targetAudiencePercentileInRange, budgetRangeMinUsd,
  //             budgetRangeMaxUsd, comparableMovies[] }
  getBudgetComparison: async (movieName, { language, ownerId } = {}) => {
    try {
      const params = { movieName };
      if (language != null) params.language = language;
      if (ownerId != null) params.ownerId = ownerId;
      const response = await apiClient.get('/movies/audience/budget-comparison', { params });
      return response;
    } catch (error) {
      console.error(`Failed to fetch budget comparison for ${movieName}:`, error);
      throw error;
    }
  },
};
