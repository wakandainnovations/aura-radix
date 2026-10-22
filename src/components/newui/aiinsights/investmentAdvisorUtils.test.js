import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBudgetRiskRequest,
  validateForm,
  formatInr,
  croresToInr,
  loadLastGenres,
  saveLastGenres,
  searchNames,
} from './investmentAdvisorUtils';

const baseForm = {
  movieName: '  New Film ',
  releaseDate: '2027-01-14',
  languages: ['telugu', 'hindi'],
  genres: ['Action', 'Drama'],
  cbfcRating: 'UA',
  isRemake: false,
  budgetCrores: '',
  marketingBudget: 'medium',
  productionCompany: '  ',
  leadActor: 'Allu Arjun',
  supportingActors: [],
  director: '',
  musicDirector: 'Devi Sri Prasad',
};

describe('buildBudgetRiskRequest', () => {
  it('joins multi-value fields original-first and drops empty optionals', () => {
    expect(buildBudgetRiskRequest(baseForm)).toEqual({
      movieName: 'New Film',
      releaseDate: '2027-01-14',
      language: 'telugu, hindi',
      genre: 'Action, Drama',
      cbfcRating: 'UA',
      isRemake: false,
      marketingBudget: 'medium',
      leadActor: 'Allu Arjun',
      musicDirector: 'Devi Sri Prasad',
    });
  });

  it('sends the crore budget as whole rupees in estimatedBudget', () => {
    const req = buildBudgetRiskRequest({ ...baseForm, budgetCrores: '45.5', supportingActors: ['A', 'B'] });
    expect(req.estimatedBudget).toBe(455_000_000);
    expect(req.supportingActors).toEqual(['A', 'B']);
  });
});

describe('validateForm', () => {
  it('requires name, ISO date and a language', () => {
    const errors = validateForm({ ...baseForm, movieName: ' ', releaseDate: '', languages: [] });
    expect(Object.keys(errors).sort()).toEqual(['languages', 'movieName', 'releaseDate']);
  });

  it('rejects a non-positive budget but allows a blank one', () => {
    expect(validateForm({ ...baseForm, budgetCrores: '0' }).budgetCrores).toBeDefined();
    expect(validateForm(baseForm)).toEqual({});
  });
});

describe('formatInr / croresToInr', () => {
  it('formats in crores and lakhs', () => {
    expect(formatInr(455_000_000)).toBe('₹45.5 Cr');
    expect(formatInr(2_500_000_000)).toBe('₹250 Cr');
    expect(formatInr(4_200_000)).toBe('₹42 L');
    expect(formatInr(90_000_000, { capped: true })).toBe('₹9 Cr+');
    expect(formatInr(null)).toBe('—');
  });

  it('parses crores, rejecting junk', () => {
    expect(croresToInr('1,200')).toBe(12_000_000_000);
    expect(croresToInr('')).toBeNull();
    expect(croresToInr('abc')).toBeNull();
  });
});

describe('genre memory', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to Drama the first time, then returns the last saved choice per user', () => {
    expect(loadLastGenres('ravi')).toEqual(['Drama']);
    saveLastGenres('ravi', ['Action', 'Thriller']);
    expect(loadLastGenres('ravi')).toEqual(['Action', 'Thriller']);
    expect(loadLastGenres('someone-else')).toEqual(['Drama']);
  });

  it('ignores corrupt or unknown stored values', () => {
    localStorage.setItem('investmentAdvisor:lastGenres:ravi', '{nope');
    expect(loadLastGenres('ravi')).toEqual(['Drama']);
    localStorage.setItem('investmentAdvisor:lastGenres:ravi', JSON.stringify(['Not A Genre']));
    expect(loadLastGenres('ravi')).toEqual(['Drama']);
  });
});

describe('searchNames', () => {
  const names = ['Allu Arjun', 'Arjun Kapoor', 'Arjun Sarja', 'Sanjay Dutt', 'Karjun'];

  it('ranks prefix, then word-start, then substring matches', () => {
    expect(searchNames(names, 'arjun')).toEqual(['Arjun Kapoor', 'Arjun Sarja', 'Allu Arjun', 'Karjun']);
  });

  it('excludes already-picked names case-insensitively', () => {
    expect(searchNames(names, 'arjun', { exclude: ['allu arjun'] })).not.toContain('Allu Arjun');
  });
});
