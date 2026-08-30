import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Panel, PanelLink } from '../shared/Panel';
import AddCompetitorModal from './AddCompetitorModal';
import { formatCompact } from '../formatCompact';

// Mirrors CompetitivePositioning's formatPercentage: the backend sends
// positiveRatio as a 0-1 fraction, but tolerate an already-scaled 0-100
// value too so this doesn't silently mis-render if that ever changes.
function formatPositiveRatio(ratio) {
  return Math.round(ratio <= 1 ? ratio * 100 : ratio);
}

// Same 60% / 40% good/warning/bad thresholds CompetitivePositioning uses
// for positiveRatio, so a competitor reads the same way in both UIs.
function positiveRatioHue(ratio) {
  const pct = formatPositiveRatio(ratio);
  if (pct >= 60) return 'text-emerald-400';
  if (pct >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function formatMentions(count) {
  if (count == null) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

// Left blank (rather than showing an "N/A" label) whenever the competitor's
// own entity id couldn't be resolved, its /reach-direct call failed, or that
// per-competitor fetch is still in flight — only a resolved count is shown.
function formatUniqueUsers(competitor) {
  if (competitor.uniqueUsers == null) return null;
  return formatCompact(competitor.uniqueUsers);
}

function CompetitorRow({ competitor }) {
  const mentions = formatMentions(competitor.totalMentions);
  const uniqueUsers = formatUniqueUsers(competitor);
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-semibold text-white/60 shrink-0">
        {competitor.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-white/85 truncate">{competitor.name}</span>
          {competitor.positiveRatio != null && (
            <span className={`text-xs font-semibold shrink-0 ${positiveRatioHue(competitor.positiveRatio)}`}>
              {formatPositiveRatio(competitor.positiveRatio)}% positive
            </span>
          )}
        </div>
        {(mentions || uniqueUsers) && (
          <div className="text-[11px] text-white/35 truncate">
            {mentions && <span>{mentions} mentions</span>}
            {mentions && uniqueUsers && <span> · </span>}
            {uniqueUsers && <span>{uniqueUsers} unique users</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompetitorWatchPanel({ competitors, isLoading = false, entityId }) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <Panel title="COMPETITOR WATCH" className="min-w-0" control={<PanelLink className="mt-0">View all</PanelLink>}>
      {isLoading ? (
        <div className="mt-2 flex-1 space-y-2.5 animate-pulse" role="status" aria-label="Loading competitor watch">
          <div className="h-3.5 bg-white/10 rounded w-2/3" />
          <div className="h-3.5 bg-white/10 rounded w-1/2" />
          <div className="h-3.5 bg-white/10 rounded w-3/5" />
        </div>
      ) : competitors.length > 0 ? (
        <div className="space-y-4 flex-1 mt-2">
          {competitors.map((c) => (
            <CompetitorRow key={c.name} competitor={c} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/35 mt-2 flex-1">No competitors added yet</p>
      )}

      {entityId != null && (
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors self-start mt-3"
        >
          <Plus className="w-3.5 h-3.5" />
          Add competitor
        </button>
      )}

      {entityId != null && (
        <AddCompetitorModal
          open={addOpen}
          onOpenChange={setAddOpen}
          entityId={entityId}
          existingCompetitors={competitors}
        />
      )}
    </Panel>
  );
}
