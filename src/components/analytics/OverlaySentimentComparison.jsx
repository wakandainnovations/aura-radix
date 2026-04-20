import React, { useMemo, useState } from "react";
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

export default function OverlaySentimentComparison({ clusterData = null, onRefresh = () => {} }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transform data for overlay comparison
  // Group by date and combine sentiment scores from both entities
  // Define this BEFORE the conditional check to maintain consistent hook order
  const { transformedData, maxValue } = useMemo(() => {
    if (!clusterData?.entities || clusterData.entities.length < 2) {
      return { transformedData: [], maxValue: 0 };
    }

    const dateMap = new Map();

    // Process each entity
    clusterData.entities.forEach((entity, entityIdx) => {
      (entity.sentiments || []).forEach((sentiment) => {
        const date = sentiment.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }
        const row = dateMap.get(date);
        // Add entity-specific data with unique keys
        row[`${entity.name}_positive`] = sentiment.positive;
        row[`${entity.name}_negative`] = sentiment.negative;
        row[`${entity.name}_neutral`] = sentiment.neutral;
      });
    });

    const data = Array.from(dateMap.values());

    // Calculate max value across all sentiment data
    let max = 0;
    data.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key !== "date" && typeof value === "number") {
          max = Math.max(max, value);
        }
      });
    });

    return { transformedData: data, maxValue: max };
  }, [clusterData]);

  // Check if we should show empty state
  if (!clusterData?.entities || clusterData.entities.length < 2) {
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Select both a movie and celebrity to compare sentiment
        </p>
      </div>
    );
  }

  // Define colors for each entity
  const entityColors = [
    { positive: "#10b981", negative: "#ef4444", neutral: "#a78bfa" },
    { positive: "#06d9ff", negative: "#ff9500", neutral: "#ec4899" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Sentiment Comparison: {clusterData.entities.map(e => e.name).join(" , ")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Overlaid sentiment trends for both entities
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 text-sm font-medium"
          title="Refresh data"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={transformedData}
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
            label={{ value: 'Mentions', angle: -90, position: 'insideLeft' }}
            domain={[0, Math.ceil(maxValue * 1.1)]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => value}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />

          {/* Entity 1 Lines */}
          {clusterData.entities[0] && (
            <>
              <Line
                type="monotone"
                dataKey={`${clusterData.entities[0].name}_positive`}
                stroke={entityColors[0].positive}
                strokeWidth={2}
                dot={false}
                name={`${clusterData.entities[0].name} - Positive`}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey={`${clusterData.entities[0].name}_negative`}
                stroke={entityColors[0].negative}
                strokeWidth={2}
                dot={false}
                name={`${clusterData.entities[0].name} - Negative`}
                isAnimationActive={true}
              />
            </>
          )}

          {/* Entity 2 Lines */}
          {clusterData.entities[1] && (
            <>
              <Line
                type="monotone"
                dataKey={`${clusterData.entities[1].name}_positive`}
                stroke={entityColors[1].positive}
                strokeWidth={2}
                dot={false}
                name={`${clusterData.entities[1].name} - Positive`}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey={`${clusterData.entities[1].name}_negative`}
                stroke={entityColors[1].negative}
                strokeWidth={2}
                dot={false}
                name={`${clusterData.entities[1].name} - Negative`}
                isAnimationActive={true}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend/Info */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        {clusterData.entities.map((entity, idx) => (
          <div key={idx} className="bg-background/50 p-3 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">{entity.name}</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: entityColors[idx].positive}}></div>
                <span className="text-muted-foreground">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded-full" style={{backgroundColor: entityColors[idx].negative}}></div>
                <span className="text-muted-foreground">Negative</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
