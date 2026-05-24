import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { alertService } from '../../api/alertService';
import FormInput from '../ui/FormInput';

const KINDS = [
  { value: 'SPIKE', label: 'Sentiment Spike' },
  { value: 'INFLUENCER_NEGATIVE', label: 'Influencer Negative' },
];

export default function CreateAlertModal({ entityId, onClose, onCreated }) {
  const [kind, setKind] = useState('SPIKE');
  const [currentValue, setCurrentValue] = useState('');
  const [baselineValue, setBaselineValue] = useState('');
  const [sourceMentionId, setSourceMentionId] = useState('');
  const [matchedAuthor, setMatchedAuthor] = useState('');
  const [permalink, setPermalink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = !submitting && entityId;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        managedEntityId: entityId,
        kind,
      };
      if (kind === 'SPIKE') {
        if (currentValue !== '') payload.currentValue = parseFloat(currentValue);
        if (baselineValue !== '') payload.baselineValue = parseFloat(baselineValue);
      } else {
        if (sourceMentionId !== '') payload.sourceMentionId = parseInt(sourceMentionId, 10);
        if (matchedAuthor.trim()) payload.matchedAuthor = matchedAuthor.trim();
        if (permalink.trim()) payload.permalink = permalink.trim();
      }
      await alertService.create(payload);
      onCreated();
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setError('An open alert of this type already exists for this entity.');
      } else if (err.status === 400) {
        setError(err.message || 'Validation failed. Please check the fields.');
      } else {
        setError('Failed to create alert. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-foreground font-semibold">Create Alert</h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="alert-kind" className="text-sm font-medium text-foreground">
              Alert Type<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="alert-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          {kind === 'SPIKE' ? (
            <>
              <FormInput
                id="alert-current-value"
                label="Current Value"
                placeholder="e.g., 0.45"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                helpText="Current negative-sentiment ratio"
              />
              <FormInput
                id="alert-baseline-value"
                label="Baseline Value"
                placeholder="e.g., 0.20"
                type="number"
                value={baselineValue}
                onChange={(e) => setBaselineValue(e.target.value)}
                helpText="Baseline negative-sentiment ratio"
              />
            </>
          ) : (
            <>
              <FormInput
                id="alert-mention-id"
                label="Source Mention ID"
                placeholder="e.g., 123"
                type="number"
                value={sourceMentionId}
                onChange={(e) => setSourceMentionId(e.target.value)}
                helpText="ID of the triggering mention"
              />
              <FormInput
                id="alert-author"
                label="Author"
                placeholder="e.g., @influencer_handle"
                value={matchedAuthor}
                onChange={(e) => setMatchedAuthor(e.target.value)}
                helpText="Name of the matched influencer"
              />
              <FormInput
                id="alert-permalink"
                label="Permalink"
                placeholder="https://example.com/post/123"
                value={permalink}
                onChange={(e) => setPermalink(e.target.value)}
                helpText="URL to the source post"
              />
            </>
          )}

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
