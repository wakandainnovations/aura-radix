import StatCard from '../shared/StatCard';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import AIInsightBar from '../shared/AIInsightBar';
import { calendarData } from './campaignData';

const WEEK_STARTS = ['Apr 27', 'May 4', 'May 11', 'May 18', 'May 25', 'Jun 1'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function weekDayNumbers(startLabel) {
  const [mon, dayStr] = startLabel.split(' ');
  const day = parseInt(dayStr, 10);
  const daysInMonth = mon === 'Apr' ? 30 : mon === 'May' ? 31 : 30;
  const out = [];
  let m = mon;
  let d = day;
  for (let i = 0; i < 7; i++) {
    out.push(`${d}`);
    d += 1;
    if (d > daysInMonth) {
      d = 1;
      m = m === 'Apr' ? 'May' : 'Jun';
    }
  }
  return out;
}

export default function CalendarTab() {
  const d = calendarData;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        <DropdownPill>Month</DropdownPill>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} caption={s.caption} />
        ))}
      </div>

      <Panel title="CAMPAIGN CALENDAR" info description="View all planned campaigns and key milestones.">
        <div className="text-sm font-semibold text-white/70 mb-2">May – June 2025</div>
        <div className="grid grid-cols-7 border-t border-l border-white/[0.06]">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-[11px] text-white/35 px-2 py-1.5 border-r border-b border-white/[0.06]">{wd}</div>
          ))}
        </div>
        {WEEK_STARTS.map((weekStart, weekIdx) => {
          const days = weekDayNumbers(weekStart);
          const weekEvents = d.events.filter((e) => e.weekIdx === weekIdx);
          return (
            <div key={weekStart} className="relative grid grid-cols-7 border-l border-white/[0.06]" style={{ minHeight: 64 }}>
              {days.map((dayNum, i) => (
                <div key={i} className="border-r border-b border-white/[0.06] px-2 py-1.5 text-[11px] text-white/35">
                  {dayNum}
                </div>
              ))}
              {weekEvents.map((e) => (
                <div
                  key={e.label}
                  className={`absolute text-[10px] font-medium text-white px-1.5 py-1 rounded ${e.color}`}
                  style={{
                    top: 20,
                    left: `${(e.startCol / 7) * 100}%`,
                    width: `${(Math.min(e.span, 7 - e.startCol) / 7) * 100}%`,
                  }}
                  title={e.range}
                >
                  <div className="truncate">{e.label}</div>
                  <div className="truncate opacity-75">{e.range}</div>
                </div>
              ))}
            </div>
          );
        })}
        <div className="text-[11px] text-white/30 mt-2">Color shows primary objective</div>
        <PanelLink>View full calendar</PanelLink>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="UPCOMING MILESTONES" info control={<DropdownPill>Next 30 days</DropdownPill>}>
          <div className="space-y-3 flex-1">
            {d.milestones.map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-white/50 shrink-0">{m.date}</span>
                  <span className="text-white/80 truncate">{m.label}</span>
                </div>
                <span className="text-[11px] text-white/35 shrink-0">{m.tag}</span>
              </div>
            ))}
          </div>
          <PanelLink>View all milestones</PanelLink>
        </Panel>

        <Panel title="CAMPAIGN DISTRIBUTION (30 DAYS)" info description="By channel spend.">
          <LegendDonut data={d.distribution} centerValue="₹1.9 Cr" centerLabel="Total Spend" size={130} />
          <PanelLink>View full distribution plan</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} actions={d.actions} ctaLabel="View AI Recommendations" />
    </div>
  );
}
