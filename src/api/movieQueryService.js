import apiClient from './client';

export const movieQueryService = {
  // Ask a question about a specific movie, optionally continuing an existing conversation
  // Path: POST /api/movie-query/ask
  // Request: { entityId: number, prompt: string, conversationId?: string }
  // Response: { conversationId: string, answer: string }
  ask: async (entityId, prompt, conversationId) => {
    try {
      const response = await apiClient.post('/movie-query/ask', {
        entityId,
        prompt,
        ...(conversationId ? { conversationId } : {}),
      });
      return response;
    } catch (error) {
      console.error(`Failed to ask movie query for entity ${entityId}:`, error);
      throw error;
    }
  },
};
