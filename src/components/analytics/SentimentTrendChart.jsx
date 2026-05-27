import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

function SentimentChart({ data = [], title, description, checkpoints = [] }) {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100;
    const max = Math.max(
      ...data.map(d => Math.max(d.positive || 0, d.neutral || 0, d.negative || 0))
    );
    return max || 100;
  }, [data]);

  const checkpointDates = useMemo(
    () => new Set(checkpoints.map(c => c.date)),
    [checkpoints]
  );

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#888", fontSize: 12 }}
            tickFormatter={(value) => value}
          />
          <YAxis
            tick={{ fill: "#888", fontSize: 12 }}
            domain={[0, Math.ceil(maxValue * 1.1)]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => [value, '']}
            labelFormatter={(label) => {
              const cp = checkpoints.find(c => c.date === label);
              return cp ? `Date: ${label} — ${cp.description}` : `Date: ${label}`;
            }}
          />
          <Legend />
          {checkpoints.map((cp, i) => (
            <ReferenceLine
              key={`cp-${i}`}
              x={cp.date}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: cp.description,
                position: "top",
                fill: "#f59e0b",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            name="Positive"
          />
          <Line
            type="monotone"
            dataKey="neutral"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
            name="Neutral"
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Negative"
          />
        </LineChart>
      </ResponsiveContainer>
      {checkpoints.length > 0 && (
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-4 h-0 border-t-2 border-dashed border-amber-500" />
            Checkpoints
          </span>
          {checkpoints.map((cp, i) => (
            <span key={i} className="text-xs text-amber-500/80">
              {cp.date}: {cp.description}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SentimentTrendChart({
  sentimentData = [],
  celebritySentimentData = [],
  movieSentimentData = [],
  clusterMode = false,
  clusterData = null
}) {
  if (clusterMode && clusterData?.entities && clusterData.entities.length > 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {clusterData.entities.map((entity, idx) => (
            <SentimentChart
              key={idx}
              data={entity.sentiments || []}
              title={`${entity.name} - Sentiment Trend`}
              description="Sentiment distribution over time"
              checkpoints={entity.checkpoints || []}
            />
          ))}
        </div>
      </div>
    );
  }

  const hasCelebrity = celebritySentimentData && celebritySentimentData.length > 0;
  const hasMovie = movieSentimentData && movieSentimentData.length > 0;
  const hasSingleData = sentimentData && sentimentData.length > 0;

  if (hasCelebrity || hasMovie) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <SentimentChart
            data={celebritySentimentData}
            title="Celebrity Sentiment Trend"
            description="Celebrity sentiment distribution over time (stacked)"
          />
          <SentimentChart
            data={movieSentimentData}
            title="Movie Sentiment Trend"
            description="Movie sentiment distribution over time (stacked)"
          />
        </div>
      </div>
    );
  }

  if (hasSingleData) {
    return (
      <SentimentChart
        data={sentimentData}
        title="Sentiment Trend"
        description="Sentiment distribution over time (stacked)"
      />
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-center h-96">
      <p className="text-muted-foreground">
        No sentiment trend data available
      </p>
    </div>
  );
}
