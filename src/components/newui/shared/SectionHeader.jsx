import { Calendar, GitCompare, Share2, Bell, User, Download } from 'lucide-react';
import TabRow from './TabRow';

// Generic top header for every section besides My Movie (which has its own
// poster/status/countdown header — see MovieOverviewHeader). Title + subtitle,
// date range/compare/share/bell/avatar controls, tab row, optional "LIVE" pill
// and optional right-most action button (e.g. "+ New Campaign").
export default function SectionHeader({
  title,
  subtitle,
  livePill,
  dateRangeLabel = 'May 1 – May 15, 2025',
  showExport = false,
  actionButton,
  tabs,
  activeTab,
  onTabChange,
  notificationCount = 3,
}) {
  return (
    <div className="px-8 pt-6 pb-0 border-b border-white/[0.07]">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white leading-none">{title}</h1>
            {livePill && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-bold tracking-wide">
                LIVE
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {actionButton}
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <Calendar className="w-4 h-4" />
            {dateRangeLabel}
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <GitCompare className="w-4 h-4" />
            Compare
          </button>
          {showExport ? (
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          ) : (
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors">
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {tabs && (
        <div className="mt-4">
          <TabRow tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      )}
    </div>
  );
}
