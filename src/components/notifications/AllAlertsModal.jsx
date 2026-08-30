import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ChevronLeft, ChevronRight, ExternalLink, Loader2, X, Zap, AlertTriangle } from 'lucide-react';
import { alertService } from '../../api/alertService';

const KIND_META = {
  SPIKE: { icon: Zap, label: 'Sentiment Spike', color: 'text-amber-400' },
  INFLUENCER_NEGATIVE: { icon: AlertTriangle, label: 'Influencer Negative', color: 'text-red-400' },
};

// Backend status enum is OPEN / ACKED / DISMISSED — not "ACKNOWLEDGED" (a
// mismatch also present in the classic UI's AlertsPanel, which silently
// breaks its "Acknowledged" filter tab the same way).
const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ACKED', label: 'Acknowledged' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

const STATUS_BADGE = {
  OPEN: 'bg-red-500/15 text-red-400 border-red-500/30',
  ACKED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DISMISSED: 'bg-white/10 text-white/50 border-white/15',
};

// Same ack/dismiss flow as the classic UI's AlertsPanel (src/components/ai-dashboard/AlertsPanel.jsx),
// restyled for the new UI's dark modal shell and reachable from NotificationBell's "View all alerts".
export default function AllAlertsModal({ open, onOpenChange }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [dismissingId, setDismissingId] = useState(null);
  const [dismissReason, setDismissReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['all-alerts', statusFilter, page],
    queryFn: () => alertService.getAlerts({ status: statusFilter || undefined, page, size: 10 }),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
    // Keeps the bell's unread badge in sync with actions taken here.
    queryClient.invalidateQueries({ queryKey: ['open-alerts'] });
  };

  const ackMutation = useMutation({
    mutationFn: (alertId) => alertService.acknowledge(alertId),
    onSuccess: invalidate,
  });

  const dismissMutation = useMutation({
    mutationFn: ({ alertId, reason }) => alertService.dismiss(alertId, reason),
    onSuccess: () => {
      setDismissingId(null);
      setDismissReason('');
      invalidate();
    },
  });

  const alerts = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(0);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,640px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                ALL ALERTS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Review, acknowledge, or dismiss alerts across your movie.</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-1.5 px-5 pt-3.5 pb-1 shrink-0">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value || 'ALL'}
                onClick={() => handleFilterChange(value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === value
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                    : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/75 hover:bg-white/[0.06]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-white/40" />
              </div>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">No alerts found.</p>
            ) : (
              alerts.map((alert) => {
                const meta = KIND_META[alert.kind] || KIND_META.SPIKE;
                const Icon = meta.icon;
                const isDismissing = dismissingId === alert.id;
                return (
                  <div key={alert.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white/90">{meta.label}</span>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full border ${STATUS_BADGE[alert.status] ?? STATUS_BADGE.OPEN}`}>
                            {alert.status}
                          </span>
                        </div>
                        {alert.reason && <p className="text-xs text-white/50 mt-1">{alert.reason}</p>}
                        <div className="flex items-center gap-3 flex-wrap mt-1.5 text-[11px] text-white/35">
                          {alert.entityName && <span>{alert.entityName}</span>}
                          {alert.matchedAuthor && <span>by @{alert.matchedAuthor}</span>}
                          {alert.triggeredAt && <span>{new Date(alert.triggeredAt).toLocaleString()}</span>}
                          {alert.permalink && (
                            <a
                              href={alert.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                      {alert.status === 'OPEN' && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => ackMutation.mutate(alert.id)}
                            disabled={ackMutation.isPending && ackMutation.variables === alert.id}
                            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                            title="Acknowledge"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDismissingId(alert.id);
                              setDismissReason('');
                            }}
                            className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isDismissing && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <textarea
                          value={dismissReason}
                          onChange={(e) => setDismissReason(e.target.value)}
                          placeholder="Reason for dismissal..."
                          autoFocus
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-2.5 text-xs text-white/80 placeholder:text-white/30 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setDismissingId(null);
                              setDismissReason('');
                            }}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] text-white/60 hover:text-white/80 hover:bg-white/[0.08]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => dismissMutation.mutate({ alertId: alert.id, reason: dismissReason })}
                            disabled={!dismissReason.trim() || dismissMutation.isPending}
                            className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 px-5 py-3.5 border-t border-white/[0.06] shrink-0">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded bg-white/[0.04] text-white/50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/40">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded bg-white/[0.04] text-white/50 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
