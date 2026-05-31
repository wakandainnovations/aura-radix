import apiClient from './client';

/**
 * Abuse reporting + audit trail.
 * Backend: see MentionAbuseReportController / AbuseReportController.
 *
 * A report is filed against a mention with a category + optional notes. The
 * backend forwards it to the matching platform dispatcher (X / Reddit / YouTube
 * / Instagram), which returns an `externalRef` (the platform moderation ticket
 * id). A scheduled moderation job later resolves each report to UPHELD or
 * REJECTED, setting `resolvedAt`. The report record itself is the audit trail.
 *
 * AbuseReport shape (camelCase JSON from the entity):
 *   { id, mentionId, userId, category, notes, status, externalRef,
 *     submittedAt, resolvedAt }
 */

// AbuseReport.Category
export const ABUSE_CATEGORIES = [
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'MISINFORMATION', label: 'Misinformation' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'OTHER', label: 'Other' },
];

// AbuseReport.Status
export const ABUSE_STATUSES = ['SUBMITTED', 'UPHELD', 'REJECTED'];

export const reportAbuseService = {
  // POST /api/mentions/{mentionId}/report-abuse
  // Body: { category, notes? } -> returns the created AbuseReport (with externalRef)
  reportAbuse: async (mentionId, { category, notes = '' } = {}) => {
    const response = await apiClient.post(`/mentions/${mentionId}/report-abuse`, {
      category,
      notes,
    });
    return response;
  },

  // GET /api/mentions/{mentionId}/abuse-reports -> AbuseReport[] (newest first)
  getForMention: async (mentionId) => {
    const response = await apiClient.get(`/mentions/${mentionId}/abuse-reports`);
    return response;
  },

  // GET /api/abuse-reports?status= -> AbuseReport[] for the current user (newest first)
  // status is optional; omit for all reports.
  getAll: async (status) => {
    const response = await apiClient.get('/abuse-reports', {
      params: status ? { status } : {},
    });
    return response;
  },
};
