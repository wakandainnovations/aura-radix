import { createWriter } from './pdfKit';
import { drawInvestmentReport, investmentFileName, investmentShareText } from './investmentReportPdf';
import { drawMovieReport, movieFileName, movieShareText } from './movieReportPdf';

// jsPDF is ~350 KB, so it's loaded on first use. Report actions call
// preloadPdfLibrary() on mount: navigator.share() must run soon after the
// click, and a cold import could outlast the browser's user-activation window.
let jsPdfModule;
export function preloadPdfLibrary() {
  jsPdfModule ??= import('jspdf');
  return jsPdfModule;
}

// Per-kind layout, file name and WhatsApp message.
const KINDS = {
  'investment-advisor': { draw: drawInvestmentReport, fileName: investmentFileName, shareText: investmentShareText, label: 'Investment Advisor' },
  'movie-intelligence': { draw: drawMovieReport, fileName: movieFileName, shareText: movieShareText, label: 'Movie Report' },
};
const kindOf = (report) => KINDS[report.kind] ?? KINDS['investment-advisor'];

export function reportFileName(report) {
  return kindOf(report).fileName(report);
}

// The message that travels with the PDF (or alone, in the wa.me fallback).
export function reportShareText(report) {
  return kindOf(report).shareText(report);
}

export async function renderReportPdf(report) {
  const { jsPDF } = await preloadPdfLibrary();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `${report.title} - ${kindOf(report).label}`, creator: 'FRAMEHOUSE' });
  kindOf(report).draw(doc, createWriter(doc), report);
  return doc.output('blob');
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function downloadReportPdf(report) {
  saveBlob(await renderReportPdf(report), reportFileName(report));
}

export async function openReportPdf(report) {
  const url = URL.createObjectURL(await renderReportPdf(report));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Phones (and Safari/Chrome on macOS) can hand the PDF itself to WhatsApp via
// the system share sheet. Elsewhere, WhatsApp only accepts text through a
// link, so the PDF is downloaded and WhatsApp opens with the summary for the
// user to attach it. Returns 'shared' | 'cancelled' | 'downloaded'.
export async function shareReportOnWhatsApp(report) {
  const blob = await renderReportPdf(report);
  const fileName = reportFileName(report);
  const text = reportShareText(report);
  const file = typeof File === 'function' ? new File([blob], fileName, { type: 'application/pdf' }) : null;

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${report.title} - ${kindOf(report).label}`, text });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
      // NotAllowedError etc.: fall through to the download + link route.
    }
  }

  saveBlob(blob, fileName);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  return 'downloaded';
}
