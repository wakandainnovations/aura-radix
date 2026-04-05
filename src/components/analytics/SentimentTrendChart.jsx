import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SentimentTrendChart({ sentimentData = [], clusterMode = false, clusterData = null }) {
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
                <AreaChart
                  data={entity.sentiments}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id={`colorPositive-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id={`colorNeutral-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id={`colorNegative-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill={`url(#colorPositive-${idx})`}
                    name="Positive"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#a78bfa"
                    fillOpacity={1}
                    fill={`url(#colorNeutral-${idx})`}
                    name="Neutral"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill={`url(#colorNegative-${idx})`}
                    name="Negative"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single entity mode - simple stacked area chart
  if (!sentimentData || sentimentData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          No sentiment trend data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Sentiment Trend
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Sentiment distribution over time (stacked)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={sentimentData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#888", fontSize: 12 }}
            tickFormatter={(value) => {
              // Use the date field as-is, regardless of format
              // Handles: YYYY-MM-DD, YYYY-Www (week), YYYY-MM (month), etc.
              return value;
            }}
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
          <Area
            type="monotone"
            dataKey="positive"
            stackId="1"
            stroke="#22c55e"
            fillOpacity={1}
            fill="url(#colorPositive)"
            name="Positive"
          />
          <Area
            type="monotone"
            dataKey="neutral"
            stackId="1"
            stroke="#a78bfa"
            fillOpacity={1}
            fill="url(#colorNeutral)"
            name="Neutral"
          />
          <Area
            type="monotone"
            dataKey="negative"
            stackId="1"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorNegative)"
            name="Negative"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
