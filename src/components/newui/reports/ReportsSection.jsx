import { useEffect, useRef, useState } from 'react';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import { FileText, Sparkles, Trash2, ExternalLink, Clapperboard, Loader2, AlertCircle } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { CARD, thClass, tdClass, trClass } from '../theme';
import { formatCompact } from '../formatCompact';
import ReportActions from './ReportActions';
import { openReportPdf } from './reportPdf';
import { REPORT_KIND_LABELS, deleteReport, loadReports } from './reportsStore';
import { ReportNotEntitledError, generateMovieReport, movieReportSummary } from './movieReport';
import { budgetBands, capitalize, formatInr } from '../aiinsights/investmentAdvisorUtils';

const TH = `${thClass} whitespace-nowrap`;
const GENERATE_KEY = ['generate-movie-report'];

const PILL = 'inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase whitespace-nowrap';
const GOOD = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
const WARN = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
const BAD = 'bg-red-500/15 text-red-300 border-red-500/30';

const ZONE_PILL = {
  safe: { label: 'Safe', className: GOOD },
  opportunity: { label: 'Opportunity', className: WARN },
  risk: { label: 'Risk', className: BAD },
};
const HEALTH_PILL = { Excellent: GOOD, Good: GOOD, Fair: WARN, Average: WARN, Poor: BAD, Critical: BAD };

const KIND_ICON = {
  'investment-advisor': { Icon: Sparkles, className: 'bg-violet-500/15 text-violet-300' },
  'movie-intelligence': { Icon: Clapperboard, className: 'bg-blue-500/15 text-blue-400' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'movie-intelligence', label: 'Movie reports' },
  { key: 'investment-advisor', label: 'Investment Advisor' },
];

function formatDate(iso, withTime = false) {
  if (!iso) return '—';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return withTime ? `${date}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : date;
}

// What each kind shows in the details line, Summary cell and Release column.
function describe(report) {
  if (report.kind === 'movie-intelligence') {
    const data = report.data ?? {};
    const e = data.entity ?? {};
    const s = movieReportSummary(data);
    return {
      details: [e.language, e.genre?.join(', '), e.director && `Dir. ${e.director}`].filter(Boolean).join(' · '),
      pill: s.healthLabel && { label: `${s.healthLabel}${s.healthPct != null ? ` ${s.healthPct}%` : ''}`, className: HEALTH_PILL[s.healthLabel] ?? WARN },
      figures: [
        s.mentions != null && `${formatCompact(s.mentions)} mentions`,
        s.positivePct != null && `${s.positivePct}% positive`,
        s.rank != null && s.totalTracked > 1 && `#${s.rank} of ${s.totalTracked}`,
      ].filter(Boolean).join(' · '),
      releaseDate: e.releaseDate,
    };
  }
  const { result = {}, request = {} } = report;
  const { safe, ceiling, planned, zone, middle, top } = budgetBands(result.assessments ?? []);
  const languages = String(result.language ?? '').split(',').map((l) => capitalize(l.trim())).filter(Boolean).join(', ');
  return {
    details: [languages, request.genre].filter(Boolean).join(' · '),
    pill: zone && ZONE_PILL[zone],
    figures: [
      planned != null && `Your ${formatInr(planned)}`,
      `Safe ${safe == null ? '—' : formatInr(safe, { capped: middle?.maxBudgetCapped })}`,
      `Max ${ceiling == null ? 'risky at any' : formatInr(ceiling, { capped: top?.maxBudgetCapped })}`,
    ].filter(Boolean).join(' · '),
    releaseDate: result.releaseDate,
  };
}

function ReportRow({ report, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const { details, pill, figures, releaseDate } = describe(report);
  const icon = KIND_ICON[report.kind] ?? KIND_ICON['investment-advisor'];

  return (
    <tr className={`${trClass} hover:bg-white/[0.02]`}>
      <td className={`${tdClass} min-w-[220px]`}>
        <button
          type="button"
          onClick={() => openReportPdf(report).catch((e) => console.error('Failed to open report:', e))}
          title="Open the PDF in a new tab"
          className="flex items-start gap-3 text-left group min-w-0"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${icon.className}`}>
            <icon.Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white/90 group-hover:text-white">{report.title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 shrink-0" />
            </div>
            <div className="text-[11px] text-white/40 mt-0.5 truncate max-w-[220px]" title={details}>
              {[REPORT_KIND_LABELS[report.kind] ?? 'Report', details].filter(Boolean).join(' · ')}
            </div>
          </div>
        </button>
      </td>
      <td className={tdClass}>
        <div className="flex items-center gap-2.5 min-w-0">
          {pill ? <span className={`${PILL} ${pill.className}`}>{pill.label}</span> : null}
          <span className="text-[13px] text-white/75 whitespace-nowrap">{figures}</span>
        </div>
      </td>
      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(releaseDate)}</td>
      <td className={`${tdClass} whitespace-nowrap text-white/50`}>
        <div>{formatDate(report.createdAt, true)}</div>
        {report.preparedBy && <div className="text-[11px] text-white/35">by {report.preparedBy}</div>}
      </td>
      <td className={tdClass}>
        <div className="flex items-start justify-end gap-2">
          <ReportActions report={report} compact />
          {confirming ? (
            <div className="flex items-center gap-1 h-8">
              <button type="button" onClick={() => onDelete(report.id)} className="px-2 h-7 rounded-md bg-red-500/20 text-red-300 text-[11px] font-semibold hover:bg-red-500/30">
                Delete
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="px-2 h-7 rounded-md text-white/50 text-[11px] hover:text-white">
                Keep
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} title="Delete report" className="h-8 w-8 flex items-center justify-center rounded-md text-white/30 hover:text-red-300 hover:bg-white/[0.05]">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function GeneratingRow({ movieName }) {
  return (
    <tr className={trClass}>
      <td className={tdClass} colSpan={5}>
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="font-semibold text-white/85">Building the movie report{movieName ? ` for ${movieName}` : ''}…</div>
            <div className="text-[11px] text-white/40 mt-0.5">
              Pulling today's sentiment, audience, influencer and competitor data. This takes about a minute; you can leave this page.
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

function errorMessage(error) {
  if (error instanceof ReportNotEntitledError) {
    return `The full movie report is part of the ${capitalize(String(error.requiredTier ?? 'Diamond').toLowerCase())} plan. Upgrade to generate it.`;
  }
  return "Couldn't generate the movie report. Please try again.";
}

export default function ReportsSection({ selectedMovie, userName, onNavigate }) {
  const [reports, setReports] = useState(() => loadReports(userName));
  const [filter, setFilter] = useState('all');
  const [generatingName, setGeneratingName] = useState(null);

  const generate = useMutation({
    mutationKey: GENERATE_KEY,
    mutationFn: generateMovieReport,
  });
  // Generation outlives this page (the report is saved inside
  // generateMovieReport), so the pending state comes from the mutation cache,
  // and the list reloads whenever a generation finishes.
  const generatingCount = useIsMutating({ mutationKey: GENERATE_KEY });
  const wasGenerating = useRef(generatingCount > 0);
  useEffect(() => {
    if (wasGenerating.current && generatingCount === 0) setReports(loadReports(userName));
    wasGenerating.current = generatingCount > 0;
  }, [generatingCount, userName]);

  function handleGenerate() {
    if (!selectedMovie) return;
    setGeneratingName(selectedMovie.name);
    setFilter('all');
    generate.mutate({ movie: selectedMovie, username: userName });
  }

  const isGenerating = generatingCount > 0;
  const visible = filter === 'all' ? reports : reports.filter((r) => (r.kind ?? 'investment-advisor') === filter);

  const generateButton = (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={!selectedMovie || isGenerating}
      title={selectedMovie ? `Everything FRAMEHOUSE knows about ${selectedMovie.name}, as a shareable PDF` : 'Pick a movie first'}
      className="h-10 flex items-center gap-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-60"
    >
      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
      {isGenerating ? 'Generating…' : `Generate movie report${selectedMovie ? `: ${selectedMovie.name}` : ''}`}
    </button>
  );

  return (
    <>
      <SectionHeader
        title="Reports"
        subtitle="Every report you've generated, ready to download or send to the team."
        hideDateCompareShare
        actionButton={generateButton}
      />
      <div className="px-8 py-5 space-y-4">
        {generate.isError && !isGenerating && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-2.5 text-sm text-red-200/90">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage(generate.error)}
          </div>
        )}

        {reports.length || isGenerating ? (
          <>
            <div className="flex items-center gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                    filter === f.key ? 'bg-blue-600/20 text-blue-300' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className={`${CARD} px-5 pt-4 pb-1 overflow-x-auto`}>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={TH}>Report</th>
                    <th className={TH}>Summary</th>
                    <th className={TH}>Release</th>
                    <th className={TH}>Created</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isGenerating && filter !== 'investment-advisor' && <GeneratingRow movieName={generatingName ?? selectedMovie?.name} />}
                  {visible.map((r) => (
                    <ReportRow key={r.id} report={r} onDelete={(id) => setReports(deleteReport(userName, id))} />
                  ))}
                  {!visible.length && !isGenerating && (
                    <tr className={trClass}>
                      <td className={`${tdClass} text-white/40`} colSpan={5}>No reports of this type yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className={`${CARD} px-6 py-12 flex flex-col items-center text-center`}>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-white/90">No reports yet</h2>
            <p className="mt-1 text-sm text-white/45 max-w-md">
              Generate a movie report for {selectedMovie?.name ?? 'your movie'} above, or run Assess investment in Investment Advisor.
              Every report is saved here as a PDF you can download or share on WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('ai-insights')}
              className="mt-4 h-9 flex items-center gap-2 px-4 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white/85 text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" /> Go to Investment Advisor
            </button>
          </div>
        )}
        <p className="text-[11px] text-white/30">Reports are kept in this browser, up to the 50 most recent.</p>
      </div>
    </>
  );
}
