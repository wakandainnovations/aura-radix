import apiClient from './client';

export const userService = {
  updateWebhook: async (webhookUrl) => {
    const response = await apiClient.put('/users/me/webhook', { webhookUrl });
    return response;
  },
};
