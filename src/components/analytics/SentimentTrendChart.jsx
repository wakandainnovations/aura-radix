import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// Reusable chart component
function SentimentChart({ data = [], title, description, chartId }) {
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
          <YAxis tick={{ fill: "#888", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => [value, '']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
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
  // Handle cluster mode - data comes in different format
  if (clusterMode && clusterData?.entities && clusterData.entities.length > 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {clusterData.entities.map((entity, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {entity.name} - Sentiment Trend
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Sentiment distribution over time
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={entity.sentiments || []}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#888", fontSize: 12 }}
                    tickFormatter={(value) => value}
                  />
                  <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => [value, '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render both Celebrity and Movie charts
  const hasCelebrity = celebritySentimentData && celebritySentimentData.length > 0;
  const hasMovie = movieSentimentData && movieSentimentData.length > 0;
  const hasSingleData = sentimentData && sentimentData.length > 0;

  // If new props are provided, use them
  if (hasCelebrity || hasMovie) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <SentimentChart
            data={celebritySentimentData}
            title="Celebrity Sentiment Trend"
            description="Celebrity sentiment distribution over time (stacked)"
            chartId="celebrity"
          />
          <SentimentChart
            data={movieSentimentData}
            title="Movie Sentiment Trend"
            description="Movie sentiment distribution over time (stacked)"
            chartId="movie"
          />
        </div>
      </div>
    );
  }

  // Fallback to single entity mode - simple stacked area chart
  if (hasSingleData) {
    return (
      <SentimentChart
        data={sentimentData}
        title="Sentiment Trend"
        description="Sentiment distribution over time (stacked)"
        chartId="single"
      />
    );
  }

  // Show empty state only if no data provided at all
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-center h-96">
      <p className="text-muted-foreground">
        No sentiment trend data available
      </p>
    </div>
  );
}
