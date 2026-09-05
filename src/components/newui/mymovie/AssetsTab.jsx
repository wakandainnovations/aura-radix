import { useState } from 'react';
import { Search, Upload, Image as ImageIcon, LayoutGrid, List as ListIcon } from 'lucide-react';
import { Panel, DropdownPill } from '../shared/Panel';
import LegendDonut from '../shared/LegendDonut';
import { CARD, PLATFORM_COLOR } from '../theme';
import { assetsData } from './myMovieTabsData';

const STATUS_TONE = {
  Approved: 'bg-emerald-500/20 text-emerald-400',
  'In Review': 'bg-amber-500/20 text-amber-400',
  Draft: 'bg-blue-500/20 text-blue-400',
};

const PLATFORM_LABEL = { youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', x: 'X (Twitter)' };
const PLATFORM_INITIAL = { youtube: 'Y', instagram: 'I', facebook: 'F', x: 'X' };

function AssetCard({ asset }) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="relative aspect-video bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-white/20" />
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[asset.status]}`}>
          {asset.status}
        </span>
        {asset.duration && (
          <span className="absolute bottom-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white">
            {asset.duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-medium text-white/85 truncate">{asset.title}</div>
        <div className="text-[11px] text-white/35 mb-2">{asset.type}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-1">
            {asset.platforms.map((p) => (
              <span
                key={p}
                title={PLATFORM_LABEL[p]}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[#0b0e19]"
                style={{ backgroundColor: PLATFORM_COLOR[PLATFORM_LABEL[p]] ?? '#64748b' }}
              >
                {PLATFORM_INITIAL[p]}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-white/30">Updated {asset.updated}</span>
        </div>
      </div>
    </div>
  );
}

export default function AssetsTab() {
  const d = assetsData;
  const [activeCategory, setActiveCategory] = useState('All Assets');

  return (
    <div className="p-6 space-y-4">
      <Panel
        title="ASSET LIBRARY"
        info
        description="Manage and track all your movie assets in one place."
        control={
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div>
                <div className="text-white/35">Total Assets</div>
                <div className="text-white font-semibold">{d.stats.total}</div>
              </div>
              <div>
                <div className="text-white/35">Approved</div>
                <div className="text-emerald-400 font-semibold">{d.stats.approved} ({d.stats.approvedPct}%)</div>
              </div>
              <div>
                <div className="text-white/35">In Review</div>
                <div className="text-amber-400 font-semibold">{d.stats.inReview} ({d.stats.inReviewPct}%)</div>
              </div>
              <div>
                <div className="text-white/35">Draft</div>
                <div className="text-blue-400 font-semibold">{d.stats.draft} ({d.stats.draftPct}%)</div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors whitespace-nowrap">
              <Upload className="w-4 h-4" />
              Upload Asset
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/40 flex-1 min-w-[200px]">
            <Search className="w-4 h-4" />
            Search assets...
          </div>
          <DropdownPill>All Types</DropdownPill>
          <DropdownPill>All Status</DropdownPill>
          <DropdownPill>All Platforms</DropdownPill>
          <div className="flex items-center gap-1 ml-auto">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-white/40">
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap mb-4 -mx-1">
          {d.categories.map((c) => (
            <button
              key={c.label}
              onClick={() => setActiveCategory(c.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium mx-1 transition-colors ${
                c.label === activeCategory ? 'bg-blue-600/20 text-blue-400' : 'text-white/50 hover:bg-white/[0.04]'
              }`}
            >
              {c.label} <span className="opacity-60">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {d.assets.map((a) => (
            <AssetCard key={a.title} asset={a} />
          ))}
        </div>

        <button className="mt-4 self-center px-4 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:bg-white/[0.04] transition-colors">
          Load more assets
        </button>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="ASSET PERFORMANCE SUMMARY" info description="Based on engagement across platforms (Last 30 days)">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] text-white/35 uppercase tracking-wide">
                <th className="pb-2 font-medium">Top Performing Assets</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium text-right">Score</th>
                <th className="pb-2 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {d.performanceSummary.map((a) => (
                <tr key={a.name} className="border-t border-white/[0.05]">
                  <td className="py-2.5 text-sm text-white/80">{a.name}</td>
                  <td className="py-2.5 text-sm text-white/50">{a.type}</td>
                  <td className="py-2.5 text-sm text-white/80 text-right">{a.score}</td>
                  <td className="py-2.5 text-sm text-emerald-400 text-right">↑ {a.delta}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="ASSET STATUS BREAKDOWN" info>
          <LegendDonut data={d.statusBreakdown} size={140} />
        </Panel>

        <Panel title="ASSET GAP ANALYSIS" info description="AI identified content gaps that could improve performance.">
          <div className="space-y-3 flex-1">
            {d.gaps.map((g) => (
              <div key={g.label} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/80 truncate">{g.label}</div>
                  <div className="text-[11px] text-white/35 truncate">{g.caption}</div>
                </div>
                <button className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors">
                  Create Assets
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
