// Saved reports, per user and per browser. There's no backend reports store
// yet, so localStorage is the only option (same approach as the Investment
// Advisor's genre memory). Only the report's data is kept, never the PDF: the
// PDF is rebuilt from it on download, so old reports pick up layout fixes.
const MAX_REPORTS = 50;
const storageKey = (username) => `framehouse:reports:${username || 'anonymous'}`;

export const REPORT_KIND_LABELS = {
  'investment-advisor': 'Investment Advisor',
  'movie-intelligence': 'Movie Report',
};

export function createReportId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadReports(username) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(username)));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeReports(username, reports) {
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(reports));
  } catch {
    // Quota or private mode: the report still downloads, it just isn't kept.
  }
  return reports;
}

// Newest first; the oldest drop off past MAX_REPORTS.
export function saveReport(username, report) {
  const rest = loadReports(username).filter((r) => r.id !== report.id);
  return writeReports(username, [report, ...rest].slice(0, MAX_REPORTS));
}

export function deleteReport(username, id) {
  return writeReports(username, loadReports(username).filter((r) => r.id !== id));
}

export function createInvestmentReport({ request, result, preparedBy }) {
  return {
    id: createReportId(),
    kind: 'investment-advisor',
    title: result.movieName || request.movieName,
    createdAt: new Date().toISOString(),
    preparedBy: preparedBy || null,
    request,
    result,
  };
}
