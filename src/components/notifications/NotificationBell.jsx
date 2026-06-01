import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Zap, AlertTriangle, X } from 'lucide-react';
import { alertService } from '../../api/alertService';

// Mirrors AlertsPanel's KIND_CONFIG so the dropdown reads consistently with the
// full Alerts view. Kept minimal (label + icon) — the panel owns the rich layout.
const KIND_META = {
  SPIKE: { icon: Zap, label: 'Sentiment Spike', color: 'text-amber-400' },
  INFLUENCER_NEGATIVE: { icon: AlertTriangle, label: 'Influencer Negative', color: 'text-red-400' },
};

const POLL_INTERVAL = 60000; // 1 minute — keeps the badge timely without hammering the API

export default function NotificationBell({ onViewAll }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // OPEN alerts are the natural "unread" signal — acknowledging/dismissing in the
  // Alerts panel clears them for free. Polled globally (no entity filter) so the
  // user is aware of any alert regardless of which entity they're currently viewing.
  const { data } = useQuery({
    queryKey: ['open-alerts'],
    queryFn: () => alertService.getAlerts({ status: 'OPEN', size: 5 }),
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });

  const alerts = data?.content || [];
  const count = data?.totalElements ?? alerts.length;

  // Close the dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleViewAll = () => {
    setOpen(false);
    onViewAll?.();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title={count > 0 ? `${count} open alert${count === 1 ? '' : 's'}` : 'No open alerts'}
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Open Alerts</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No open alerts</div>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map((alert) => {
                const meta = KIND_META[alert.kind] || KIND_META.SPIKE;
                const Icon = meta.icon;
                return (
                  <button
                    key={alert.id}
                    onClick={handleViewAll}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{meta.label}</p>
                      {alert.reason && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{alert.reason}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        {alert.entityName && <span className="truncate">{alert.entityName}</span>}
                        {alert.triggeredAt && <span>{new Date(alert.triggeredAt).toLocaleString()}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleViewAll}
            className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-accent border-t border-border sticky bottom-0 bg-card"
          >
            View all alerts
          </button>
        </div>
      )}
    </div>
  );
}
