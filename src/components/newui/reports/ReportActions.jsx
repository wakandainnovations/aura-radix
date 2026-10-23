import { useEffect, useState } from 'react';
import { Download, Loader2, MessageCircle } from 'lucide-react';
import { downloadReportPdf, preloadPdfLibrary, shareReportOnWhatsApp } from './reportPdf';

const BUTTON =
  'h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60';

const STATUS_TEXT = {
  downloaded: 'PDF downloaded. Attach it in the WhatsApp chat that just opened.',
  error: "Couldn't build the PDF. Try again.",
};

// Download PDF + Share (via WhatsApp) for one saved report. Used under the
// Investment Advisor results and on every card in the Reports section.
export default function ReportActions({ report, compact = false }) {
  const [busy, setBusy] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    preloadPdfLibrary().catch(() => {});
  }, []);

  async function run(kind, action) {
    setBusy(kind);
    setStatus(null);
    try {
      const outcome = await action(report);
      if (outcome === 'downloaded') setStatus('downloaded');
    } catch (error) {
      console.error(`Failed to ${kind} report:`, error);
      setStatus('error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => run('download', downloadReportPdf)}
          disabled={busy != null}
          className={`${BUTTON} bg-white/[0.06] border border-white/10 text-white/80 hover:bg-white/[0.1] hover:text-white`}
        >
          {busy === 'download' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {compact ? 'PDF' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={() => run('share', shareReportOnWhatsApp)}
          disabled={busy != null}
          className={`${BUTTON} bg-emerald-600/90 hover:bg-emerald-500 text-white`}
        >
          {busy === 'share' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
          Share
        </button>
      </div>
      {status && (
        <p role="status" className={`text-[11px] ${status === 'error' ? 'text-red-400' : 'text-white/50'}`}>
          {STATUS_TEXT[status]}
        </p>
      )}
    </div>
  );
}
