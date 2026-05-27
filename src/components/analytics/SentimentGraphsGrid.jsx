import React from 'react';
import SentimentTrendGraph from './SentimentTrendGraph';

export default function SentimentGraphsGrid({
  sentimentGraphs = { positive: [], total: [], negative: [] },
  clusterMode = false,
  clusterEntities = [],
  onRefresh = () => {},
  sentimentTrendRaw = null,
}) {
  const [checkpointLabelMode, setCheckpointLabelMode] = React.useState('hover');

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
        />
      </div>

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
