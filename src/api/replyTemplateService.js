import apiClient from './client';

/**
 * Reply template library — user-scoped reusable response snippets.
 * Backend: /api/templates (see ReplyTemplateController)
 */
export const replyTemplateService = {
  getAll: async () => {
    const response = await apiClient.get('/templates');
    return response;
  },

  create: async ({ name, body, tone } = {}) => {
    const response = await apiClient.post('/templates', { name, body, tone });
    return response;
  },

  update: async (id, { name, body, tone } = {}) => {
    const response = await apiClient.put(`/templates/${id}`, { name, body, tone });
    return response;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/templates/${id}`);
    return response;
  },

  // Records a use (increments useCount) and returns { body } to paste.
  use: async (id) => {
    const response = await apiClient.post(`/templates/${id}/use`);
    return response;
  },
};
