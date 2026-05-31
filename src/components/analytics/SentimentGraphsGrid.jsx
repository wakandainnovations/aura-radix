import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, AlertCircle } from 'lucide-react';
import SentimentTrendGraph from './SentimentTrendGraph';
import { checkpointService } from '../../api';

export default function SentimentGraphsGrid({
  sentimentGraphs = { positive: [], total: [], negative: [] },
  clusterMode = false,
  clusterEntities = [],
  onRefresh = () => {},
  sentimentTrendRaw = null,
  entityId = null,
}) {
  const [checkpointLabelMode, setCheckpointLabelMode] = React.useState('hover');
  const queryClient = useQueryClient();

  // Quick-create checkpoint by double-clicking a point on a graph.
  // Only available for a single entity (in cluster mode it's ambiguous which
  // entity a checkpoint would belong to).
  const checkpointCreationEnabled = !clusterMode && !!entityId;
  const [checkpointDraft, setCheckpointDraft] = React.useState(null); // { date, description }
  const [checkpointError, setCheckpointError] = React.useState('');

  const createCheckpointMutation = useMutation({
    mutationFn: (data) => checkpointService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoints', entityId] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-trend'] });
      queryClient.invalidateQueries({ queryKey: ['checkpoint-impact', entityId] });
      queryClient.invalidateQueries({ queryKey: ['checkpoint-trend', entityId] });
      setCheckpointDraft(null);
      setCheckpointError('');
    },
    onError: (err) => {
      setCheckpointError(err?.message || 'Failed to create checkpoint');
    },
  });

  const handlePointDoubleClick = (date) => {
    if (!checkpointCreationEnabled || date == null) return;
    setCheckpointError('');
    setCheckpointDraft({ date, description: '' });
  };

  const handleCreateCheckpoint = (e) => {
    e.preventDefault();
    setCheckpointError('');
    const description = checkpointDraft?.description.trim() || '';
    if (!description) {
      setCheckpointError('Description is required');
      return;
    }
    if (description.length > 20) {
      setCheckpointError('Description must be 20 characters or less');
      return;
    }
    createCheckpointMutation.mutate({
      entityId,
      checkpointDate: checkpointDraft.date,
      description,
    });
  };

  const closeCheckpointDraft = () => {
    setCheckpointDraft(null);
    setCheckpointError('');
  };

  const checkpoints = React.useMemo(() => {
    if (!sentimentTrendRaw?.entities) return [];
    return sentimentTrendRaw.entities.flatMap(e => e.checkpoints || []);
  }, [sentimentTrendRaw]);
  // Check if we have any data
  const hasData = sentimentGraphs?.positive?.length > 0 || 
                  sentimentGraphs?.total?.length > 0 || 
                  sentimentGraphs?.negative?.length > 0;

  if (!hasData) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center h-96">
        <p className="text-muted-foreground">No sentiment data available</p>
      </div>
    );
  }

  // Extract unique dates from all sentiment data for X-axis overlay
  const allDates = new Set();
  [sentimentGraphs.positive, sentimentGraphs.total, sentimentGraphs.negative].forEach(graphData => {
    graphData.forEach(item => allDates.add(item.date));
  });
  const uniqueDates = Array.from(allDates).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Sentiment Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {clusterMode
              ? `Comparing ${clusterEntities.length} entities`
              : 'Single entity sentiment trends'}
          </p>
        </div>
        {checkpoints.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">Checkpoint labels:</span>
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setCheckpointLabelMode('hover')}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  checkpointLabelMode === 'hover'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                On hover
              </button>
              <button
                onClick={() => setCheckpointLabelMode('always')}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  checkpointLabelMode === 'always'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Always
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Graphs Stacked Vertically */}
      <div className="space-y-6 w-full">
        {/* Total Graph */}
        <SentimentTrendGraph
          data={sentimentGraphs.total}
          sentiment="total"
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
          uniqueDates={uniqueDates}
          checkpoints={checkpoints}
          checkpointLabelMode={checkpointLabelMode}
          onPointDoubleClick={checkpointCreationEnabled ? handlePointDoubleClick : null}
        />

        {/* Positive Graph */}
        <SentimentTrendGraph
          data={sentimentGraphs.positive}
          sentiment="positive"
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
          uniqueDates={uniqueDates}
          checkpoints={checkpoints}
          checkpointLabelMode={checkpointLabelMode}
          onPointDoubleClick={checkpointCreationEnabled ? handlePointDoubleClick : null}
        />

        {/* Negative Graph */}
        <SentimentTrendGraph
          data={sentimentGraphs.negative}
          sentiment="negative"
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
          uniqueDates={uniqueDates}
          checkpoints={checkpoints}
          checkpointLabelMode={checkpointLabelMode}
          onPointDoubleClick={checkpointCreationEnabled ? handlePointDoubleClick : null}
        />
      </div>

      {/* Quick checkpoint-creation modal (triggered by double-clicking a graph point) */}
      {checkpointDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closeCheckpointDraft}
        >
          <form
            onSubmit={handleCreateCheckpoint}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card border border-border rounded-lg p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">New Checkpoint</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
              <div className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground">
                {checkpointDraft.date}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Description (max 20 chars)
              </label>
              <input
                type="text"
                autoFocus
                value={checkpointDraft.description}
                onChange={(e) =>
                  setCheckpointDraft((d) => ({ ...d, description: e.target.value }))
                }
                maxLength={20}
                placeholder="e.g. Trailer Launch"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {checkpointDraft.description.length}/20
              </span>
            </div>

            {checkpointError && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {checkpointError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeCheckpointDraft}
                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCheckpointMutation.isPending}
                className="px-4 py-2 rounded-md text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {createCheckpointMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-background/50 border border-border rounded-lg p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total</p>
          <p className="text-2xl font-bold text-cyan-400">
            {sentimentGraphs.total.reduce((sum, item) => sum + (item.value || 0), 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Positive</p>
          <p className="text-2xl font-bold text-green-500">
            {sentimentGraphs.positive.reduce((sum, item) => sum + (item.value || 0), 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Negative</p>
          <p className="text-2xl font-bold text-red-500">
            {sentimentGraphs.negative.reduce((sum, item) => sum + (item.value || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
