import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { checkpointService } from '../../api';

function ImpactCard({ impact }) {
  const directionConfig = {
    IMPROVED: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', label: 'Improved' },
    DECLINED: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Declined' },
    STABLE: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-accent border-border', label: 'Stable' },
  };

  const config = directionConfig[impact.impactDirection] || directionConfig.STABLE;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{impact.description}</h4>
          <p className="text-xs text-muted-foreground">{impact.checkpointDate}</p>
        </div>
        <div className={`flex items-center gap-1.5 ${config.color}`}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-semibold">{config.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Mentions</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-foreground">{impact.beforeTotalMentions}</span>
            <span className="text-xs text-muted-foreground">→</span>
            <span className="text-sm font-medium text-foreground">{impact.afterTotalMentions}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Positive Ratio</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-foreground">{(impact.beforePositiveRatio * 100).toFixed(0)}%</span>
            <span className="text-xs text-muted-foreground">→</span>
            <span className="text-sm font-medium text-foreground">{(impact.afterPositiveRatio * 100).toFixed(0)}%</span>
            <span className={`text-xs font-medium ${impact.positiveRatioChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({impact.positiveRatioChange >= 0 ? '+' : ''}{(impact.positiveRatioChange * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Net Sentiment</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-foreground">{impact.beforeNetSentiment?.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">→</span>
            <span className="text-sm font-medium text-foreground">{impact.afterNetSentiment?.toFixed(2)}</span>
            <span className={`text-xs font-medium ${impact.netSentimentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({impact.netSentimentChange >= 0 ? '+' : ''}{impact.netSentimentChange?.toFixed(2)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckpointImpactView({ entityId, entityName }) {
  const [windowDays, setWindowDays] = useState(7);

  const { data, isLoading, error } = useQuery({
    queryKey: ['checkpoint-impact', entityId, windowDays],
    queryFn: () => checkpointService.getCheckpointImpact(entityId, { windowDays }),
    enabled: !!entityId,
  });

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Checkpoint Impact</h3>
          <span className="text-xs text-muted-foreground">Before/after sentiment for each checkpoint</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Window:</label>
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {[3, 5, 7, 14, 30].map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading impact data...</p>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-6">Failed to load impact data</p>
        ) : !data?.impacts || data.impacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No checkpoint impact data available. Add checkpoints to see their impact.
          </p>
        ) : (
          <div className="space-y-3">
            {data.impacts.map((impact) => (
              <ImpactCard key={impact.checkpointId} impact={impact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
