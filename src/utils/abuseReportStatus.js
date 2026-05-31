// Shared presentation for AbuseReport.Status across the report-abuse UI.
export const ABUSE_STATUS_META = {
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  UPHELD: {
    label: 'Upheld',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

export const abuseStatusMeta = (status) =>
  ABUSE_STATUS_META[status] || {
    label: status || 'Unknown',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

const CATEGORY_LABELS = {
  HARASSMENT: 'Harassment',
  MISINFORMATION: 'Misinformation',
  IMPERSONATION: 'Impersonation',
  OTHER: 'Other',
};

export const abuseCategoryLabel = (category) => CATEGORY_LABELS[category] || category || '—';
