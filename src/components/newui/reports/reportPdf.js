import {
  budgetBands,
  capitalize,
  formatInr,
  formatPercent,
  niceCeiling,
  scenarioLabel,
  summarizeVerdict,
} from '../aiinsights/investmentAdvisorUtils';

// jsPDF is ~350 KB, so it's loaded on first use. Report actions call
// preloadPdfLibrary() on mount: navigator.share() must run soon after the
// click, and a cold import could outlast the browser's user-activation window.
let jsPdfModule;
export function preloadPdfLibrary() {
  jsPdfModule ??= import('jspdf');
  return jsPdfModule;
}

// A4 portrait, in millimetres.
const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const CONTENT_W = PAGE_W - 2 * M;

const C = {
  brand: [5, 7, 13],
  ink: [17, 24, 39],
  muted: [107, 114, 128],
  faint: [156, 163, 175],
  rule: [229, 231, 235],
  zebra: [246, 247, 249],
  blue: [96, 165, 250],
  green: [16, 185, 129],
  amber: [217, 119, 6],
  red: [220, 38, 38],
  barGreen: [52, 211, 153],
  barAmber: [251, 191, 36],
  barRed: [254, 226, 226],
};

const TONE = {
  good: { color: C.green, fill: [236, 253, 245] },
  mixed: { color: C.amber, fill: [255, 251, 235] },
  bad: { color: C.red, fill: [254, 242, 242] },
};

const ZONE = {
  safe: { label: 'SAFE', color: C.green },
  opportunity: { label: 'OPPORTUNITY', color: C.amber },
  risk: { label: 'RISK', color: C.red },
};

const VERDICT_LABEL = { OPPORTUNITY: 'Opportunity', RISK: 'Risk' };
const VERDICT_COLOR = { OPPORTUNITY: C.green, RISK: C.red };

// jsPDF's built-in Helvetica only covers WinAnsi, which has no rupee sign.
function safe(text) {
  return String(text ?? '')
    .replace(/₹/g, 'Rs ')
    .replace(/≤/g, '<=')
    .replace(/[—–]/g, '-');
}

function formatDate(iso, withTime = false) {
  if (!iso) return '';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return withTime ? `${date}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : date;
}

function languagesOf(result) {
  return String(result.language ?? '')
    .split(',')
    .map((l) => capitalize(l.trim()))
    .filter(Boolean);
}

export function reportFileName(report) {
  const slug = (report.title || 'report').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `framehouse-investment-${slug || 'report'}-${report.createdAt.slice(0, 10)}.pdf`;
}

// The message that travels with the PDF (or alone, in the wa.me fallback).
export function reportShareText(report) {
  const { result } = report;
  const verdict = summarizeVerdict(result.assessments ?? []);
  const { safe: safeBudget, ceiling } = budgetBands(result.assessments ?? []);
  const lines = [
    `FRAMEHOUSE Investment Advisor: ${report.title} (release ${formatDate(result.releaseDate)})`,
    verdict ? `${verdict.title}. ${verdict.body}` : null,
    `Safe budget ${safeBudget == null ? '-' : formatInr(safeBudget)} · Max opportunity ${ceiling == null ? 'risky at any budget' : formatInr(ceiling)}`,
    'Full report attached as PDF.',
  ];
  return lines.filter(Boolean).join('\n');
}

function createWriter(doc) {
  let y = 0;
  const w = {
    get y() {
      return y;
    },
    set y(v) {
      y = v;
    },
    color(rgb) {
      doc.setTextColor(...rgb);
    },
    font(size, style = 'normal', rgb = C.ink) {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(...rgb);
    },
    text(str, x, yy, opts) {
      doc.text(safe(str), x, yy, opts);
    },
    // Start a new page when the next block wouldn't fit above the footer.
    ensure(height) {
      if (y + height > PAGE_H - 18) {
        doc.addPage();
        y = 22;
      }
    },
    heading(title) {
      w.ensure(18);
      w.font(11, 'bold');
      w.text(title, M, y);
      doc.setDrawColor(...C.rule);
      doc.setLineWidth(0.3);
      doc.line(M, y + 2.5, PAGE_W - M, y + 2.5);
      y += 8.5;
    },
  };
  return w;
}

function drawHeader(doc, w, report) {
  doc.setFillColor(...C.brand);
  doc.rect(0, 0, PAGE_W, 26, 'F');
  w.font(15, 'bold', [255, 255, 255]);
  w.text('FRAMEHOUSE', M, 13);
  w.font(6.5, 'normal', [140, 146, 160]);
  doc.setCharSpace(0.6);
  w.text('AI OPERATING SYSTEM', M, 18.5);
  doc.setCharSpace(0);
  w.font(9, 'bold', C.blue);
  w.text('INVESTMENT ADVISOR REPORT', PAGE_W - M, 13, { align: 'right' });
  w.font(7.5, 'normal', [140, 146, 160]);
  w.text(`Generated ${formatDate(report.createdAt, true)}`, PAGE_W - M, 18.5, { align: 'right' });
}

function drawTitle(doc, w, report) {
  const { result, request } = report;
  w.y = 40;
  w.font(20, 'bold');
  const titleLines = doc.splitTextToSize(safe(report.title), CONTENT_W);
  doc.text(titleLines, M, w.y);
  w.y += (titleLines.length - 1) * 8 + 7;

  const meta = [
    result.releaseDate && `Release ${formatDate(result.releaseDate)}`,
    languagesOf(result).join(', '),
    request.genre,
    request.cbfcRating && `CBFC ${request.cbfcRating}`,
  ].filter(Boolean);
  w.font(9.5, 'normal', C.muted);
  w.text(meta.join('  ·  '), M, w.y);
  if (report.preparedBy) {
    w.y += 5;
    w.text(`Prepared by ${report.preparedBy}`, M, w.y);
  }
  w.y += 9;
}

function drawVerdict(doc, w, result) {
  const verdict = summarizeVerdict(result.assessments);
  if (!verdict) return;
  const tone = TONE[verdict.tone];
  w.font(9.5, 'normal');
  const body = doc.splitTextToSize(safe(verdict.body), CONTENT_W - 14);
  const h = 15 + body.length * 4.5;
  w.ensure(h + 8);
  doc.setFillColor(...tone.fill);
  doc.roundedRect(M, w.y, CONTENT_W, h, 2, 2, 'F');
  doc.setFillColor(...tone.color);
  doc.rect(M, w.y, 1.6, h, 'F');
  w.font(13, 'bold');
  w.text(verdict.title, M + 7, w.y + 8.5);
  w.font(9.5, 'normal', C.muted);
  doc.text(body, M + 7, w.y + 14.5);
  w.y += h + 8;
}

function drawBudgetRange(doc, w, assessments) {
  const { middle, top, safe: safeBudget, ceiling, planned, zone } = budgetBands(assessments);
  w.heading('Budget range');
  w.ensure(44);

  const stats = [
    { label: 'SAFE BUDGET', color: C.barGreen, value: safeBudget == null ? '-' : formatInr(safeBudget, { capped: middle.maxBudgetCapped }) },
    { label: 'MAX OPPORTUNITY', color: C.barAmber, value: ceiling == null ? '-' : formatInr(ceiling, { capped: top.maxBudgetCapped }) },
    planned != null && { label: 'YOUR BUDGET', color: C.ink, value: formatInr(planned), zone: ZONE[zone] },
  ].filter(Boolean);
  stats.forEach((s, i) => {
    const x = M + i * 62;
    doc.setFillColor(...s.color);
    doc.rect(x, w.y - 2.2, 2.2, 2.2, 'F');
    w.font(7, 'bold', C.muted);
    w.text(s.label, x + 3.6, w.y);
    w.font(15, 'bold');
    w.text(s.value, x, w.y + 7.5);
    if (s.zone) {
      const valueW = doc.getTextWidth(safe(s.value));
      w.font(7, 'bold', s.zone.color);
      w.text(s.zone.label, x + valueW + 3, w.y + 7);
    }
  });
  w.y += 18;

  // Same scale as the on-screen bar: red track, amber to the ceiling, green
  // to the safe line, a dashed marker at the entered budget.
  const domain = niceCeiling(Math.max(safeBudget ?? 0, ceiling ?? 0, planned ?? 0, 1e7) * 1.15);
  const xAt = (v) => M + Math.min(1, v / domain) * CONTENT_W;
  const barH = 8;
  doc.setFillColor(...C.barRed);
  doc.rect(M, w.y, CONTENT_W, barH, 'F');
  if (ceiling != null) {
    doc.setFillColor(...C.barAmber);
    doc.rect(M, w.y, xAt(ceiling) - M, barH, 'F');
  }
  if (safeBudget != null) {
    doc.setFillColor(...C.barGreen);
    doc.rect(M, w.y, xAt(safeBudget) - M, barH, 'F');
  }
  if (ceiling == null) {
    w.font(8.5, 'bold', C.red);
    w.text('Risky at any budget', M + 3, w.y + 5.4);
  }
  if (planned != null) {
    const px = xAt(planned);
    doc.setDrawColor(...C.ink);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([1.2, 1], 0);
    doc.line(px, w.y - 1.5, px, w.y + barH + 1.5);
    doc.setLineDashPattern([], 0);
  }

  w.font(7, 'normal', C.faint);
  [0, 0.25, 0.5, 0.75, 1].forEach((f, i, all) => {
    const v = f * domain;
    const align = i === 0 ? 'left' : i === all.length - 1 ? 'right' : 'center';
    w.text(v === 0 ? '₹0' : formatInr(v), xAt(v), w.y + barH + 4.5, { align });
  });
  w.y += barH + 12;
}

function drawScenarioTable(doc, w, assessments) {
  if (!assessments.length) return;
  w.heading('Audience scenarios');
  const cols = [
    { label: 'Reception', x: M + 2 },
    { label: 'Scenario', x: M + 24 },
    { label: 'Verdict', x: M + 62 },
    { label: 'Max budget', x: M + 94 },
    { label: 'Hit chance', x: M + 128 },
    { label: 'Expected return', x: PAGE_W - M - 2, align: 'right' },
  ];
  const rowH = 8;
  w.ensure(rowH * (assessments.length + 1) + 6);
  doc.setFillColor(...C.zebra);
  doc.rect(M, w.y - 5, CONTENT_W, rowH, 'F');
  w.font(7.5, 'bold', C.muted);
  cols.forEach((c) => w.text(c.label.toUpperCase(), c.x, w.y, { align: c.align }));
  w.y += rowH;

  [...assessments].sort((a, b) => b.rating - a.rating).forEach((a) => {
    const cells = [
      `${a.rating}/10`,
      scenarioLabel(a.rating),
      VERDICT_LABEL[a.verdict] ?? '-',
      a.maxBudget == null ? 'Risky at any' : `up to ${formatInr(a.maxBudget, { capped: a.maxBudgetCapped })}`,
      formatPercent(a.hitProbability),
      a.expectedRatio != null ? `${a.expectedRatio.toFixed(2)}×` : '-',
    ];
    cells.forEach((cell, i) => {
      const isVerdict = i === 2 && VERDICT_COLOR[a.verdict];
      w.font(9.5, i === 0 || isVerdict ? 'bold' : 'normal', isVerdict ? VERDICT_COLOR[a.verdict] : C.ink);
      w.text(cell, cols[i].x, w.y, { align: cols[i].align });
    });
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.2);
    doc.line(M, w.y + 3, PAGE_W - M, w.y + 3);
    w.y += rowH;
  });
  w.y += 6;
}

function drawBreakout(doc, w, breakout) {
  if (!breakout?.assessments?.length) return;
  w.heading('Breakout upside (best case)');
  if (breakout.note) {
    w.font(9.5, 'normal', C.muted);
    const note = doc.splitTextToSize(safe(breakout.note), CONTENT_W);
    w.ensure(note.length * 4.5 + 4);
    doc.text(note, M, w.y);
    w.y += note.length * 4.5 + 3;
  }
  [...breakout.assessments].sort((a, b) => a.rating - b.rating).forEach((a) => {
    w.ensure(7);
    w.font(9.5, 'bold');
    w.text(`${a.rating}/10`, M, w.y);
    w.font(9.5, 'bold', VERDICT_COLOR[a.verdict] ?? C.muted);
    w.text(VERDICT_LABEL[a.verdict] ?? '-', M + 18, w.y);
    w.font(9.5, 'normal');
    w.text(a.maxBudget == null ? 'Risky at any budget' : `up to ${formatInr(a.maxBudget, { capped: a.maxBudgetCapped })}`, M + 50, w.y);
    w.y += 6;
  });
  w.y += 6;
}

function drawAssumptions(doc, w, request) {
  const rows = [
    ['Genres', request.genre],
    ['CBFC rating', request.cbfcRating],
    ['Remake', request.isRemake ? 'Yes' : 'No'],
    ['Estimated budget', request.estimatedBudget != null ? formatInr(request.estimatedBudget) : 'Not given'],
    ['Marketing budget', capitalize(request.marketingBudget)],
    ['Production company', request.productionCompany],
    ['Lead actor', request.leadActor],
    ['Supporting actors', request.supportingActors?.join(', ')],
    ['Director', request.director],
    ['Music director', request.musicDirector],
  ].filter(([, v]) => v);
  w.heading('Inputs assessed');
  const colW = CONTENT_W / 2;
  for (let i = 0; i < rows.length; i += 2) {
    const pair = rows.slice(i, i + 2);
    const wrapped = pair.map(([, v]) => {
      w.font(9.5, 'normal');
      return doc.splitTextToSize(safe(v), colW - 6);
    });
    const h = 5 + Math.max(...wrapped.map((l) => l.length)) * 4.5;
    w.ensure(h + 2);
    pair.forEach(([label], j) => {
      const x = M + j * colW;
      w.font(7, 'bold', C.muted);
      w.text(label.toUpperCase(), x, w.y);
      w.font(9.5, 'normal');
      doc.text(wrapped[j], x, w.y + 4.8);
    });
    w.y += h + 1;
  }
}

function drawFooters(doc) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.2);
    doc.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.faint);
    doc.text('FRAMEHOUSE Investment Advisor. Model estimates based on comparable releases, not guarantees.', M, PAGE_H - 9.5);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - M, PAGE_H - 9.5, { align: 'right' });
  }
}

export async function renderReportPdf(report) {
  const { jsPDF } = await preloadPdfLibrary();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `${report.title} - Investment Advisor`, creator: 'FRAMEHOUSE' });
  const w = createWriter(doc);
  const assessments = [...(report.result.assessments ?? [])].sort((a, b) => a.rating - b.rating);

  drawHeader(doc, w, report);
  drawTitle(doc, w, report);
  drawVerdict(doc, w, { ...report.result, assessments });
  drawBudgetRange(doc, w, assessments);
  drawScenarioTable(doc, w, assessments);
  drawBreakout(doc, w, report.result.breakout);
  drawAssumptions(doc, w, report.request);
  drawFooters(doc);

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
      await navigator.share({ files: [file], title: `${report.title} - Investment Advisor`, text });
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
