import apiClient from './client';

/**
 * Crisis playbook library — reusable crisis-response plans.
 * Backend: /api/playbooks (see PlaybookController)
 *
 * Playbooks originate from the crisis flow; this library lets the user
 * browse, tag, favorite, edit and clone them for reuse.
 */
export const playbookService = {
  // Optional filters: { entityId, tag, favorite }
  getAll: async ({ entityId, tag, favorite } = {}) => {
    const params = {};
    if (entityId !== undefined && entityId !== null) params.entityId = entityId;
    if (tag) params.tag = tag;
    if (favorite !== undefined && favorite !== null) params.favorite = favorite;
    const response = await apiClient.get('/playbooks', { params });
    return response;
  },

  // Partial update — only send the fields that changed.
  update: async (id, { title, planText, tags, isFavorite } = {}) => {
    const body = {};
    if (title !== undefined) body.title = title;
    if (planText !== undefined) body.planText = planText;
    if (tags !== undefined) body.tags = tags;
    if (isFavorite !== undefined) body.isFavorite = isFavorite;
    const response = await apiClient.put(`/playbooks/${id}`, body);
    return response;
  },

  // Clone an existing playbook into a new one owned by the caller.
  clone: async (id, { title } = {}) => {
    const body = {};
    if (title !== undefined) body.title = title;
    const response = await apiClient.post(`/playbooks/${id}/clone`, body);
    return response;
  },
};
