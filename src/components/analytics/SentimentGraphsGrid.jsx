import React from 'react';
import SentimentTrendGraph from './SentimentTrendGraph';

export default function SentimentGraphsGrid({ 
  sentimentGraphs = { positive: [], neutral: [], negative: [] },
  clusterMode = false,
  clusterEntities = [],
  onRefresh = () => {}
}) {
  // Check if we have any data
  const hasData = sentimentGraphs?.positive?.length > 0 || 
                  sentimentGraphs?.neutral?.length > 0 || 
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
  [sentimentGraphs.positive, sentimentGraphs.neutral, sentimentGraphs.negative].forEach(graphData => {
    graphData.forEach(item => allDates.add(item.date));
  });
  const uniqueDates = Array.from(allDates).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Sentiment Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {clusterMode 
            ? `Comparing ${clusterEntities.length} entities` 
            : 'Single entity sentiment trends'}
        </p>
      </div>

      {/* 3 Graphs Stacked Vertically */}
      <div className="space-y-6 w-full">
        {/* Positive Graph */}
        <SentimentTrendGraph
          data={sentimentGraphs.positive}
          sentiment="positive"
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
          uniqueDates={uniqueDates}
        />

        {/* Neutral Graph */}
        <SentimentTrendGraph
          data={sentimentGraphs.neutral}
          sentiment="neutral"
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
          uniqueDates={uniqueDates}
        />

        {/* Negative Graph */}
        <SentimentTrendGraph
          data={sentimentGraphs.negative}
          sentiment="negative"
          clusterMode={clusterMode}
          clusterEntities={clusterEntities}
          onRefresh={onRefresh}
          uniqueDates={uniqueDates}
        />
      </div>

      {/* Summary Stats */}
      <div className="bg-background/50 border border-border rounded-lg p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Positive</p>
          <p className="text-2xl font-bold text-green-500">
            {sentimentGraphs.positive.reduce((sum, item) => sum + (item.value || 0), 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Neutral</p>
          <p className="text-2xl font-bold text-purple-500">
            {sentimentGraphs.neutral.reduce((sum, item) => sum + (item.value || 0), 0)}
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
