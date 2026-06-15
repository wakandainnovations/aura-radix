import apiClient from './client';
import { unwrapEntitlement, entitlementPayload } from './entitlement';

export const crisisService = {
  // Generate crisis response plan using AI (Mock LLM)
  // Path: POST /api/crisis/generate-plan  (GOLD-gated feature)
  // Request: { entityId: number, crisisDescription: string }
  // Response: EntitledResponse wrapping { generatedPlan: string }
  generatePlan: async (entityId, crisisDescription) => {
    try {
      const response = await apiClient.post('/crisis/generate-plan', {
        entityId,
        crisisDescription,
      });
      return entitlementPayload(unwrapEntitlement(response));
    } catch (error) {
      console.error(`Failed to generate crisis plan for entity ${entityId}:`, error);
      throw error;
    }
  },
};
