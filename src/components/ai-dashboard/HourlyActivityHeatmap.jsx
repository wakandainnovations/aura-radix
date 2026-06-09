import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const PERIOD_OPTIONS = [
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'DAY90', label: '90 Days' },
];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDayLabel(day) {
  const parsed = new Date(day);
  if (!isNaN(parsed.getTime())) {
    const dayName = SHORT_DAYS[parsed.getUTCDay()];
    const date = parsed.getUTCDate();
    const month = SHORT_MONTHS[parsed.getUTCMonth()];
    return `${dayName} ${date} ${month}`;
  }
  return day.length > 3 ? day.substring(0, 3) : day;
}

function getIntensity(value, max) {
  if (max === 0 || value === 0) return 'bg-slate-800';
  const ratio = value / max;
  if (ratio > 0.75) return 'bg-blue-500';
  if (ratio > 0.5) return 'bg-blue-600/80';
  if (ratio > 0.25) return 'bg-blue-700/60';
  if (ratio > 0) return 'bg-blue-800/40';
  return 'bg-slate-800';
}

export default function HourlyActivityHeatmap({ entityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('WEEK');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    dashboardService.getHourlyActivity(entityId, period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [entityId, period]);

  // Default the viewport to the most recent days (latest at the bottom);
  // the user can scroll up to reach earlier activity.
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const dailyDist = data?.dailyDistribution || {};
  // Sort oldest -> latest so the most recent day is at the bottom of the
  // scroll viewport (auto-scrolled into view above).
  const dayKeys = Object.keys(dailyDist).sort((a, b) => {
    const ta = new Date(a).getTime();
    const tb = new Date(b).getTime();
    if (isNaN(ta) || isNaN(tb)) return 0;
    return ta - tb;
  });

  let maxVal = 0;
  const grid = [];

  if (dayKeys.length > 0) {
    dayKeys.forEach((day) => {
      const hourMap = dailyDist[day] || {};
      HOURS.forEach((h) => {
        const val = hourMap[h] || 0;
        if (val > maxVal) maxVal = val;
      });
    });

    dayKeys.forEach((day) => {
      const hourMap = dailyDist[day] || {};
      const hours = HOURS.map((h) => hourMap[h] || 0);
      if (hours.some((v) => v > 0)) {
        grid.push({ day: formatDayLabel(day), hours });
      }
    });
  } else if (data?.hourlyDistribution) {
    const hourMap = data.hourlyDistribution;
    HOURS.forEach((h) => {
      const val = hourMap[h] || 0;
      if (val > maxVal) maxVal = val;
    });
    grid.push({ day: 'All', hours: HOURS.map((h) => hourMap[h] || 0) });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-foreground">Hourly Activity</h3>
        </div>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                period === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {grid.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No activity data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex items-end gap-0.5 mb-1 ml-[5.5rem]">
              {HOURS.map((h) => (
                <div key={h} className="w-5 text-center text-[9px] text-muted-foreground">
                  {h % 3 === 0 ? `${h}` : ''}
                </div>
              ))}
            </div>
            <div ref={scrollRef} className="max-h-[154px] overflow-y-auto">
              {grid.map((row, ri) => (
                <div key={ri} className="flex items-center gap-0.5 mb-0.5">
                  <span className="w-20 text-right text-xs text-muted-foreground pr-1 whitespace-nowrap">
                    {row.day}
                  </span>
                  {row.hours.map((val, hi) => (
                    <div
                      key={hi}
                      className={`w-5 h-5 rounded-sm ${getIntensity(val, maxVal)} transition-colors`}
                      title={`${row.day} ${hi}:00 — ${val} active users`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 ml-[5.5rem]">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {['bg-slate-800', 'bg-blue-800/40', 'bg-blue-700/60', 'bg-blue-600/80', 'bg-blue-500'].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      )}

      {data?.totalActiveUsers != null && (
        <p className="text-xs text-muted-foreground mt-2">
          Total active users: {data.totalActiveUsers.toLocaleString()}
        </p>
      )}
    </div>
  );
}
