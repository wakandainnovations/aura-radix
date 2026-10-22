// Value lists match what india_movies_data_collection actually holds, since
// AuraPredictor treats any unseen language/genre string as "unknown".
export const LANGUAGES = [
  'hindi', 'telugu', 'tamil', 'malayalam', 'kannada', 'punjabi',
  'bengali', 'marathi', 'gujarati', 'odia', 'assamese', 'english',
];

export const GENRES = [
  'Drama', 'Comedy', 'Action', 'Romance', 'Thriller', 'Crime', 'Family',
  'Adventure', 'Horror', 'Mystery', 'History', 'Fantasy', 'Science Fiction',
  'War', 'Music', 'Animation', 'Sport', 'Biography',
];

export const CBFC_RATINGS = ['U', 'UA', 'A'];
export const MARKETING_BUDGETS = ['low', 'medium', 'high'];
export const MAX_SUPPORTING_ACTORS = 4;
export const DEFAULT_GENRES = ['Drama'];

// Labels for AuraPredictor's default assumed ratings (4/6/8, or 5/7/9 for a
// star lead — see BudgetRiskService). Anything else falls back to "Rated N".
const SCENARIO_LABELS = { 4: 'Poor reception', 5: 'Poor reception', 6: 'Good reception', 7: 'Good reception', 8: 'Blockbuster', 9: 'Blockbuster' };
export function scenarioLabel(rating) {
  return SCENARIO_LABELS[Math.round(rating)] ?? `Rated ${rating}`;
}

export function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

const CRORE = 1e7;
const LAKH = 1e5;

// Indian film budgets read naturally in crores/lakhs: 45,00,00,000 -> "₹45 Cr".
export function formatInr(value, { capped = false } = {}) {
  if (value == null || !Number.isFinite(value)) return '—';
  const plus = capped ? '+' : '';
  if (Math.abs(value) >= CRORE) {
    const cr = value / CRORE;
    return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: cr >= 100 ? 0 : cr >= 10 ? 1 : 2 })} Cr${plus}`;
  }
  if (Math.abs(value) >= LAKH) {
    return `₹${(value / LAKH).toLocaleString('en-IN', { maximumFractionDigits: 1 })} L${plus}`;
  }
  return `₹${Math.round(value).toLocaleString('en-IN')}${plus}`;
}

export function formatPercent(fraction) {
  if (fraction == null || !Number.isFinite(fraction)) return '—';
  return `${Math.round(fraction * 100)}%`;
}

// The budget field is typed in crores; the API wants whole rupees.
export function croresToInr(crores) {
  const n = Number(String(crores).replace(/,/g, ''));
  return String(crores).trim() !== '' && Number.isFinite(n) && n > 0 ? Math.round(n * CRORE) : null;
}

function blankToNull(value) {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' || trimmed == null ? null : trimmed;
}

// Form state -> BudgetRiskRequest. Optional fields that are empty are left
// out entirely so AuraService/AuraPredictor apply their own defaults.
export function buildBudgetRiskRequest(form) {
  const request = {
    movieName: form.movieName.trim(),
    releaseDate: form.releaseDate,
    language: form.languages.join(', '),
    estimatedBudget: croresToInr(form.budgetCrores),
    genre: form.genres.length ? form.genres.join(', ') : null,
    productionCompany: blankToNull(form.productionCompany),
    cbfcRating: form.cbfcRating,
    isRemake: form.isRemake,
    marketingBudget: form.marketingBudget,
    leadActor: blankToNull(form.leadActor),
    supportingActors: form.supportingActors.length ? form.supportingActors : null,
    director: blankToNull(form.director),
    musicDirector: blankToNull(form.musicDirector),
  };
  return Object.fromEntries(Object.entries(request).filter(([, v]) => v != null));
}

export function validateForm(form) {
  const errors = {};
  if (!form.movieName.trim()) errors.movieName = 'Give the film a name';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.releaseDate)) errors.releaseDate = 'Pick a planned release date';
  if (!form.languages.length) errors.languages = 'Choose at least one language';
  if (form.budgetCrores.trim() !== '' && croresToInr(form.budgetCrores) == null) {
    errors.budgetCrores = 'Enter a positive amount in crores';
  }
  return errors;
}

// "Last time they chose" genre memory, per user and per browser. There's no
// backend preferences store, so localStorage is the only option; any read or
// write failure (private mode, quota) just falls back to the default.
const genreKey = (username) => `investmentAdvisor:lastGenres:${username || 'anonymous'}`;

export function loadLastGenres(username) {
  try {
    const parsed = JSON.parse(localStorage.getItem(genreKey(username)));
    const valid = Array.isArray(parsed) ? parsed.filter((g) => GENRES.includes(g)) : [];
    return valid.length ? valid : DEFAULT_GENRES;
  } catch {
    return DEFAULT_GENRES;
  }
}

export function saveLastGenres(username, genres) {
  try {
    if (genres.length) localStorage.setItem(genreKey(username), JSON.stringify(genres));
  } catch {
    // Non-critical preference; ignore.
  }
}

// Case-insensitive name search for the credit pickers: prefix matches first,
// then word-start, then anywhere. Capped so a 3k-name list renders instantly.
export function searchNames(names, query, { exclude = [], limit = 40 } = {}) {
  const excluded = new Set(exclude.map((n) => n.toLowerCase()));
  const q = query.trim().toLowerCase();
  const pool = names.filter((n) => !excluded.has(n.toLowerCase()));
  if (!q) return pool.slice(0, limit);
  const prefix = [];
  const wordStart = [];
  const anywhere = [];
  for (const name of pool) {
    const lower = name.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === 0) prefix.push(name);
    else if (idx > 0 && lower[idx - 1] === ' ') wordStart.push(name);
    else if (idx > 0) anywhere.push(name);
    if (prefix.length >= limit) break;
  }
  return [...prefix, ...wordStart, ...anywhere].slice(0, limit);
}
