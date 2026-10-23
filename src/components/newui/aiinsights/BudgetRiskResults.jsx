import {
  TrendingUp,
  AlertTriangle,
  Rocket,
  Star,
  Calendar,
  Languages,
  Target,
  Lightbulb,
  User,
  Music,
  Check,
} from 'lucide-react';
import { CARD } from '../theme';
import { budgetBands, capitalize, formatInr, niceCeiling, scenarioLabel, summarizeVerdict } from './investmentAdvisorUtils';

const VERDICT_STYLE = {
  OPPORTUNITY: {
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    ring: '#34d399',
    label: 'Opportunity',
    Icon: TrendingUp,
  },
  RISK: {
    pill: 'bg-red-500/15 text-red-300 border-red-500/30',
    ring: '#f87171',
    label: 'Risk',
    Icon: AlertTriangle,
  },
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TONE_STYLE = {
  good: { wrap: 'from-emerald-500/[0.14] via-emerald-500/[0.04] border-emerald-500/25', icon: 'bg-emerald-500/20 text-emerald-300', Icon: TrendingUp },
  bad: { wrap: 'from-red-500/[0.14] via-red-500/[0.04] border-red-500/25', icon: 'bg-red-500/20 text-red-300', Icon: AlertTriangle },
  mixed: { wrap: 'from-amber-500/[0.14] via-amber-500/[0.04] border-amber-500/25', icon: 'bg-amber-500/20 text-amber-300', Icon: Target },
};

function VerdictHero({ result, actions }) {
  // Only an entered budget has a verdict worth headlining.
  const verdict = summarizeVerdict(result.assessments);
  if (!verdict) return actions ? <div className="flex justify-end">{actions}</div> : null;
  const { tone, title, body } = verdict;
  const style = TONE_STYLE[tone];
  return (
    <div className={`rounded-2xl border bg-gradient-to-r to-transparent px-4 py-3.5 flex items-center gap-4 flex-wrap ${style.wrap}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.icon}`}>
        <style.Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-white leading-snug">{title}</h2>
        <p className="text-xs text-white/55 mt-0.5">{body}</p>
      </div>
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-white/45">
        <span className="text-white/80 font-medium">{result.movieName}</span>
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(result.releaseDate)}</span>
        <span className="flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5" />
          {String(result.language ?? '').split(',').map((l) => capitalize(l.trim())).join(' · ')}
        </span>
      </div>
      {actions}
    </div>
  );
}

const ZONE_STYLE = {
  safe: { label: 'Safe', pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  opportunity: { label: 'Opportunity', pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  risk: { label: 'Risk', pill: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

function BudgetStat({ dot, label, value, children }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/40">
        <span className={`w-2 h-2 rounded-sm ${dot}`} />{label}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xl font-bold text-white">{value}</span>
        {children}
      </div>
    </div>
  );
}

// One bar for the whole decision (see budgetBands): green up to the safe
// line, amber up to the ceiling, red beyond.
function BudgetRange({ assessments }) {
  const { sorted, middle, top, safe, ceiling, planned, zone } = budgetBands(assessments);

  const domain = niceCeiling(Math.max(safe ?? 0, ceiling ?? 0, planned ?? 0, 1e7) * 1.15);
  const pct = (v) => `${Math.min(100, (v / domain) * 100)}%`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * domain);

  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">Budget range</h3>
        <div className="flex items-center gap-3 text-[11px] text-white/45">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/80" />Safe</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/75" />Opportunity</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400/40" />Risk</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
        <BudgetStat
          dot="bg-emerald-400"
          label="Safe budget"
          value={safe == null ? '—' : formatInr(safe, { capped: middle.maxBudgetCapped })}
        />
        <BudgetStat
          dot="bg-amber-400"
          label="Max opportunity"
          value={ceiling == null ? '—' : formatInr(ceiling, { capped: top.maxBudgetCapped })}
        />
        {planned != null && (
          <BudgetStat dot="bg-white" label="Your budget" value={formatInr(planned)}>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${ZONE_STYLE[zone].pill}`}>{ZONE_STYLE[zone].label}</span>
          </BudgetStat>
        )}
      </div>

      <div className={`relative ${planned != null ? 'mt-7' : 'mt-4'}`}>
        <div className="relative h-8 rounded-lg overflow-hidden bg-red-400/[0.16]">
          {ceiling != null && (
            <div className="absolute inset-y-0 left-0 bg-amber-400/70 transition-[width] duration-700" style={{ width: pct(ceiling) }} />
          )}
          {safe != null && (
            <div className="absolute inset-y-0 left-0 bg-emerald-400/80 transition-[width] duration-700" style={{ width: pct(safe) }} />
          )}
          {ceiling == null && (
            <div className="absolute inset-0 flex items-center pl-3 text-xs font-medium text-red-200/80">Risky at any budget</div>
          )}
        </div>
        {planned != null && (
          <div className="pointer-events-none absolute -top-1 -bottom-1 w-0 border-l-2 border-dashed border-white/90" style={{ left: pct(planned) }}>
            <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-px text-[10px] font-bold text-[#05070d]">
              {formatInr(planned)}
            </span>
          </div>
        )}
      </div>

      <div className="relative h-4 mt-1.5">
        {ticks.map((t, i) => (
          <span
            key={t}
            className={`absolute whitespace-nowrap text-[10px] text-white/30 ${i === 0 ? '' : i === ticks.length - 1 ? '-translate-x-full' : '-translate-x-1/2'}`}
            style={{ left: pct(t) }}
          >
            {t === 0 ? '₹0' : formatInr(t)}
          </span>
        ))}
      </div>

      {sorted.some((a) => a.verdict) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          {[...sorted].reverse().map((a) => {
            const verdict = VERDICT_STYLE[a.verdict];
            return (
              <div key={a.rating} className="flex items-center gap-3 rounded-lg bg-white/[0.025] border border-white/[0.05] px-3 py-2">
                <div className="shrink-0">
                  <div className="flex items-center gap-1 text-sm font-semibold text-white/85">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{a.rating}/10
                  </div>
                  <div className="text-[10px] text-white/35">{scenarioLabel(a.rating)}</div>
                </div>
                {verdict && (
                  <span className={`ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${verdict.pill}`}>
                    <verdict.Icon className="w-3 h-3" />{verdict.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BreakoutCard({ breakout }) {
  if (!breakout?.assessments?.length) return null;
  return (
    <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-500/[0.12] via-fuchsia-500/[0.04] to-transparent px-4 py-3 flex items-center gap-4 flex-wrap">
      <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0">
        <Rocket className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1 basis-80">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/90">Breakout upside</h3>
          <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">BEST CASE</span>
        </div>
        <p className="text-[11px] text-white/45 mt-0.5 leading-relaxed">{breakout.note}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[...breakout.assessments].sort((a, b) => a.rating - b.rating).map((a) => {
          const verdict = VERDICT_STYLE[a.verdict];
          return (
            <div key={a.rating} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 min-w-[120px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/55">{a.rating}/10</span>
                {verdict && <span className={`text-[9px] font-bold uppercase px-1 py-px rounded border ${verdict.pill}`}>{verdict.label}</span>}
              </div>
              <div className="text-sm font-semibold text-white">
                {a.maxBudget == null ? <span className="text-white/40 text-xs">Risky at any</span> : <>≤ {formatInr(a.maxBudget, { capped: a.maxBudgetCapped })}</>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ALTERNATIVE_ROLES = [
  { key: 'leadActors', role: 'leadActor', title: 'Lead actor', Icon: User },
  { key: 'musicDirectors', role: 'musicDirector', title: 'Music director', Icon: Music },
];

function scopeText(scope) {
  return !scope || scope === 'pan-india' ? 'across Indian films' : `in ${capitalize(scope)} films`;
}

// Lead actors / music directors who'd make the film likelier to be a hit,
// best first, each backed by their best film at a similar budget. Only sent
// when a budget was entered. `onUse(role, name)` swaps one into the form.
function AlternativesCard({ alternatives, current = {}, onUse }) {
  const groups = ALTERNATIVE_ROLES.map((g) => ({ ...g, people: alternatives?.[g.key] ?? [] })).filter((g) => g.people.length);
  if (!groups.length) return null;
  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-300 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white/90">Recommended alternatives</h3>
          <p className="text-[11px] text-white/45 mt-0.5">
            Talent who would give this film a better shot, each with a hit at a similar budget {scopeText(alternatives.languageScope)}.
          </p>
        </div>
      </div>
      <div className={`grid grid-cols-1 ${groups.length > 1 ? 'lg:grid-cols-2' : ''} gap-4 mt-3`}>
        {groups.map(({ key, role, title, Icon, people }) => (
          <div key={key}>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/50 uppercase tracking-wide mb-1.5">
              <Icon className="w-3.5 h-3.5" />{title}
            </div>
            <ul className="space-y-1.5">
              {people.map((p, i) => {
                const film = p.similarBudgetFilm;
                const inUse = (current[role] ?? '').trim().toLowerCase() === p.name.toLowerCase();
                return (
                  <li key={p.name} className="flex items-center gap-3 rounded-lg bg-white/[0.025] border border-white/[0.05] px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white/90 truncate">{p.name}</span>
                        {i === 0 && <span className="text-[9px] font-bold uppercase px-1 py-px rounded border bg-sky-500/15 text-sky-300 border-sky-500/30">Top pick</span>}
                      </div>
                      {film && (
                        <div className="text-[11px] text-white/45 truncate">
                          {film.movieName}{film.releaseDate ? ` (${film.releaseDate.slice(0, 4)})` : ''} · {formatInr(film.budget)} budget → {formatInr(film.revenue)} gross
                        </div>
                      )}
                    </div>
                    {onUse && (
                      <button
                        type="button"
                        onClick={() => onUse(role, p.name)}
                        disabled={inUse}
                        className="shrink-0 h-7 flex items-center gap-1 px-2.5 rounded-md text-[11px] font-semibold border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.1] hover:text-white disabled:opacity-60 disabled:hover:bg-white/[0.04] transition-colors"
                      >
                        {inUse ? <><Check className="w-3 h-3" />In use</> : 'Use'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// `actions` (e.g. Download PDF / Share) sits at the right of the verdict row.
// `current` holds the form's lead actor / music director so a recommendation
// already swapped in shows as in use.
export default function BudgetRiskResults({ result, actions, current, onUseAlternative }) {
  const assessments = [...(result.assessments ?? [])].sort((a, b) => a.rating - b.rating);
  return (
    <div className="space-y-4">
      <VerdictHero result={{ ...result, assessments }} actions={actions} />
      <BudgetRange assessments={assessments} />
      <BreakoutCard breakout={result.breakout} />
      <AlternativesCard alternatives={result.alternatives} current={current} onUse={onUseAlternative} />
    </div>
  );
}

export function ResultsLoadingState() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-blue-500" />
          </span>
          Scoring your film across audience scenarios…
        </div>
        <div className="mt-4 h-6 w-2/3 rounded bg-white/[0.06] animate-pulse" />
        <div className="mt-2 h-4 w-1/2 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className={`${CARD} h-56 animate-pulse`} />
    </div>
  );
}
