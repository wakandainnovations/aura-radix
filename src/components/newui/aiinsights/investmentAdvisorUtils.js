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

// "an 8/10", "a 6/10" — ratings are read aloud as numbers.
export function withArticle(rating) {
  return `${/^(8|11|18)/.test(String(rating)) ? 'an' : 'a'} ${rating}`;
}

// The budget bands behind the whole decision, shared by the on-screen range
// bar and the PDF report. The middle assumed rating's max budget is the safe
// line (a hit is still more likely than not with an average reception); the
// top rating's max budget is the ceiling, reachable only if the film is loved.
export function budgetBands(assessments) {
  const sorted = [...assessments].sort((a, b) => a.rating - b.rating);
  const middle = sorted[Math.floor(sorted.length / 2)];
  const top = sorted[sorted.length - 1];
  const safe = middle?.maxBudget ?? null;
  const ceiling = top?.maxBudget ?? null;
  const planned = sorted.find((a) => a.plannedBudget != null)?.plannedBudget ?? null;
  const zone = planned == null ? null
    : safe != null && planned <= safe ? 'safe'
    : ceiling != null && planned <= ceiling ? 'opportunity'
    : 'risk';
  return { sorted, middle, top, safe, ceiling, planned, zone };
}

// Plain-English headline for the whole result, so a producer gets the answer
// before reading any numbers. Null when no budget was entered.
export function summarizeVerdict(assessments) {
  const { sorted, planned } = budgetBands(assessments);
  if (planned == null) return null;
  const wins = sorted.filter((a) => a.verdict === 'OPPORTUNITY');
  const amount = formatInr(planned);
  if (wins.length === sorted.length) {
    return { tone: 'good', title: `${amount} looks like a strong bet`, body: 'It clears the 2× hit bar in every audience scenario we modelled.' };
  }
  if (!wins.length) {
    return { tone: 'bad', title: `${amount} is a risky spend`, body: 'Even with a blockbuster reception, the model gives it less than an even chance of doubling its budget.' };
  }
  return {
    tone: 'mixed',
    title: `${amount} works if the film lands`,
    body: `It's an opportunity from ${withArticle(wins[0].rating)}/10 reception upward, and a risk below that.`,
  };
}

// Round the axis up to a friendly crore figure so tick labels read cleanly.
export function niceCeiling(value) {
  const steps = [1e6, 2.5e6, 5e6, 1e7, 2.5e7, 5e7, 1e8, 2.5e8, 5e8, 1e9, 2.5e9, 5e9, 1e10, 2.5e10, 5e10];
  const step = steps.find((s) => value / s <= 5) ?? steps[steps.length - 1];
  return Math.ceil(value / step) * step;
}
