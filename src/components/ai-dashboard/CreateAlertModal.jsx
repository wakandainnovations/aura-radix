import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { alertService } from '../../api/alertService';
import FormInput from '../ui/FormInput';

const METRICS = [
  { value: 'SENTIMENT_SCORE', label: 'Sentiment Score' },
  { value: 'MENTION_VOLUME', label: 'Mention Volume' },
  { value: 'NEGATIVE_RATIO', label: 'Negative Ratio' },
];

export default function CreateAlertModal({ entityId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState(METRICS[0].value);
  const [direction, setDirection] = useState('ABOVE');
  const [threshold, setThreshold] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = name.trim() && threshold !== '' && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await alertService.create({
        entityId,
        kind: 'SPIKE',
        name: name.trim(),
        metric,
        direction,
        threshold: parseFloat(threshold),
      });
      onCreated();
      onClose();
    } catch {
      setError('Failed to create alert. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-foreground font-semibold">Create Sentiment Spike Alert</h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <FormInput
            id="alert-name"
            label="Alert Name"
            placeholder="e.g., High negative sentiment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label htmlFor="alert-metric" className="text-sm font-medium text-foreground">
              Metric<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="alert-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {METRICS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              Direction<span className="text-red-500 ml-1">*</span>
            </span>
            <div className="flex gap-2">
              {['ABOVE', 'BELOW'].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setDirection(dir)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    direction === dir
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {dir === 'ABOVE' ? 'Goes above' : 'Drops below'}
                </button>
              ))}
            </div>
          </div>

          <FormInput
            id="alert-threshold"
            label="Threshold"
            placeholder="e.g., 0.8"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            required
            helpText="The value at which the alert should trigger"
          />

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-accent text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Alert
          </button>
        </div>
      </div>
    </div>
  );
}
