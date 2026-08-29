import apiClient from './client';
import { unwrapEntitlement, entitlementPayload } from './entitlement';

// Checkpoints is a SILVER-gated feature. The backend wraps responses in an
// EntitledResponse envelope; `payload()` returns the real data when entitled and the
// masked preview when not (backward-safe for non-enveloped / mocked responses).
// Whether to blur the data is decided by the UI from the /license/features catalog.
const payload = (res) => entitlementPayload(unwrapEntitlement(res));

export const checkpointService = {
  create: async ({ entityId, checkpointDate, description, checkpointType }) => {
    const response = await apiClient.post('/checkpoints', {
      entityId,
      checkpointDate,
      description,
      checkpointType,
    });
    return payload(response);
  },

  listByEntity: async (entityId) => {
    const response = await apiClient.get(`/checkpoints/entity/${entityId}`);
    return payload(response);
  },

  // `selectedAnchors` only applies to the ANCHOR_SEED (stage 1, "Pre-Announcement")
  // checkpoint; the backend 400s if it's sent for any other checkpoint.
  update: async (checkpointId, { checkpointDate, description, checkpointType, selectedAnchors } = {}) => {
    const body = {};
    if (checkpointDate !== undefined) body.checkpointDate = checkpointDate;
    if (description !== undefined) body.description = description;
    if (checkpointType !== undefined) body.checkpointType = checkpointType;
    if (selectedAnchors !== undefined) body.selectedAnchors = selectedAnchors;
    const response = await apiClient.patch(`/checkpoints/${checkpointId}`, body);
    return payload(response);
  },

  delete: async (checkpointId) => {
    const response = await apiClient.delete(`/checkpoints/${checkpointId}`);
    return payload(response);
  },

  getSentimentDelta: async (entityId, { fromDate, toDate, windowDays = 7 }) => {
    const response = await apiClient.get(`/dashboard/${entityId}/sentiment-delta`, {
      params: { fromDate, toDate, windowDays },
    });
    return payload(response);
  },

  getCheckpointImpact: async (entityId, { windowDays = 7 } = {}) => {
    const response = await apiClient.get(`/dashboard/${entityId}/checkpoint-impact`, {
      params: { windowDays },
    });
    return payload(response);
  },

  getCheckpointTrend: async (entityId) => {
    const response = await apiClient.get(`/dashboard/${entityId}/checkpoint-trend`);
    return payload(response);
  },
};
