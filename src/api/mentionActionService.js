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
};
