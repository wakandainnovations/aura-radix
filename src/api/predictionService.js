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
  //   notes: string[], alternatives?: { averageHitProbability, languageScope
  //   (a language or "pan-india"), leadActors, musicDirectors } (only with a
  //   budget; each list best first, max 5: [{ name, averageHitProbability,
  //   hitProbabilityGain, ratingRange, hitRatio, similarBudgetFilm: { movieName,
  //   releaseDate, language, budget, revenue (INR) }, assessments }]),
  //   currency, usdToInrRate, exchangeRateDate }
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
// Response: production-companies is string[]; the people endpoints return
// {name, highestRecentRatingRange}[] (the person's highest rating range among
// their last 3 films). Both shapes are normalized to
// {name, highestRecentRatingRange}[], with a null range for plain names.
export const toCredits = (list) =>
  (Array.isArray(list) ? list : [])
    .map((item) =>
      typeof item === 'string'
        ? { name: item, highestRecentRatingRange: null }
        : { name: item?.name, highestRecentRatingRange: Number.isFinite(item?.highestRecentRatingRange) ? item.highestRecentRatingRange : null },
    )
    .filter((credit) => typeof credit.name === 'string' && credit.name);

export const movieCreditsService = {
  getActors: () => apiClient.get('/movie-credits/actors').then(toCredits),
  getDirectors: () => apiClient.get('/movie-credits/directors').then(toCredits),
  getMusicDirectors: () => apiClient.get('/movie-credits/music-directors').then(toCredits),
  getProductionCompanies: () => apiClient.get('/movie-credits/production-companies').then(toCredits),
};
