import React, { useState } from "react";
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
import { RotateCcw } from "lucide-react";

// Color mapping for sentiment types
const SENTIMENT_COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#a78bfa",
  total: "#3b82f6",
};

// Entity colors for cluster mode
const ENTITY_COLORS = [
  "#06d9ff",
  "#f59e0b",
  "#14b8a6",
  "#eab308",
  "#ec4899",
];

export default function SentimentTrendGraph({ 
  data = [], 
  sentiment = 'positive', // 'positive', 'negative', 'neutral'
  clusterMode = false,
  clusterEntities = [],
  onRefresh = () => {},
  uniqueDates = [],
  title = 'Sentiment Trend'
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-center h-96">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Get the color for this sentiment type
  const sentimentColor = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.positive;
  const graphBackgroundStyle =
    sentiment === "positive"
      ? {
          background: "linear-gradient(180deg, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.03) 100%)",
        }
      : sentiment === "negative"
        ? {
            background: "linear-gradient(180deg, rgba(239, 68, 68, 0.16) 0%, rgba(239, 68, 68, 0.03) 100%)",
          }
        : {};

  // Prepare chart data with overlaid X-axis (use unique dates from all graphs)
  let chartData;
  if (uniqueDates && uniqueDates.length > 0) {
    if (clusterMode) {
      // For cluster mode, reshape data so each date has values for each entity
      const dataByDate = {};
      uniqueDates.forEach(date => {
        dataByDate[date] = { date };
      });
      
      // Fill in values for each entity
      data.forEach(item => {
        if (dataByDate[item.date]) {
          dataByDate[item.date][item.entity || 'Unknown'] = item.total ?? item.value ?? 0;
        }
      });
      
      chartData = Object.values(dataByDate);
    } else {
      // For single mode, create a map of date -> value for quick lookup
      const dataMap = {};
      data.forEach(item => {
        dataMap[item.date] = item;
      });
      
      // Build chart data using all unique dates
      chartData = uniqueDates.map(date => ({
        date,
        value: dataMap[date]?.total ?? dataMap[date]?.value ?? 0,
        entity: dataMap[date]?.entity
      }));
    }
  } else {
    if (clusterMode) {
      // Cluster mode without unique dates - reshape data
      const dataByDate = {};
      data.forEach(item => {
        if (!dataByDate[item.date]) {
          dataByDate[item.date] = { date: item.date };
        }
        dataByDate[item.date][item.entity || 'Unknown'] = item.total ?? item.value ?? 0;
      });
      chartData = Object.values(dataByDate);
    } else {
      // Fallback: use data as-is for single mode
      chartData = data.map(item => ({
        ...item,
        value: item.total ?? item.value ?? 0
      }));
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground capitalize flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: sentimentColor }}
            />
            {sentiment} Sentiment Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {clusterMode ? `${clusterEntities.length} entities` : 'Single entity'} over time
          </p>
        </div>
        {/* <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-medium"
          title="Refresh data"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button> */}
      </div>

      <div className="rounded-md px-1 py-2" style={graphBackgroundStyle}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            syncId="sentiment-chart"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 12 }}
              height={40}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 12 }}
              label={{ value: 'Total Mentions', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />

          {/* Single entity - simple line */}
            {!clusterMode && (
              <Line
                type="monotone"
                dataKey="value"
                stroke={sentimentColor}
                strokeWidth={2}
                dot={{ fill: sentimentColor, r: 4 }}
                activeDot={{ r: 6 }}
                name={`${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Mentions`}
                isAnimationActive={true}
              />
            )}

          {/* Cluster mode - lines per entity */}
            {clusterMode && clusterEntities.map((entity, idx) => (
              <Line
                key={entity.id}
                type="monotone"
                dataKey={entity.name}
                stroke={ENTITY_COLORS[idx % ENTITY_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={entity.name}
                isAnimationActive={true}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
