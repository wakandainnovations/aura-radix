import apiClient from './client';

export const dashboardService = {
  // Get entity statistics (KPIs, counts, sentiment ratios)
  // Path: GET /api/dashboard/cluster/stats/avg
  // Query Params: entityIds (comma-separated list of entity IDs)
  // Response: { totalMentions, positiveSentiment, negativeSentiment }
  getStats: async (entityIds = []) => {
    try {
      // Convert single ID to array if needed
      const ids = Array.isArray(entityIds) ? entityIds : [entityIds];
      const entityIdParam = ids.join(',');
      const response = await apiClient.get(
        `/dashboard/cluster/stats/avg`,
        { params: { entityIds: entityIdParam } }
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch stats for entities ${entityIds}:`, error);
      throw error;
    }
  },

  // Get competitor comparison snapshot (entity + competitors stats).
  // First element of the response array is the primary entity's own stats
  // (used as a baseline / for dedupe when adding new competitors); the rest
  // are the actual competitors.
  // Path: GET /api/dashboard/{entityId}/competitor-snapshot
  // Response: Array of { entityName, totalMentions, overallSentiment, positiveRatio, netSentimentScore }
  getCompetitorSnapshot: async (entityId, { signal } = {}) => {
    try {
      const response = await apiClient.get(
        `/dashboard/${entityId}/competitor-snapshot`,
        { signal }
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

  getEntityStatsAvg: async (entityId) => {
    const response = await apiClient.get(`/dashboard/${entityId}/stats/avg`);
    return response;
  },

  getClusterStatsRaw: async (entityIds = []) => {
    const entityIdParam = Array.isArray(entityIds) ? entityIds.join(',') : entityIds;
    const response = await apiClient.get('/dashboard/cluster/stats', {
      params: { entityIds: entityIdParam },
    });
    return response;
  },

  getLastSeen: async (entityId) => {
    const response = await apiClient.get(`/dashboard/${entityId}/last-seen`);
    return response;
  },

  getWhatsChanged: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/whats-changed`, { signal });
    return response;
  },

  getWhatsNew: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/whats-new`, { signal });
    return response;
  },

  getHourlyActivity: async (entityId, period = 'WEEK') => {
    const response = await apiClient.get(`/dashboard/${entityId}/hourly-activity`, {
      params: { period },
    });
    return response;
  },

  // Get top regions by buzz (raw post/comment count)
  // Path: GET /api/dashboard/{entityId}/audience-pulse
  // Response: { entityId, entityName, totalMentions, regions: [{ rank, region, mentionCount, sharePct }] }
  getAudiencePulse: async (entityId) => {
    const response = await apiClient.get(`/dashboard/${entityId}/audience-pulse`);
    return response;
  },

  // Get the ranked breakdown of what kind of buzz is driving conversation
  // (fan-amplified promo, organic opinion, trade/box-office update, etc.),
  // used by the "Top Drivers" panel.
  // Path: GET /api/dashboard/{entityId}/content-intent-breakdown
  // Response: { entityId, entityName, totalClassifiedPosts, intents: [{ rank, contentIntent, count, sharePct }] }
  getContentIntentBreakdown: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/content-intent-breakdown`, { signal });
    return response;
  },

  // Get the ranked breakdown of what aspects of the movie the conversation is
  // actually about (cast performance, music, story, direction, box office,
  // politics/personal-life crossover, etc.), used by the "Topics of Discussion" panel.
  // Path: GET /api/dashboard/{entityId}/topic-category-breakdown
  // Response: { entityId, entityName, totalClassifiedPosts, topics: [{ rank, topicCategory, count, sharePct }] }
  getTopicCategoryBreakdown: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/topic-category-breakdown`, { signal });
    return response;
  },

  // Get the ranked breakdown of what specific review aspect the conversation is about (music/songs,
  // direction, acting/cast performance, story, screenplay, lead pair, runtime, first half, second half,
  // climax, VFX, other) with each aspect's post count, reach, engagement rate, posting velocity, and
  // sentiment - used by the "Aspect Sentiment" and Conversation Drivers panels. Posts are classified
  // into this taxonomy by a backend LLM pass and cached per post, so refresh=true only forces this
  // entity's own not-yet-classified backlog to be classified before returning (a background sweep
  // otherwise keeps the data fresh every 2h).
  // Path: GET /api/dashboard/{entityId}/review-aspect-breakdown
  // Response: { entityId, entityName, totalClassifiedPosts, aspects: [{ rank (by sharePct),
  //   category, totalPosts, averageSentimentScore (-1..1, null when unscored),
  //   sharePct, majoritySentiment: positive|neutral|negative, totalViews,
  //   engagementRate (0..1 fraction, null when unmeasurable), postsPerDay }] }
  getReviewAspectBreakdown: async (entityId, { refresh = false, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/review-aspect-breakdown`, {
      params: { refresh },
      signal,
    });
    return response;
  },

  // Get each top spreader's top posts about this entity, with per-post view count, engagement rate,
  // and sentiment - joined off the same author identity the top-spreaders endpoint returns.
  // Path: GET /api/dashboard/{entityId}/top-spreaders/content
  // Query Params: language?, spreaderLimit (default 10, max 50), postsPerSpreader (default 5, max 50)
  // Response: { entityId, language, spreaders: [{ globalUserId, profileUrl, totalViews,
  //   topContent: [{ mentionId, platform: X|REDDIT|YOUTUBE|INSTAGRAM, postId, content, permalink,
  //   postDate, views, likes, comments, engagementRate, sentiment: POSITIVE|NEGATIVE|NEUTRAL|TOTAL,
  //   sentimentScore }] }] }
  getTopSpreaderContent: async (entityId, { language, spreaderLimit, postsPerSpreader, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/top-spreaders/content`, {
      params: { language, spreaderLimit, postsPerSpreader },
      signal,
    });
    return response;
  },

  // Get the LLM-generated collaboration recommendations for the entity's top
  // spreaders (Influencers tab "AI INSIGHT" panel). Java ranks each spreader
  // into an impact tier (HIGH/MEDIUM/LOW) by totalViews before the LLM ever
  // sees the data; the LLM only picks up to 5 worth a recommendation and
  // writes the action text, grounded in that spreader's real sample content.
  // Path: GET /api/dashboard/{entityId}/top-spreaders/insights
  // Query Params: language?, spreaderLimit (default 10, max 50), postsPerSpreader (default 5, max 10), refresh?
  // Response: { entityId, language, summary, actions: [{ spreaderId, action,
  //   impact: HIGH_IMPACT|MEDIUM_IMPACT|LOW_IMPACT }], generatedAt }
  getTopSpreaderInsights: async (entityId, { language, spreaderLimit, postsPerSpreader, refresh = false, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/top-spreaders/insights`, {
      params: { language, spreaderLimit, postsPerSpreader, refresh },
      signal,
    });
    return response;
  },

  // Get the LLM-generated Command Center AI summary (shares a cache/generation
  // with getTodaysHighlights on the backend, so the two never disagree).
  // Path: GET /api/dashboard/{entityId}/ai-summary
  // Response: { entityId, entityName, summary, generatedAt }
  getAiSummary: async (entityId, { refresh = false, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/ai-summary`, {
      params: { refresh },
      signal,
    });
    return response;
  },

  // Get the LLM-generated Command Center highlights list.
  // Path: GET /api/dashboard/{entityId}/todays-highlights
  // Response: { entityId, entityName, highlights: [{ type: POSITIVE|NEGATIVE|NEUTRAL, text }], generatedAt }
  getTodaysHighlights: async (entityId, { refresh = false, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/todays-highlights`, {
      params: { refresh },
      signal,
    });
    return response;
  },

  // Get the top 3 "People Love" / top 3 "People Concerned About" aspects for the
  // Audience Pulse panel, ranked by AuraMath's aspect-driver analysis (cached per entity, refreshed every 6h).
  // Path: GET /api/dashboard/{entityId}/audience-pulse-aspects
  // Response: { entityId, entityName, peopleLove: string[], peopleConcerned: string[], generatedAt }
  getAudiencePulseAspects: async (entityId, { refresh = false, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/audience-pulse-aspects`, {
      params: { refresh },
      signal,
    });
    return response;
  },

  // Get the Command Center "Recommended Actions" panel plan: server-computed
  // candidates (category/confidencePct/window) selected and phrased by an LLM,
  // filtered by default to the phase whose window contains today.
  // Path: GET /api/dashboard/{entityId}/recommended-actions
  // Response: { entityId, entityName, daysToRelease, actions: [{ candidateId, category, title, reason,
  //   confidencePct, relatedFactor, windowStartDaysFromRelease, windowEndDaysFromRelease, windowLabel,
  //   status: ACTIVE|DONE|IRRELEVANT, exampleHandles: string[],
  //   relevantUsers: [{ userId, platform, profileUrl }] (max 20,
  //   only present when the action text references specific user handles; userId is the
  //   display handle itself, not a numeric id — there's no separate display-name field) }],
  //   generatedAt }
  getRecommendedActions: async (entityId, { refresh = false, allPhases = false, signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/recommended-actions`, {
      params: { refresh, allPhases },
      signal,
    });
    return response;
  },

  // Update a Recommended Actions candidate's status (mark done/irrelevant,
  // or revert to active).
  // Path: PATCH /api/dashboard/{entityId}/recommended-actions/{actionId}/status
  // Body: { status: ACTIVE|DONE|IRRELEVANT }
  updateRecommendedActionStatus: async (entityId, actionId, status, { signal } = {}) => {
    const response = await apiClient.patch(
      `/dashboard/${entityId}/recommended-actions/${actionId}/status`,
      { status },
      { signal }
    );
    return response;
  },

  // Get the Command Center "Movie Health" stat: net positive/negative
  // sentiment ratio scored onto a 0-100 scale.
  // Path: GET /api/dashboard/{entityId}/movie-health
  // Response: { entityId, entityName, netSentimentScore, healthPercentage, healthLabel: Excellent|Good|"Needs Improvement" }
  getMovieHealth: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/movie-health`, { signal });
    return response;
  },

  // Get the Command Center "Buzz" stat: mention volume today vs. the prior UTC day.
  // Path: GET /api/dashboard/{entityId}/buzz
  // Response: { entityId, entityName, mentionsToday, mentionsYesterday, mentionsChange, mentionsChangePct }
  getBuzz: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/buzz`, { signal });
    return response;
  },

  // Get the Command Center "Sentiment" stat: overall average sentiment across
  // the entity's whole mention history.
  // Path: GET /api/dashboard/{entityId}/sentiment
  // Response: { entityId, entityName, totalMentions, averageSentimentScore, positiveRatio }
  getMovieSentiment: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/sentiment`, { signal });
    return response;
  },

  // Get the Command Center "Reach" stat: total unique authors who have posted
  // about the entity.
  // Path: GET /api/dashboard/{entityId}/reach
  // Response: { entityId, entityName, uniqueUsers }
  getReach: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/reach`, { signal });
    return response;
  },

  // Get the Command Center "Reach" stat via the direct (non-cached) query.
  // Path: GET /api/dashboard/{entityId}/reach-direct
  // Response: { entityId, entityName, uniqueUsers }
  getReachDirect: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/reach-direct`, { signal });
    return response;
  },

  // Get the Command Center "Awareness" stat: High/Medium/Low tier for total
  // views, ranked against the caller's other movies.
  // Path: GET /api/dashboard/{entityId}/awareness
  // Response: { entityId, entityName, totalViews, awarenessLevel: High|Medium|Low, comparedMovieCount }
  getAwareness: async (entityId, { signal } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/awareness`, { signal });
    return response;
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
  // Path: GET /api/dashboard/cluster/platform-mentions
  // Query Params: entityIds (comma-separated list of entity IDs)
  // Response: { PLATFORM: { POSITIVE: number, NEGATIVE: number, NEUTRAL: number } }
  getClusterPlatformMentions: async (entityIds = []) => {
    try {
      const entityIdParam = Array.isArray(entityIds) ? entityIds.join(',') : entityIds;
      const response = await apiClient.get(
        `/dashboard/cluster/platform-mentions`,
        { params: { entityIds: entityIdParam } }
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
