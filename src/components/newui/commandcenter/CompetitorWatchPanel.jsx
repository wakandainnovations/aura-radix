import { TrendingUp } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';

function CompetitorRow({ competitor }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-semibold text-white/60 shrink-0">
        {competitor.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/85 truncate">{competitor.name}</div>
        <div className="text-[11px] text-white/35 truncate">{competitor.event}</div>
      </div>
      <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400 shrink-0">
        <TrendingUp className="w-3 h-3" />
        {competitor.deltaPct}%
      </span>
    </div>
  );
}

export default function CompetitorWatchPanel({ competitors }) {
  return (
    <Panel title="COMPETITOR WATCH" className="min-w-0" control={<PanelLink className="mt-0">View all</PanelLink>}>
      <div className="space-y-4 flex-1 mt-2">
        {competitors.map((c) => (
          <CompetitorRow key={c.name} competitor={c} />
        ))}
      </div>
    </Panel>
  );
}
