import apiClient from './client';

export const analyticsService = {
  // Get predicted box office revenue for a movie (Mock analytics)
  // Path: GET /api/analytics/{movieId}
  // Response: { movieId, predictedBoxOffice with financial_projections, strategic_fit, market_verdict }
  getBoxOfficePrediction: async (movieId) => {
    try {
      const response = await apiClient.get(`/analytics/${movieId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch box office prediction for movie ${movieId}:`, error);
      throw error;
    }
  },

  // Get trending genre for a specific date (Mock analytics)
  // Path: GET /api/analytics/trending-genre
  // Query Params: date (ISO format, e.g., 2025-11-08)
  // Response: { date: string, trendingGenre: string }
  getTrendingGenre: async (date) => {
    try {
      const isoDate = date instanceof Date ? date.toISOString() : date;
      const response = await apiClient.get('/analytics/trending-genre', {
        params: { date: isoDate },
      });
      return response;
    } catch (error) {
      console.error(`Failed to fetch trending genre for date ${date}:`, error);
      throw error;
    }
  },

  // Get predicted hit genre for upcoming releases (Mock analytics)
  // Path: GET /api/analytics/hit-genre-prediction
  // Response: { predictedHitGenre: string }
  getHitGenrePrediction: async () => {
    try {
      const response = await apiClient.get('/analytics/hit-genre-prediction');
      return response;
    } catch (error) {
      console.error('Failed to fetch hit genre prediction:', error);
      throw error;
    }
  },

  // Get best performing genre for a specific date (Mock analytics)
  // Path: GET /api/analytics/best-genre
  // Query Params: date (ISO format, e.g., 2025-11-08)
  // Response: { date: string, bestGenre: string }
  getBestGenre: async (date) => {
    try {
      const isoDate = date instanceof Date ? date.toISOString() : date;
      const response = await apiClient.get('/analytics/best-genre', {
        params: { date: isoDate },
      });
      return response;
    } catch (error) {
      console.error(`Failed to fetch best genre for date ${date}:`, error);
      throw error;
    }
  },

  // Get top box office movie for a specific date (Mock analytics)
  // Path: GET /api/analytics/top-box-office
  // Query Params: date (ISO format, e.g., 2025-11-08)
  // Response: { date: string, topBoxOfficeMovie: string }
  // DISABLED - Retained for future use
  /*
  getTopBoxOffice: async (date) => {
    try {
      const isoDate = date instanceof Date ? date.toISOString() : date;
      const response = await apiClient.get('/analytics/top-box-office', {
        params: { date: isoDate },
      });
      return response;
    } catch (error) {
      console.error(`Failed to fetch top box office for date ${date}:`, error);
      throw error;
    }
  },
  */
};
