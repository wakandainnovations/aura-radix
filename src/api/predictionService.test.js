import { describe, it, expect } from 'vitest';
import { toCredits } from './predictionService';

describe('toCredits', () => {
  it('keeps each person\'s name and rating range', () => {
    expect(toCredits([
      { name: 'A.R. Rahman', highestRecentRatingRange: 10000 },
      { name: 'A. Harsha', highestRecentRatingRange: 1000 },
    ])).toEqual([
      { name: 'A.R. Rahman', highestRecentRatingRange: 10000 },
      { name: 'A. Harsha', highestRecentRatingRange: 1000 },
    ]);
  });

  it('turns plain names (production companies) into credits with no range', () => {
    expect(toCredits(['14 Reels Entertainment'])).toEqual([{ name: '14 Reels Entertainment', highestRecentRatingRange: null }]);
  });

  it('drops entries without a usable name and tolerates a non-array response', () => {
    expect(toCredits([{ highestRecentRatingRange: 100 }, null, '', { name: 'Aadhi Pinisetty' }])).toEqual([
      { name: 'Aadhi Pinisetty', highestRecentRatingRange: null },
    ]);
    expect(toCredits(undefined)).toEqual([]);
  });
});
