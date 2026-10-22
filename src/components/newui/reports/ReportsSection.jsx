import { useState } from 'react';
import { FileText, Sparkles, Trash2, ExternalLink } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { CARD, thClass, tdClass, trClass } from '../theme';
import ReportActions from './ReportActions';
import { openReportPdf } from './reportPdf';
import { REPORT_KIND_LABELS, deleteReport, loadReports } from './reportsStore';
import { budgetBands, capitalize, formatInr } from '../aiinsights/investmentAdvisorUtils';

const TH = `${thClass} whitespace-nowrap`;

const ZONE_PILL = {
  safe: { label: 'Safe', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  opportunity: { label: 'Opportunity', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  risk: { label: 'Risk', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

function formatDate(iso, withTime = false) {
  if (!iso) return '—';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return withTime ? `${date}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : date;
}

function ReportRow({ report, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const { result = {}, request = {} } = report;
  const { safe, ceiling, planned, zone, middle, top } = budgetBands(result.assessments ?? []);
  const languages = String(result.language ?? '').split(',').map((l) => capitalize(l.trim())).filter(Boolean).join(', ');
  const details = [languages, request.genre].filter(Boolean).join(' · ');

  return (
    <tr className={`${trClass} hover:bg-white/[0.02]`}>
      <td className={`${tdClass} min-w-[220px]`}>
        <button
          type="button"
          onClick={() => openReportPdf(report).catch((e) => console.error('Failed to open report:', e))}
          title="Open the PDF in a new tab"
          className="flex items-start gap-3 text-left group min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
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
        {zone ? (
          <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${ZONE_PILL[zone].className}`}>
            {ZONE_PILL[zone].label}
          </span>
        ) : (
          <span className="text-white/35">—</span>
        )}
      </td>
      <td className={`${tdClass} whitespace-nowrap font-semibold text-white/90`}>{planned == null ? '—' : formatInr(planned)}</td>
      <td className={`${tdClass} whitespace-nowrap`}>{safe == null ? '—' : formatInr(safe, { capped: middle?.maxBudgetCapped })}</td>
      <td className={`${tdClass} whitespace-nowrap`}>{ceiling == null ? 'Risky at any' : formatInr(ceiling, { capped: top?.maxBudgetCapped })}</td>
      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(result.releaseDate)}</td>
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

export default function ReportsSection({ userName, onNavigate }) {
  const [reports, setReports] = useState(() => loadReports(userName));

  return (
    <>
      <SectionHeader
        title="Reports"
        subtitle="Every report you've generated, ready to download or send to the team."
        hideDateCompareShare
      />
      <div className="px-8 py-5">
        {reports.length ? (
          <div className={`${CARD} px-5 pt-4 pb-1 overflow-x-auto`}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Report</th>
                  <th className={TH}>Verdict</th>
                  <th className={TH}>Your budget</th>
                  <th className={TH}>Safe budget</th>
                  <th className={TH}>Max opportunity</th>
                  <th className={TH}>Release</th>
                  <th className={TH}>Created</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <ReportRow key={r.id} report={r} onDelete={(id) => setReports(deleteReport(userName, id))} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`${CARD} px-6 py-12 flex flex-col items-center text-center`}>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-white/90">No reports yet</h2>
            <p className="mt-1 text-sm text-white/45 max-w-sm">
              Run Assess investment in Investment Advisor and the report is saved here as a PDF you can download or share on WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('ai-insights')}
              className="mt-4 h-9 flex items-center gap-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" /> Go to Investment Advisor
            </button>
          </div>
        )}
        <p className="mt-4 text-[11px] text-white/30">Reports are kept in this browser, up to the 50 most recent.</p>
      </div>
    </>
  );
}
