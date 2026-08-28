import apiClient from './client';

export const mentionActionService = {
  getActions: async (mentionId) => {
    const response = await apiClient.get(`/mentions/${mentionId}/actions`);
    return response;
  },

  draftReply: async (mentionId) => {
    const response = await apiClient.post(`/mentions/${mentionId}/actions/draft-reply`);
    return response;
  },

  postReply: async (mentionId, draftId) => {
    const response = await apiClient.post(`/mentions/${mentionId}/actions/post-reply`, {
      draft_id: draftId,
    });
    return response;
  },

  escalateToCrisis: async (mentionId) => {
    const response = await apiClient.post(`/mentions/${mentionId}/actions/escalate-to-crisis`);
    return response;
  },

  mobilizeAllies: async (mentionId) => {
    const response = await apiClient.post(`/mentions/${mentionId}/actions/mobilize-allies`);
    return response;
  },

  // POST /api/mentions/{mentionId}/actions/override-review-aspect (README 26e)
  // Human correction of a misclassified reviewAspectCategory - the fix for a bad
  // post spotted via the reviewAspectCategory filter on GET /dashboard/{entityId}/mentions.
  // Always overwrites the current value (LLM-assigned or previously overridden) and
  // persists an audit row surfaced in getActions() as a REVIEW_ASPECT_OVERRIDE entry.
  // `category` must be one of the backend's ReviewAspectCategory enum values
  // (e.g. "SCREENPLAY") - an unrecognized value is rejected with 400.
  overrideReviewAspect: async (mentionId, { category, reason } = {}) => {
    const response = await apiClient.post(`/mentions/${mentionId}/actions/override-review-aspect`, {
      category,
      ...(reason && { reason }),
    });
    return response;
  },

  // DELETE /api/mentions/{mentionId} (README 26b)
  // Hard-deletes a false-positive/irrelevant mention and all records hanging off
  // it. Returns 204 on success. A 404 means it's already gone server-side (double
  // click or stale list), so we treat it as success and let the caller drop the row.
  deleteMention: async (mentionId) => {
    try {
      await apiClient.delete(`/mentions/${mentionId}`);
    } catch (err) {
      if (err?.status === 404) return;
      throw err;
    }
  },
};
