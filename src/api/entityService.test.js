import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axios-like client so we can assert on the exact request payloads.
vi.mock('./client', () => ({
  default: {
    get: vi.fn(() => Promise.resolve([])),
    post: vi.fn(() => Promise.resolve({})),
    put: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve()),
  },
}));

import apiClient from './client';
import { entityService } from './entityService';

describe('entityService keyword serialization (KeywordDto)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create() wraps keyword strings as { keyword } objects', async () => {
    await entityService.create('movie', {
      name: 'Inception',
      type: 'movie',
      keywords: ['blast', 'sci-fi'],
    });

    expect(apiClient.post).toHaveBeenCalledWith('/entities/movie', {
      name: 'Inception',
      type: 'movie',
      keywords: [{ keyword: 'blast' }, { keyword: 'sci-fi' }],
    });
  });

  it('updateKeywords() wraps keyword strings as { keyword } objects', async () => {
    await entityService.updateKeywords('movie', 42, ['blast']);

    expect(apiClient.put).toHaveBeenCalledWith('/entities/movie/42/keywords', {
      keywords: [{ keyword: 'blast' }],
    });
  });

  it('passes through keywords that are already in object form', async () => {
    await entityService.updateKeywords('movie', 1, [{ keyword: 'matrix' }]);

    expect(apiClient.put).toHaveBeenCalledWith('/entities/movie/1/keywords', {
      keywords: [{ keyword: 'matrix' }],
    });
  });

  it('create() without keywords leaves the payload untouched', async () => {
    await entityService.create('celebrity', { name: 'Jane Doe', type: 'celebrity' });

    expect(apiClient.post).toHaveBeenCalledWith('/entities/celebrity', {
      name: 'Jane Doe',
      type: 'celebrity',
    });
  });

  it('drops blank/whitespace-only keywords', async () => {
    await entityService.updateKeywords('movie', 7, ['blast', '   ', '']);

    expect(apiClient.put).toHaveBeenCalledWith('/entities/movie/7/keywords', {
      keywords: [{ keyword: 'blast' }],
    });
  });

  it('update() PUTs the full editable payload and wraps keywords as KeywordDtos', async () => {
    await entityService.update('movie', 5, {
      name: 'Dune: Part Two',
      director: 'Denis Villeneuve',
      actors: ['Timothee Chalamet', 'Zendaya'],
      industry: 'Hollywood',
      genre: ['Science Fiction', 'Adventure'],
      releaseDate: '2024-03-01',
      keywords: ['dune'],
    });

    expect(apiClient.put).toHaveBeenCalledWith('/entities/movie/5', {
      name: 'Dune: Part Two',
      director: 'Denis Villeneuve',
      actors: ['Timothee Chalamet', 'Zendaya'],
      industry: 'Hollywood',
      genre: ['Science Fiction', 'Adventure'],
      releaseDate: '2024-03-01',
      keywords: [{ keyword: 'dune' }],
    });
  });

  it('update() without keywords leaves the payload untouched', async () => {
    await entityService.update('celebrity', 9, { name: 'Jane Doe' });

    expect(apiClient.put).toHaveBeenCalledWith('/entities/celebrity/9', {
      name: 'Jane Doe',
    });
  });
});
