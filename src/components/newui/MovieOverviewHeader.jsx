import { Calendar, GitCompare, Share2, Bell, User } from 'lucide-react';

const TABS = ['Overview', 'Performance', 'Timeline', 'Assets', 'Reports'];

export default function MovieOverviewHeader({
  title,
  status,
  releaseInDays,
  dateRangeLabel,
  activeTab,
  onTabChange,
  notificationCount = 0,
}) {
  return (
    <div className="px-8 pt-6 pb-0 border-b border-white/[0.07]">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-sm text-white/40 mb-1">My Movie</div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-extrabold text-white leading-none">{title}</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {status}
            </span>
            <span className="text-sm text-white/40">
              Releasing in {releaseInDays} days
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <Calendar className="w-4 h-4" />
            {dateRangeLabel}
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <GitCompare className="w-4 h-4" />
            Compare
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
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

      <div className="flex items-center gap-6 mt-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange?.(tab)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              tab === activeTab ? 'text-blue-400' : 'text-white/45 hover:text-white/70'
            }`}
          >
            {tab}
            {tab === activeTab && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
