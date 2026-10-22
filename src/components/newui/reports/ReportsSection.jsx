import { useState } from 'react';
import { FileText, Sparkles, Trash2, ExternalLink } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import { CARD } from '../theme';
import ReportActions from './ReportActions';
import { openReportPdf } from './reportPdf';
import { REPORT_KIND_LABELS, deleteReport, loadReports } from './reportsStore';
import { summarizeVerdict } from '../aiinsights/investmentAdvisorUtils';

const TONE_TEXT = { good: 'text-emerald-300', mixed: 'text-amber-300', bad: 'text-red-300' };

function formatCreated(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
}

function ReportCard({ report, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const verdict = summarizeVerdict(report.result?.assessments ?? []);

  return (
    <div className={`${CARD} p-4 flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
          <FileText className="w-4.5 h-4.5" />
        </div>
        <button
          type="button"
          onClick={() => openReportPdf(report).catch((e) => console.error('Failed to open report:', e))}
          title="Open the PDF in a new tab"
          className="min-w-0 flex-1 text-left group"
        >
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-white/90 truncate group-hover:text-white">{report.title}</h3>
            <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 shrink-0" />
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">
            {REPORT_KIND_LABELS[report.kind] ?? 'Report'} · {formatCreated(report.createdAt)}
          </div>
        </button>
        {confirming ? (
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => onDelete(report.id)} className="px-2 h-7 rounded-md bg-red-500/20 text-red-300 text-[11px] font-semibold hover:bg-red-500/30">
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="px-2 h-7 rounded-md text-white/50 text-[11px] hover:text-white">
              Keep
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} title="Delete report" className="p-1.5 rounded-md text-white/30 hover:text-red-300 hover:bg-white/[0.05] shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {verdict && <p className={`text-sm font-medium ${TONE_TEXT[verdict.tone]}`}>{verdict.title}</p>}

      <div className="mt-auto pt-3 border-t border-white/[0.06] flex justify-end">
        <ReportActions report={report} compact />
      </div>
    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} onDelete={(id) => setReports(deleteReport(userName, id))} />
            ))}
          </div>
        ) : (
          <div className={`${CARD} px-6 py-12 flex flex-col items-center text-center`}>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-white/90">No reports yet</h2>
            <p className="mt-1 text-sm text-white/45 max-w-sm">
              Run Assess investment in AI Insights and the report is saved here as a PDF you can download or share on WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('ai-insights')}
              className="mt-4 h-9 flex items-center gap-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" /> Go to AI Insights
            </button>
          </div>
        )}
        <p className="mt-4 text-[11px] text-white/30">Reports are kept in this browser, up to the 50 most recent.</p>
      </div>
    </>
  );
}
