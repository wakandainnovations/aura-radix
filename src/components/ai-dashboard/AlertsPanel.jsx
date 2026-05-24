import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Zap, Plus, ExternalLink } from 'lucide-react';
import { alertService } from '../../api/alertService';
import CreateAlertModal from './CreateAlertModal';

const KIND_CONFIG = {
  SPIKE: { icon: Zap, label: 'Sentiment Spike', color: 'text-amber-400' },
  INFLUENCER_NEGATIVE: { icon: AlertTriangle, label: 'Influencer Negative', color: 'text-red-400' },
};

const STATUS_COLORS = {
  OPEN: 'bg-red-500/20 text-red-400 border-red-500/30',
  ACKNOWLEDGED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DISMISSED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function AlertsPanel({ entityId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dismissModal, setDismissModal] = useState(null);
  const [dismissReason, setDismissReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await alertService.getAlerts({
        managedEntityId: entityId,
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      setAlerts(result.content || []);
      setTotalPages(result.totalPages || 0);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [entityId, statusFilter, page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAck = async (alertId) => {
    setActionLoading(alertId);
    try {
      await alertService.acknowledge(alertId);
      fetchAlerts();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async () => {
    if (!dismissModal || !dismissReason.trim()) return;
    setActionLoading(dismissModal);
    try {
      await alertService.dismiss(dismissModal, dismissReason);
      setDismissModal(null);
      setDismissReason('');
      fetchAlerts();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-foreground">Alerts</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['', 'OPEN', 'ACKNOWLEDGED', 'DISMISSED'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(0); }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Create Alert
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">No alerts found</div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const kindCfg = KIND_CONFIG[alert.kind] || KIND_CONFIG.SPIKE;
            const KindIcon = kindCfg.icon;
            return (
              <div
                key={alert.id}
                className="bg-card border border-border rounded-lg p-4 flex items-start gap-3"
              >
                <KindIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${kindCfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{kindCfg.label}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[alert.status]}`}>
                      {alert.status}
                    </span>
                  </div>
                  {alert.reason && (
                    <p className="text-xs text-muted-foreground mb-1">{alert.reason}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {alert.entityName && <span>{alert.entityName}</span>}
                    {alert.matchedAuthor && <span>by @{alert.matchedAuthor}</span>}
                    {alert.triggeredAt && (
                      <span>{new Date(alert.triggeredAt).toLocaleString()}</span>
                    )}
                    {alert.currentValue != null && alert.baselineValue != null && (
                      <span>
                        {alert.currentValue.toFixed(1)} vs baseline {alert.baselineValue.toFixed(1)}
                      </span>
                    )}
                    {alert.permalink && (
                      <a
                        href={alert.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
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
                      onClick={() => handleAck(alert.id)}
                      disabled={actionLoading === alert.id}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      title="Acknowledge"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDismissModal(alert.id)}
                      disabled={actionLoading === alert.id}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 rounded bg-accent text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 rounded bg-accent text-muted-foreground disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateAlertModal
          entityId={entityId}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchAlerts}
        />
      )}

      {dismissModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h4 className="text-foreground font-semibold mb-3">Dismiss Alert</h4>
            <textarea
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="Reason for dismissal..."
              className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setDismissModal(null); setDismissReason(''); }}
                className="px-4 py-2 text-sm rounded-lg bg-accent text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDismiss}
                disabled={!dismissReason.trim() || actionLoading === dismissModal}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
