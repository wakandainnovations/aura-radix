import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { checkpointService } from '../../api';

function DeltaMetric({ label, fromValue, toValue, delta, format = 'number' }) {
  const fmt = (v) => {
    if (v == null) return '—';
    if (format === 'percent') return `${(v * 100).toFixed(1)}%`;
    if (format === 'decimal') return v.toFixed(2);
    return v;
  };

  const deltaFmt = (d) => {
    if (d == null) return '—';
    const prefix = d >= 0 ? '+' : '';
    if (format === 'percent') return `${prefix}${(d * 100).toFixed(1)}%`;
    if (format === 'decimal') return `${prefix}${d.toFixed(2)}`;
    return `${prefix}${d}`;
  };

  const isPositive = delta > 0;
  const isNegative = delta < 0;

  return (
    <div className="bg-accent/30 border border-border rounded-lg p-4">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{fmt(fromValue)}</p>
          <p className="text-xs text-muted-foreground">Before</p>
        </div>
        <ArrowRightLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{fmt(toValue)}</p>
          <p className="text-xs text-muted-foreground">After</p>
        </div>
        <div className="ml-auto text-right">
          <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-muted-foreground'}`}>
            {deltaFmt(delta)}
          </p>
          <p className="text-xs text-muted-foreground">Delta</p>
        </div>
      </div>
    </div>
  );
}

export default function SentimentDeltaView({ entityId, entityName, checkpoints = [] }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [windowDays, setWindowDays] = useState(7);
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['sentiment-delta', entityId, fromDate, toDate, windowDays],
    queryFn: () => checkpointService.getSentimentDelta(entityId, { fromDate, toDate, windowDays }),
    enabled: !!entityId && !!fromDate && !!toDate && submitted,
  });

  const handleQuickSelect = (cp1Date, cp2Date) => {
    setFromDate(cp1Date);
    setToDate(cp2Date);
    setSubmitted(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromDate && toDate) setSubmitted(true);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Sentiment Delta</h3>
        <span className="text-xs text-muted-foreground">Compare sentiment between two dates</span>
      </div>

      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setSubmitted(false); }}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setSubmitted(false); }}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Window</label>
            <select
              value={windowDays}
              onChange={(e) => { setWindowDays(Number(e.target.value)); setSubmitted(false); }}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[3, 5, 7, 14, 30].map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!fromDate || !toDate}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
          >
            Compare
          </button>
        </form>

        {checkpoints.length >= 2 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick compare between checkpoints:</p>
            <div className="flex gap-2 flex-wrap">
              {checkpoints.slice(0, -1).map((cp, i) => {
                const nextCp = checkpoints[i + 1];
                return (
                  <button
                    key={cp.id}
                    onClick={() => handleQuickSelect(cp.checkpointDate, nextCp.checkpointDate)}
                    className="px-3 py-1.5 rounded-md text-xs bg-accent border border-border hover:border-primary/50 transition-colors text-foreground"
                  >
                    {cp.description} → {nextCp.description}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">Calculating delta...</p>
        )}

        {error && submitted && (
          <p className="text-sm text-red-400 text-center py-6">
            {error?.message || 'Failed to compute delta. Ensure fromDate is before toDate.'}
          </p>
        )}

        {data && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Comparing: <strong className="text-foreground">{data.fromLabel}</strong></span>
              <span>vs</span>
              <span><strong className="text-foreground">{data.toLabel}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DeltaMetric
                label="Total Mentions"
                fromValue={data.fromTotalMentions}
                toValue={data.toTotalMentions}
                delta={data.mentionsDelta}
              />
              <DeltaMetric
                label="Positive Ratio"
                fromValue={data.fromPositiveRatio}
                toValue={data.toPositiveRatio}
                delta={data.positiveRatioDelta}
                format="percent"
              />
              <DeltaMetric
                label="Net Sentiment"
                fromValue={data.fromNetSentiment}
                toValue={data.toNetSentiment}
                delta={data.netSentimentDelta}
                format="decimal"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
