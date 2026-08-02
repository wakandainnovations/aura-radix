import { Sparkles, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import { CARD } from './theme';

function InsightShell({ icon: Icon, iconClass, label, children }) {
  return (
    <div className={`${CARD} p-5 flex flex-col`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs font-semibold tracking-wide text-white/50 mb-2">{label}</div>
      {children}
    </div>
  );
}

function KeyInsightCard({ insight }) {
  return (
    <InsightShell icon={Sparkles} iconClass="bg-blue-500/15 text-blue-400" label="KEY INSIGHT">
      <p className="text-sm text-white/75 flex-1">{insight.text}</p>
      <button className="mt-4 px-3.5 py-2 rounded-lg border border-white/10 text-sm text-white/80 hover:bg-white/[0.05] transition-colors self-start">
        View Insight Details
      </button>
    </InsightShell>
  );
}

function TopGrowingRegionCard({ region }) {
  return (
    <InsightShell icon={MapPin} iconClass="bg-blue-500/15 text-blue-400" label="TOP GROWING REGION">
      <div className="flex items-center justify-between gap-3 flex-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-white">{region.name}</span>
            <span className="flex items-center gap-0.5 text-emerald-400 text-sm font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              {region.deltaPct}%
            </span>
          </div>
          <div className="text-xs text-white/40 mt-1">{region.caption}</div>
        </div>

        {/* Decorative dot-map placeholder with a glowing marker on the top region */}
        <div
          className="relative w-20 h-20 rounded-lg shrink-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1.5px)',
            backgroundSize: '7px 7px',
          }}
        >
          <span className="absolute top-4 right-5 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_4px_rgba(96,165,250,0.55)]" />
        </div>
      </div>
    </InsightShell>
  );
}

function BiggestRiskCard({ risk }) {
  return (
    <InsightShell icon={AlertTriangle} iconClass="bg-red-500/15 text-red-400" label="BIGGEST RISK">
      <p className="text-sm text-white/75 flex-1">{risk.text}</p>
      <button className="mt-4 px-3.5 py-2 rounded-lg border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-colors self-start">
        View Risk Details
      </button>
    </InsightShell>
  );
}

export default function InsightCards({ insights }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <KeyInsightCard insight={insights.key} />
      <TopGrowingRegionCard region={insights.topRegion} />
      <BiggestRiskCard risk={insights.biggestRisk} />
    </div>
  );
}
