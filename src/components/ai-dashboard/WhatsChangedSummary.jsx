import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, Loader2 } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';

function DeltaChip({ label, value, suffix = '', invertColor = false }) {
  if (value == null) return null;
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const Icon = isNeutral ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;
  const isGood = invertColor ? !isPositive : isPositive;
  const color = isNeutral
    ? 'text-slate-400'
    : isGood
      ? 'text-emerald-400'
      : 'text-red-400';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-lg font-bold">
          {isPositive ? '+' : ''}{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : value}{suffix}
        </span>
      </div>
    </div>
  );
}

export default function WhatsChangedSummary({ entityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    const controller = new AbortController();
    setLoading(true);
    dashboardService.getWhatsChanged(entityId, { signal: controller.signal })
      .then((result) => {
        const payload = result?.changes || result?.summary || result;
        setData(payload);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [entityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasFields = data
    && (data.sentiment_score_delta != null
      || data.new_mentions_count != null
      || data.new_negative_count != null
      || data.new_super_spreader_count != null);

  if (!data || !hasFields) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No change data available — this may be your first visit
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-foreground">What's Changed</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DeltaChip label="Sentiment Score" value={data.sentiment_score_delta} />
        <DeltaChip label="New Mentions" value={data.new_mentions_count} />
        <DeltaChip label="Negative Mentions" value={data.new_negative_count} invertColor />
        <DeltaChip label="Super Spreader Posts" value={data.new_super_spreader_count} />
      </div>
      {data.competitor_delta && Object.keys(data.competitor_delta).length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Competitor Sentiment Changes</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.competitor_delta).map(([name, delta]) => (
              <div
                key={name}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  delta > 0
                    ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10'
                    : delta < 0
                      ? 'border-red-400/30 text-red-400 bg-red-400/10'
                      : 'border-slate-400/30 text-slate-400 bg-slate-400/10'
                }`}
              >
                {name}: {delta > 0 ? '+' : ''}{delta.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
