import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axios client wrapper used by the service
vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from './client';
import { checkpointService } from './checkpointService';

describe('checkpointService.update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.patch.mockResolvedValue({ id: 9 });
  });

  it('PATCHes the checkpoint id with both fields when both are provided', async () => {
    await checkpointService.update(9, { checkpointDate: '2026-03-20', description: 'Teaser Drop' });

    expect(apiClient.patch).toHaveBeenCalledTimes(1);
    expect(apiClient.patch).toHaveBeenCalledWith('/checkpoints/9', {
      checkpointDate: '2026-03-20',
      description: 'Teaser Drop',
    });
  });

  it('sends only the description when the date is omitted (partial update)', async () => {
    await checkpointService.update(9, { description: 'Teaser Drop' });

    expect(apiClient.patch).toHaveBeenCalledWith('/checkpoints/9', {
      description: 'Teaser Drop',
    });
  });

  it('sends only the date when the description is omitted (partial update)', async () => {
    await checkpointService.update(9, { checkpointDate: '2026-03-20' });

    expect(apiClient.patch).toHaveBeenCalledWith('/checkpoints/9', {
      checkpointDate: '2026-03-20',
    });
  });

  it('sends an empty body when called with no fields', async () => {
    await checkpointService.update(9);

    expect(apiClient.patch).toHaveBeenCalledWith('/checkpoints/9', {});
  });

  it('returns the response from the client', async () => {
    apiClient.patch.mockResolvedValue({ id: 9, description: 'Teaser Drop' });
    const result = await checkpointService.update(9, { description: 'Teaser Drop' });
    expect(result).toEqual({ id: 9, description: 'Teaser Drop' });
  });
});
