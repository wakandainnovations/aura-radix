import { Heart, AlertTriangle } from 'lucide-react';
import { Panel } from '../shared/Panel';
import IndiaStatesMap from '../shared/IndiaStatesMap';

function Chip({ label, tone }) {
  const toneClass =
    tone === 'love'
      ? 'bg-pink-500/10 text-pink-300 border-pink-500/20'
      : 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  return <span className={`text-xs px-2.5 py-1 rounded-full border ${toneClass}`}>{label}</span>;
}

export default function AudiencePulsePanel({ pulse, isLoading = false }) {
  return (
    <Panel title="AUDIENCE PULSE" className="min-w-0">
      {isLoading ? (
        <div className="mt-2 flex-1 space-y-2.5 animate-pulse" role="status" aria-label="Loading audience pulse">
          <div className="h-3.5 bg-white/10 rounded w-2/3" />
          <div className="h-3.5 bg-white/10 rounded w-1/2" />
          <div className="h-3.5 bg-white/10 rounded w-3/5" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_140px] gap-3 mt-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/40 mb-2.5">Top Regions by Buzz</div>
              {pulse.topRegions.length > 0 ? (
                <div className="space-y-2.5">
                  {pulse.topRegions.map((r) => (
                    <div key={r.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3.5 text-white/30 text-xs shrink-0">{r.rank}</span>
                      <span className="flex-1 min-w-0 text-white/75 truncate">{r.name}</span>
                      <span className="text-emerald-400 text-xs font-semibold shrink-0">{r.sharePct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/35">No regional data yet</p>
              )}
            </div>
            <IndiaStatesMap regions={pulse.topRegions} height={130} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.06] flex-1">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/40 mb-2">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                People Love
              </div>
              {pulse.peopleLove.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {pulse.peopleLove.map((label) => (
                    <Chip key={label} label={label} tone="love" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/35">No data yet</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/40 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                People Concerned About
              </div>
              {pulse.peopleConcerned.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {pulse.peopleConcerned.map((label) => (
                    <Chip key={label} label={label} tone="concern" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/35">No data yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
