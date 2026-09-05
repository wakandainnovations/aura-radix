import { Calendar, GitCompare, Share2, Download } from 'lucide-react';
import TabRow from './TabRow';
import NotificationBell from '../../notifications/NotificationBell';

const BELL_BUTTON_CLASS =
  'relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors';
const BELL_PANEL_CLASS =
  'absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#0b0e19] shadow-2xl z-50';

// Generic top header for every section besides My Movie (which has its own
// poster/status/countdown header — see MovieOverviewHeader). Title + subtitle,
// date range/compare/share/bell controls, tab row, optional "LIVE" pill
// and optional right-most action button (e.g. "+ New Campaign").
export default function SectionHeader({
  title,
  subtitle,
  livePill,
  dateRangeLabel = 'May 1 – May 15, 2025',
  showExport = false,
  hideDateCompareShare = false,
  actionButton,
  tabs,
  activeTab,
  onTabChange,
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
          {!hideDateCompareShare && (
            <>
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
            </>
          )}
          <NotificationBell buttonClassName={BELL_BUTTON_CLASS} panelClassName={BELL_PANEL_CLASS} />
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
