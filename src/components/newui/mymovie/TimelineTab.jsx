import { Music2, Rocket, Newspaper, Users, Truck, Star, Sparkles } from 'lucide-react';
import { Panel, PanelLink, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import AIInsightBar from '../shared/AIInsightBar';
import { CARD } from '../theme';
import { timelineData } from './myMovieTabsData';

const TRACK_ICONS = { content: Music2, marketing: Rocket, media: Newspaper, events: Users, distribution: Truck };
const TIMELINE_TICKS = [
  { label: 'Apr 28', pct: 0 },
  { label: 'May 3', pct: 27 },
  { label: 'May 8', pct: 53 },
  { label: 'May 12', pct: 73 },
  { label: 'May 15', pct: 100 },
];

function GanttTrack({ track }) {
  const Icon = TRACK_ICONS[track.key];
  return (
    <div className="flex items-start gap-4 py-3 border-t border-white/[0.05] first:border-t-0">
      <div className="w-48 shrink-0 flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-white/60" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white/80 uppercase tracking-wide truncate">{track.label}</div>
          <div className="text-[11px] text-white/35">{track.count} activities</div>
        </div>
      </div>
      <div className="relative flex-1 min-w-0 h-11">
        {track.segments.map((seg, i) => (
          <div
            key={i}
            className={`absolute top-0 h-11 rounded-md border px-2.5 py-1 overflow-hidden ${track.colorClass}`}
            style={{ left: `${seg.startPct}%`, width: `${Math.max(seg.widthPct, 6)}%` }}
            title={`${seg.label} (${seg.sublabel})`}
          >
            <div className="text-[11px] font-medium truncate">{seg.label}</div>
            <div className="text-[10px] opacity-70 truncate">{seg.sublabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimelineTab() {
  const d = timelineData;

  return (
    <div className="p-6 space-y-4">
      <Panel
        title="CAMPAIGN TIMELINE"
        info
        description="Track key campaign activities, releases and milestones."
        control={<DropdownPill>Timeline</DropdownPill>}
      >
        <div className="relative mb-2 h-5 ml-48">
          {TIMELINE_TICKS.map((t) => (
            <span
              key={t.label}
              className="absolute text-[11px] text-white/35 -translate-x-1/2"
              style={{ left: `${t.pct}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>

        <div>
          {d.tracks.map((track) => (
            <GanttTrack key={track.key} track={track} />
          ))}
        </div>

        <div className="flex items-start gap-4 py-3 border-t border-white/[0.05]">
          <div className="w-48 shrink-0 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 text-violet-300" />
            </div>
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">Milestones</div>
          </div>
          <div className="relative flex-1 min-w-0 h-8">
            {d.milestones.map((m) => (
              <div
                key={m.label}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${m.startPct}%` }}
                title={m.label}
              >
                <span className="w-2.5 h-2.5 rotate-45 bg-violet-400 shrink-0" />
                <span className="text-[10px] text-white/50 mt-1 whitespace-nowrap">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="UPCOMING KEY ACTIVITIES" info>
          <div className="space-y-3.5 flex-1">
            {d.upcomingActivities.map((a) => (
              <div key={a.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="text-white/80 truncate">{a.label}</div>
                  <div className="text-[11px] text-white/35">{a.category}</div>
                </div>
                <span className="text-white/50 text-xs shrink-0">{a.date}</span>
              </div>
            ))}
          </div>
          <PanelLink>View full schedule</PanelLink>
        </Panel>

        <Panel title="CAMPAIGN PROGRESS" info>
          <LegendDonut data={d.campaignProgress} centerValue="60%" centerLabel="Completed" size={140} />
          <PanelLink>View all activities</PanelLink>
        </Panel>

        <Panel title="ACTIVITY HEALTH" info description="Track how your activities are performing vs plan.">
          <div className="grid grid-cols-3 gap-3 flex-1">
            {d.activityHealth.map((h) => {
              const tone = h.tone === 'good' ? 'text-emerald-400' : h.tone === 'warning' ? 'text-amber-400' : 'text-red-400';
              const barColor = h.tone === 'good' ? 'bg-emerald-400' : h.tone === 'warning' ? 'bg-amber-400' : 'bg-red-400';
              return (
                <div key={h.label} className={`rounded-lg p-3 bg-white/[0.03] border border-white/[0.06]`}>
                  <div className={`text-xs font-medium ${tone}`}>{h.label}</div>
                  <div className="text-2xl font-bold text-white mt-1">{h.value}</div>
                  <div className="text-[11px] text-white/35 mb-2">{h.pct}%</div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${h.pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <PanelLink>View at risk activities</PanelLink>
        </Panel>
      </div>

      <AIInsightBar insight={d.aiInsight} ctaLabel="View AI Recommendation" />
    </div>
  );
}
