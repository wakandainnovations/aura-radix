import apiClient from './client';

export const predictionService = {
  // Max/safe budget per assumed audience rating, plus an OPPORTUNITY/RISK
  // verdict when estimatedBudget is sent. Budgets come back in INR.
  // Path: POST /api/predictions/budget-risk
  // Request: { movieName, releaseDate (YYYY-MM-DD), language ("telugu, hindi" —
  //   original first), estimatedBudget? (INR; AuraService converts it to
  //   AuraPredictor's USD `budget`), genre? ("Action, Drama"), productionCompany?,
  //   cbfcRating? (U|UA|A), isRemake?, marketingBudget? (low|medium|high),
  //   leadActor?, supportingActors? (max 4), director?, musicDirector? }
  // Response: { movieName, releaseDate, language, modelVersion, ratingRange,
  //   hitRatio, maxBudgetHitProbability, safeBudgetHitProbability,
  //   assessments: [{ rating, maxBudget, maxBudgetCapped, safeBudget,
  //   safeBudgetCapped, plannedBudget, expectedRatio, hitProbability, verdict,
  //   verdictConfidence }], breakout: { ratingRange, note, assessments } | null,
  //   notes: string[], currency, usdToInrRate, exchangeRateDate }
  assessBudgetRisk: async (request) => {
    try {
      return await apiClient.post('/predictions/budget-risk', request);
    } catch (error) {
      console.error('Failed to assess budget risk:', error);
      throw error;
    }
  },
};

// Sorted name lists from india_movies_data_collection, used as autocomplete
// sources. Names are matched exactly by AuraPredictor, so picking from these
// beats free typing — but a new name is still allowed.
// Path: GET /api/movie-credits/{actors|directors|music-directors|production-companies}
// Response: string[]
export const movieCreditsService = {
  getActors: () => apiClient.get('/movie-credits/actors'),
  getDirectors: () => apiClient.get('/movie-credits/directors'),
  getMusicDirectors: () => apiClient.get('/movie-credits/music-directors'),
  getProductionCompanies: () => apiClient.get('/movie-credits/production-companies'),
};
