import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Switch from '@radix-ui/react-switch';
import { Sparkles, Loader2, RotateCcw, User, Clapperboard, Music, Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { CARD } from '../theme';
import ErrorState from '../shared/ErrorState';
import { predictionService, movieCreditsService } from '../../../api/predictionService';
import { entityService } from '../../../api/entityService';
import CreditCombobox from './CreditCombobox';
import { SelectMenu, MultiSelectMenu } from './Dropdowns';
import BudgetRiskResults, { ResultsLoadingState } from './BudgetRiskResults';
import {
  LANGUAGES,
  GENRES,
  CBFC_RATINGS,
  MARKETING_BUDGETS,
  MAX_SUPPORTING_ACTORS,
  buildBudgetRiskRequest,
  validateForm,
  loadLastGenres,
  saveLastGenres,
  capitalize,
  croresToInr,
} from './investmentAdvisorUtils';

const INPUT =
  'w-full h-9 px-3 bg-white/[0.04] border rounded-lg text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

const CBFC_OPTIONS = CBFC_RATINGS.map((r) => ({
  value: r,
  label: r,
  hint: { U: 'Universal', UA: 'Parental guidance', A: 'Adults only' }[r],
}));

const MARKETING_OPTIONS = MARKETING_BUDGETS.map((m) => ({
  value: m,
  label: capitalize(m),
  hint: { low: 'Organic buzz', medium: 'Typical campaign', high: 'Saturation, pan-India' }[m],
}));

// Name lists change only when the movie DB is reloaded, so fetch once per
// session. No retries: if the endpoint is missing, fall back to typing at once.
function useCredits(key, fetcher) {
  return useQuery({ queryKey: ['movie-credits', key], queryFn: fetcher, staleTime: Infinity, gcTime: Infinity, retry: false });
}

function initialForm(userName) {
  return {
    movieName: '',
    releaseDate: '',
    languages: [],
    genres: loadLastGenres(userName),
    cbfcRating: 'UA',
    isRemake: false,
    budgetCrores: '',
    marketingBudget: 'medium',
    productionCompany: '',
    leadActor: '',
    supportingActors: [],
    director: '',
    musicDirector: '',
  };
}

// Label row carries the required marker, an optional right-aligned note and
// the error, so fields never grow an extra line below and rows stay aligned.
function Field({ label, required, error, aside, className = '', children }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1 h-4">
        <label className="text-[11px] font-medium text-white/50 uppercase tracking-wide truncate">
          {label}
          {required && <span className="text-blue-400 ml-0.5">*</span>}
        </label>
        {error ? (
          <span className="flex items-center gap-1 text-[11px] text-red-400 truncate"><AlertCircle className="w-3 h-3 shrink-0" />{error}</span>
        ) : (
          aside && <span className="text-[11px] text-white/30 truncate">{aside}</span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function InvestmentAdvisorTab({ selectedMovie, userName }) {
  const [form, setForm] = useState(() => initialForm(userName));
  const [errors, setErrors] = useState({});
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const productionTouched = useRef(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const actors = useCredits('actors', movieCreditsService.getActors);
  const directors = useCredits('directors', movieCreditsService.getDirectors);
  const musicDirectors = useCredits('music-directors', movieCreditsService.getMusicDirectors);
  const companies = useCredits('production-companies', movieCreditsService.getProductionCompanies);

  // There's no user-profile endpoint, so the user's own movie entity is the
  // closest thing to "their" production company. Prefill once, and never
  // overwrite something the user typed or cleared.
  const { data: movieDetail } = useQuery({
    queryKey: ['entity-detail', selectedMovie?.id, 'movie', 'investment-advisor'],
    queryFn: () => entityService.getById(selectedMovie.id, 'movie'),
    enabled: selectedMovie?.id != null,
  });
  useEffect(() => {
    const company = movieDetail?.productionCompany?.trim();
    if (company && !productionTouched.current) {
      setForm((f) => (f.productionCompany ? f : { ...f, productionCompany: company }));
    }
  }, [movieDetail?.productionCompany]);

  const assess = useMutation({ mutationFn: predictionService.assessBudgetRisk });

  const currentRequest = useMemo(() => buildBudgetRiskRequest(form), [form]);
  const isStale = assess.data && submittedRequest && JSON.stringify(currentRequest) !== JSON.stringify(submittedRequest);

  function handleSubmit(e) {
    e.preventDefault();
    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    saveLastGenres(userName, form.genres);
    setSubmittedRequest(currentRequest);
    assess.mutate(currentRequest);
  }

  function handleReset() {
    productionTouched.current = false;
    setForm({ ...initialForm(userName), productionCompany: movieDetail?.productionCompany?.trim() ?? '' });
    setErrors({});
    setSubmittedRequest(null);
    assess.reset();
  }

  function setLeadActor(name) {
    setForm((f) => ({
      ...f,
      leadActor: name,
      supportingActors: f.supportingActors.filter((a) => a.toLowerCase() !== name.trim().toLowerCase()),
    }));
  }

  const budgetInr = croresToInr(form.budgetCrores);

  return (
    <div className="px-8 py-5 space-y-4">
      <form onSubmit={handleSubmit} noValidate className={`${CARD} p-4`}>
        <div className="grid grid-cols-2 xl:grid-cols-12 gap-x-3 gap-y-3">
          <Field label="Movie name" required error={errors.movieName} className="col-span-2 xl:col-span-3">
            <input
              value={form.movieName}
              onChange={(e) => set('movieName')(e.target.value)}
              placeholder="e.g. Untitled Diwali Actioner"
              className={`${INPUT} ${errors.movieName ? 'border-red-500/50' : 'border-white/10'}`}
            />
          </Field>
          <Field label="Release date" required error={errors.releaseDate && 'Required'} className="xl:col-span-2">
            <input
              type="date"
              value={form.releaseDate}
              onChange={(e) => set('releaseDate')(e.target.value)}
              className={`${INPUT} [color-scheme:dark] ${errors.releaseDate ? 'border-red-500/50' : 'border-white/10'}`}
            />
          </Field>
          <Field label="Language(s)" required error={errors.languages && 'Required'} aside="Original first" className="xl:col-span-3">
            <MultiSelectMenu
              ordered
              value={form.languages}
              onChange={set('languages')}
              options={LANGUAGES}
              formatLabel={capitalize}
              placeholder="Select languages"
              invalid={!!errors.languages}
            />
          </Field>
          <Field label="Genre(s)" className="xl:col-span-2">
            <MultiSelectMenu value={form.genres} onChange={set('genres')} options={GENRES} placeholder="Select genres" />
          </Field>
          <Field label="CBFC rating" className="xl:col-span-2">
            <SelectMenu ariaLabel="CBFC rating" value={form.cbfcRating} onChange={set('cbfcRating')} options={CBFC_OPTIONS} />
          </Field>

          <Field label="Lead actor" className="xl:col-span-3">
            <CreditCombobox
              names={actors.data}
              isLoading={actors.isLoading}
              isError={actors.isError}
              value={form.leadActor}
              onChange={setLeadActor}
              placeholder="Search or type a name"
              icon={User}
            />
          </Field>
          <Field label="Supporting actors" aside={`${form.supportingActors.length}/${MAX_SUPPORTING_ACTORS} · billing order`} className="col-span-2 xl:col-span-5">
            <CreditCombobox
              multiple
              max={MAX_SUPPORTING_ACTORS}
              names={actors.data}
              isLoading={actors.isLoading}
              isError={actors.isError}
              value={form.supportingActors}
              onChange={set('supportingActors')}
              exclude={form.leadActor.trim() ? [form.leadActor.trim()] : []}
              placeholder="Search, or type and press Enter"
            />
          </Field>
          <Field label="Director" className="xl:col-span-2">
            <CreditCombobox names={directors.data} isLoading={directors.isLoading} isError={directors.isError} value={form.director} onChange={set('director')} placeholder="Search or type" icon={Clapperboard} />
          </Field>
          <Field label="Music director" className="xl:col-span-2">
            <CreditCombobox names={musicDirectors.data} isLoading={musicDirectors.isLoading} isError={musicDirectors.isError} value={form.musicDirector} onChange={set('musicDirector')} placeholder="Search or type" icon={Music} />
          </Field>

          <Field label="Production company" className="col-span-2 xl:col-span-3">
            <CreditCombobox
              names={companies.data}
              isLoading={companies.isLoading}
              isError={companies.isError}
              value={form.productionCompany}
              onChange={(v) => {
                productionTouched.current = true;
                set('productionCompany')(v);
              }}
              placeholder="Search or type"
              icon={Building2}
            />
          </Field>
          <Field
            label="Est. budget"
            error={errors.budgetCrores && 'Invalid amount'}
            aside={budgetInr ? `₹${budgetInr.toLocaleString('en-IN')}` : 'Optional'}
            className="xl:col-span-2"
          >
            <div className={`flex items-center ${INPUT} p-0 ${errors.budgetCrores ? 'border-red-500/50' : 'border-white/10'} focus-within:ring-1 focus-within:ring-blue-500`}>
              <span className="pl-3 text-white/40 text-sm">₹</span>
              <input
                inputMode="decimal"
                value={form.budgetCrores}
                onChange={(e) => set('budgetCrores')(e.target.value.replace(/[^\d.,]/g, ''))}
                placeholder="45"
                className="flex-1 min-w-0 bg-transparent px-2 text-sm text-white/90 placeholder:text-white/25 outline-none"
              />
              <span className="pr-3 text-xs text-white/40">Cr</span>
            </div>
          </Field>
          <Field label="Marketing budget" className="xl:col-span-2">
            <SelectMenu ariaLabel="Marketing budget" value={form.marketingBudget} onChange={set('marketingBudget')} options={MARKETING_OPTIONS} />
          </Field>
          <Field label="Remake" className="xl:col-span-1">
            <label className="h-9 flex items-center gap-2 cursor-pointer">
              <Switch.Root
                checked={form.isRemake}
                onCheckedChange={set('isRemake')}
                aria-label="Remake"
                className="relative w-9 h-5 rounded-full bg-white/15 data-[state=checked]:bg-blue-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Switch.Thumb className="block w-4 h-4 rounded-full bg-white shadow translate-x-0.5 data-[state=checked]:translate-x-[18px] transition-transform" />
              </Switch.Root>
              <span className="text-sm text-white/60">{form.isRemake ? 'Yes' : 'No'}</span>
            </label>
          </Field>
          <div className="col-span-2 xl:col-span-4 flex items-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Start over"
              className="h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={assess.isPending}
              className="flex-1 h-9 flex items-center justify-center gap-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-60"
            >
              {assess.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {assess.isPending ? 'Assessing…' : assess.data ? 'Re-assess investment' : 'Assess investment'}
            </button>
          </div>
        </div>
      </form>

      {isStale && !assess.isPending && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-2 text-xs text-amber-200/90">
          <span>You've changed the inputs since this assessment.</span>
          <button type="button" onClick={handleSubmit} className="flex items-center gap-1.5 font-semibold text-amber-200 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" /> Update
          </button>
        </div>
      )}
      {assess.isPending ? (
        <ResultsLoadingState />
      ) : assess.isError ? (
        <div className={`${CARD} p-6`}>
          <ErrorState error={assess.error} label="the investment assessment" />
        </div>
      ) : assess.data ? (
        <div className={isStale ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <BudgetRiskResults result={assess.data} />
        </div>
      ) : null}
    </div>
  );
}
