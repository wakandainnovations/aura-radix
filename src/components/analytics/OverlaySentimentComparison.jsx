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

  // Generate colors dynamically for all entities
  const generateEntityColors = useMemo(() => {
    const colors = [
      { positive: "#10b981", negative: "#ef4444", neutral: "#a78bfa" },
      { positive: "#06d9ff", negative: "#ff9500", neutral: "#ec4899" },
      { positive: "#f59e0b", negative: "#8b5cf6", neutral: "#06b6d4" },
      { positive: "#14b8a6", negative: "#f87171", neutral: "#d946ef" },
      { positive: "#eab308", negative: "#c084fc", neutral: "#22d3ee" },
    ];
    return colors;
  }, []);

  // Transform data for overlay comparison
  // Group by date and combine sentiment scores from all entities
  const { transformedData, maxValue } = useMemo(() => {
    if (!clusterData?.entities || clusterData.entities.length === 0) {
      return { transformedData: [], maxValue: 0 };
    }

    const dateMap = new Map();

    // Process each entity
    clusterData.entities.forEach((entity, entityIdx) => {
      if (!entity.sentiments) return;
      
      entity.sentiments.forEach((sentiment) => {
        const date = sentiment.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }
        const row = dateMap.get(date);
        // Add entity-specific data with unique keys
        row[`${entity.name}_positive`] = sentiment.positive || 0;
        row[`${entity.name}_negative`] = sentiment.negative || 0;
        row[`${entity.name}_neutral`] = sentiment.neutral || 0;
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
  if (!clusterData?.entities || clusterData.entities.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Select entities to view sentiment comparison
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Sentiment Comparison: {clusterData.entities.map(e => e.name).join(" , ")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Overlaid sentiment trends for {clusterData.entities.length} entit{clusterData.entities.length !== 1 ? 'ies' : 'y'}
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

          {/* Dynamically render lines for all entities */}
          {clusterData.entities.map((entity, entityIdx) => {
            const colors = generateEntityColors[Math.min(entityIdx, generateEntityColors.length - 1)];
            return (
              <React.Fragment key={entityIdx}>
                <Line
                  type="monotone"
                  dataKey={`${entity.name}_positive`}
                  stroke={colors.positive}
                  strokeWidth={2}
                  dot={false}
                  name={`${entity.name} - Positive`}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey={`${entity.name}_negative`}
                  stroke={colors.negative}
                  strokeWidth={2}
                  dot={false}
                  name={`${entity.name} - Negative`}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey={`${entity.name}_neutral`}
                  stroke={colors.neutral}
                  strokeWidth={2}
                  dot={false}
                  name={`${entity.name} - Neutral`}
                  isAnimationActive={true}
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend/Info for all entities */}
      <div className="mt-4 grid gap-4 text-xs" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
        {clusterData.entities.map((entity, idx) => {
          const colors = generateEntityColors[Math.min(idx, generateEntityColors.length - 1)];
          return (
            <div key={idx} className="bg-background/50 p-3 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{entity.name}</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors.positive}}></div>
                  <span className="text-muted-foreground">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors.negative}}></div>
                  <span className="text-muted-foreground">Negative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: colors.neutral}}></div>
                  <span className="text-muted-foreground">Neutral</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
