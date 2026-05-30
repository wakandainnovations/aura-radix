import { Film, Star, Landmark, Flag } from 'lucide-react';

/**
 * Entity types supported by the backend `/entities/{entityType}` APIs.
 * `value` is the path segment used in API calls; the rest is presentation.
 */
export const ENTITY_TYPES = [
  {
    value: 'movie',
    label: 'Movie',
    icon: Film,
    namePlaceholder: 'e.g. Inception',
    hasMovieFields: true,
  },
  {
    value: 'celebrity',
    label: 'Celebrity',
    icon: Star,
    namePlaceholder: 'e.g. Jane Doe',
    hasMovieFields: false,
  },
  {
    value: 'politician',
    label: 'Politician',
    icon: Landmark,
    namePlaceholder: 'e.g. John Smith',
    hasMovieFields: false,
  },
  {
    value: 'political_party',
    label: 'Political Party',
    icon: Flag,
    namePlaceholder: 'e.g. National Party',
    hasMovieFields: false,
  },
];

export const getEntityTypeConfig = (value) =>
  ENTITY_TYPES.find((t) => t.value === value) || ENTITY_TYPES[0];

/**
 * Keywords may arrive as an array of strings, an array of objects ({ keyword|name|value }),
 * or a comma-separated string. Normalize to a plain string[].
 */
export function normalizeKeywords(keywords) {
  if (!keywords) return [];
  if (typeof keywords === 'string') {
    return keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map((k) => {
      if (typeof k === 'string') return k.trim();
      if (k && typeof k === 'object') return (k.keyword || k.name || k.value || '').trim();
      return '';
    })
    .filter(Boolean);
}
