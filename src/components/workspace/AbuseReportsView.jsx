import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Loader2, AlertCircle, Ticket, MessageSquare, RotateCcw, ExternalLink } from 'lucide-react';
import { reportAbuseService } from '../../api';
import { abuseStatusMeta, abuseCategoryLabel } from '../../utils/abuseReportStatus';

// Status filter tabs. `null` = all.
const FILTERS = [
  { value: null, label: 'All' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UPHELD', label: 'Upheld' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function AbuseReportsView() {
  const [status, setStatus] = useState(null);

  const {
    data: reports = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['abuse-reports', status],
    queryFn: () => reportAbuseService.getAll(status),
  });

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Abuse Reports</h2>
              <p className="text-sm text-muted-foreground">
                Audit trail of every abuse report you've filed and how platform moderation resolved it.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 h-10 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.label}
                onClick={() => setStatus(f.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  active
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-muted-foreground">{error?.message || 'Failed to load abuse reports.'}</p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
              >
                Retry
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <ShieldAlert className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {status ? `No ${abuseStatusMeta(status).label.toLowerCase()} reports.` : 'No abuse reports filed yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reports.map((report) => {
                const statusMeta = abuseStatusMeta(report.status);
                // The backend may enrich a report with the reported mention so we
                // can link straight to the original post. All fields are optional;
                // we degrade gracefully when the mention isn't included.
                const mention = report.mention;
                const postUrl = mention && (mention.permalink || mention.sourceUrl);
                const snippet = mention && (mention.text || mention.content);
                return (
                  <div key={report.id} className="p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {abuseCategoryLabel(report.category)}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                            <MessageSquare className="w-2.5 h-2.5" />
                            Mention #{report.mentionId}
                          </span>
                          {mention?.platform && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                              {mention.platform}
                            </span>
                          )}
                          {report.externalRef && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground"
                              title="Platform moderation ticket"
                            >
                              <Ticket className="w-2.5 h-2.5" />
                              {report.externalRef}
                            </span>
                          )}
                        </div>
                        {/* Reported post preview (only when the backend includes the mention) */}
                        {(mention?.author || snippet) && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {mention?.author && (
                              <span className="font-medium text-foreground">{mention.author}</span>
                            )}
                            {snippet && (
                              <p className="mt-0.5 line-clamp-2">{snippet}</p>
                            )}
                          </div>
                        )}
                        {report.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic">"{report.notes}"</p>
                        )}
                      </div>
                      {postUrl && (
                        <a
                          href={postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 shrink-0 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View original post
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Filed {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : '—'}
                      {report.resolvedAt && <> · resolved {new Date(report.resolvedAt).toLocaleString()}</>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
