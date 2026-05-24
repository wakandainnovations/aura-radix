import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import WhatsNewCards from './WhatsNewCards';
import WhatsChangedSummary from './WhatsChangedSummary';
import AlertsPanel from './AlertsPanel';
import HourlyActivityHeatmap from './HourlyActivityHeatmap';
import MentionActionsPanel from './MentionActionsPanel';
import WebhookSettings from './WebhookSettings';

export default function AIDashboardView({ selectedEntity }) {
  const entityId = selectedEntity?.id;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                AI Dashboard — {selectedEntity?.name || selectedEntity?.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Alerts, activity insights, and mention actions
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <WhatsNewCards entityId={entityId} />
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <WhatsChangedSummary entityId={entityId} />
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <AlertsPanel entityId={entityId} />
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <HourlyActivityHeatmap entityId={entityId} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <MentionActionsPanel entityId={entityId} />
        </div>

        <WebhookSettings />
      </div>
    </div>
  );
}
