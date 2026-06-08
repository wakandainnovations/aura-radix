import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
  Bar,
  BarChart,
  ComposedChart,
} from 'recharts';
import { GitBranch } from 'lucide-react';
import { checkpointService } from '../../api';
import { useSortableRows, SortableHeader } from '../shared';

export default function CheckpointTrendView({ entityId, entityName }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['checkpoint-trend', entityId],
    queryFn: () => checkpointService.getCheckpointTrend(entityId),
    enabled: !!entityId,
  });

  const trendPoints = data?.trendPoints || [];

  // Charts stay chronological; only the table below reorders when sorted.
  const { rows: sortedTrend, sortState, requestSort } = useSortableRows(trendPoints, null);
  const sp = (sortKey, align = 'left') => ({ sortKey, sortState, onSort: requestSort, align });

  const chartData = trendPoints.map((pt) => ({
    label: pt.description,
    date: pt.checkpointDate,
    positiveRatio: +(pt.positiveRatio * 100).toFixed(1),
    netSentiment: +pt.netSentiment.toFixed(2),
    periodMentions: pt.periodMentions,
    cumulativeMentions: pt.cumulativeMentions,
  }));

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Checkpoint Trend</h3>
        <span className="text-xs text-muted-foreground">Sentiment evolution across checkpoints</span>
      </div>

      <div className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading trend data...</p>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-6">Failed to load trend data</p>
        ) : trendPoints.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No trend data. Add at least two checkpoints to see the trend.
          </p>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Net Sentiment & Positive Ratio</h4>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#888', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis yAxisId="left" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888', fontSize: 12 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value, name) => {
                      if (name === 'Positive Ratio') return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="netSentiment"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    name="Net Sentiment"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="positiveRatio"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#22c55e' }}
                    name="Positive Ratio"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Mention Volume Per Checkpoint Period</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#888', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="periodMentions" fill="#6366f1" name="Period Mentions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cumulativeMentions" fill="#6366f1" fillOpacity={0.3} name="Cumulative" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <SortableHeader label="Checkpoint" {...sp('description')} />
                    <SortableHeader label="Date" {...sp('checkpointDate')} />
                    <SortableHeader label="Period Mentions" {...sp('periodMentions', 'right')} />
                    <SortableHeader label="Cumulative" {...sp('cumulativeMentions', 'right')} />
                    <SortableHeader label="Positive %" {...sp('positiveRatio', 'right')} />
                    <SortableHeader label="Net Sentiment" {...sp('netSentiment', 'right')} />
                    <SortableHeader label="Δ Positive %" {...sp('positiveRatioChangeFromPrevious', 'right')} />
                    <SortableHeader label="Δ Net Sentiment" {...sp('netSentimentChangeFromPrevious', 'right')} />
                  </tr>
                </thead>
                <tbody>
                  {sortedTrend.map((pt, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-2 px-3 font-medium text-foreground">{pt.description}</td>
                      <td className="py-2 px-3 text-muted-foreground">{pt.checkpointDate}</td>
                      <td className="py-2 px-3 text-right text-foreground">{pt.periodMentions}</td>
                      <td className="py-2 px-3 text-right text-foreground">{pt.cumulativeMentions}</td>
                      <td className="py-2 px-3 text-right text-foreground">{(pt.positiveRatio * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right text-foreground">{pt.netSentiment.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">
                        {pt.positiveRatioChangeFromPrevious != null ? (
                          <span className={pt.positiveRatioChangeFromPrevious >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {pt.positiveRatioChangeFromPrevious >= 0 ? '+' : ''}
                            {(pt.positiveRatioChangeFromPrevious * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {pt.netSentimentChangeFromPrevious != null ? (
                          <span className={pt.netSentimentChangeFromPrevious >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {pt.netSentimentChangeFromPrevious >= 0 ? '+' : ''}
                            {pt.netSentimentChangeFromPrevious.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
