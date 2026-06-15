import React from 'react';
import { Star, Users, Activity, Loader2, AlertCircle } from 'lucide-react';

function CelebrityAnalyticsShell({ children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Celebrity Analytics</h3>
      </div>
      {children}
    </div>
  );
}

export default function CelebrityAnalytics({ celebrityData, isLoading, error, formatCurrency }) {
  // Loading state — analytics request in flight.
  if (isLoading) {
    return (
      <CelebrityAnalyticsShell>
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading celebrity analytics…</span>
        </div>
      </CelebrityAnalyticsShell>
    );
  }

  // Error state — surface failure instead of silently showing placeholder values.
  if (error) {
    return (
      <CelebrityAnalyticsShell>
        <div className="flex items-center gap-2 text-red-500 py-8 justify-center">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">
            {error.message || 'Failed to load celebrity analytics.'}
          </span>
        </div>
      </CelebrityAnalyticsShell>
    );
  }

  // No data available for this entity.
  if (!celebrityData) {
    return (
      <CelebrityAnalyticsShell>
        <div className="text-sm text-muted-foreground py-8 text-center">
          No celebrity analytics available for this entity yet.
        </div>
      </CelebrityAnalyticsShell>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Celebrity Card */}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Celebrity Analytics</h3>
        </div>

        <div className="space-y-4">
          {/* Social Reach & Brand Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-primary">
                  {(celebrityData.socialReach / 1000000).toFixed(0)}M
                </span>
                <div className="flex items-center gap-1 text-green-500">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Social Media Reach
              </p>
            </div>
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(celebrityData.brandValue)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Brand Value
              </p>
            </div>
          </div>

          {/* Endorsement & Fan Engagement Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-accent/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Endorsement Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-green-500"
                    style={{ width: `${celebrityData.endorsementScore}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {celebrityData.endorsementScore}%
                </span>
              </div>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Fan Engagement</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500"
                    style={{ width: `${celebrityData.fanEngagement}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {celebrityData.fanEngagement}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">Recent Projects</p>
            <div className="space-y-2">
              {celebrityData.recentProjects.map((project, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">{project.buzz}% Buzz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Celebrity Metrics */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Key Metrics</h3>
        <div className="space-y-3">
          {celebrityData.metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{metric.name}</span>
                <span className={`font-semibold ${
                  metric.impact === 'positive' ? 'text-green-500' :
                  metric.impact === 'negative' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {metric.score}%
                </span>
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    metric.impact === 'positive' ? 'bg-green-500' :
                    metric.impact === 'negative' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
