import { describe, it, expect } from 'vitest';
import { isTokenExpired } from './client';

const tokenWith = (payload) =>
  `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.signature`;

describe('isTokenExpired', () => {
  const now = Date.UTC(2026, 9, 23, 2, 0, 0);

  it('is true once the exp claim has passed', () => {
    expect(isTokenExpired(tokenWith({ exp: now / 1000 - 60 }), now)).toBe(true);
  });

  it('is false while the token is still valid', () => {
    expect(isTokenExpired(tokenWith({ exp: now / 1000 + 3600 }), now)).toBe(false);
  });

  it('treats unreadable tokens or a missing exp as not expired', () => {
    expect(isTokenExpired('not-a-jwt', now)).toBe(false);
    expect(isTokenExpired(tokenWith({ sub: 'ravi' }), now)).toBe(false);
  });
});
