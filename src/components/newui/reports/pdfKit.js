// Shared drawing primitives for FRAMEHOUSE report PDFs (jsPDF, A4 portrait,
// millimetres). Each report kind lays out its own sections on top of these.

// A4 portrait, in millimetres.
export const PAGE_W = 210;
export const PAGE_H = 297;
export const M = 16;
export const CONTENT_W = PAGE_W - 2 * M;

export const C = {
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

// jsPDF's built-in Helvetica only covers WinAnsi, which has no rupee sign.
export function safe(text) {
  return String(text ?? '')
    .replace(/₹/g, 'Rs ')
    .replace(/≤/g, '<=')
    .replace(/[—–]/g, '-')
    .replace(/→/g, '->')
    // Anything else outside WinAnsi (Tamil/Devanagari names, emoji) would
    // print as garbage glyphs, so it's dropped.
    .replace(/[^\x00-\xFF\u2018\u2019\u201C\u201D\u2022\u2026]/g, '')
    .replace(/ {2,}/g, ' ');
}

export function formatDate(iso, withTime = false) {
  if (!iso) return '';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return withTime ? `${date}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : date;
}

export function createWriter(doc) {
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
    // Reserves room for the first lines of the section too, so a heading
    // never sits alone at the foot of a page.
    heading(title) {
      w.ensure(32);
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

// Dark brand band with the report kind and generation time on the right.
export function drawHeader(doc, w, { label, createdAt }) {
  doc.setFillColor(...C.brand);
  doc.rect(0, 0, PAGE_W, 26, 'F');
  w.font(15, 'bold', [255, 255, 255]);
  w.text('FRAMEHOUSE', M, 13);
  w.font(6.5, 'normal', [140, 146, 160]);
  doc.setCharSpace(0.6);
  w.text('AI OPERATING SYSTEM', M, 18.5);
  doc.setCharSpace(0);
  w.font(9, 'bold', C.blue);
  w.text(label, PAGE_W - M, 13, { align: 'right' });
  w.font(7.5, 'normal', [140, 146, 160]);
  w.text(`Generated ${formatDate(createdAt, true)}`, PAGE_W - M, 18.5, { align: 'right' });
}

export function drawFooters(doc, note) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.2);
    doc.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.faint);
    doc.text(safe(note), M, PAGE_H - 9.5);
    doc.text(`Page ${i} of ${pages}`, PAGE_W - M, PAGE_H - 9.5, { align: 'right' });
  }
}

