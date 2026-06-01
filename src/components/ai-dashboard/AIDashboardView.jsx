import React from 'react';
import { Bell } from 'lucide-react';
import AlertsPanel from './AlertsPanel';
import WebhookSettings from './WebhookSettings';

export default function AIDashboardView({ selectedEntity }) {
  const entityId = selectedEntity?.id;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Alert Management — {selectedEntity?.name || selectedEntity?.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Alerts and webhook integrations
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <AlertsPanel entityId={entityId} />
        </div>

        <WebhookSettings />
      </div>
    </div>
  );
}
