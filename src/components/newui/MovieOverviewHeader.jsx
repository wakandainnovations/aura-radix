import { User } from 'lucide-react';
import { releaseCountdownLabel } from './dateUtils';
import NotificationBell from '../notifications/NotificationBell';

const DEFAULT_TABS = ['Overview', 'Performance', 'Timeline', 'Assets', 'Reports'];

const BELL_BUTTON_CLASS =
  'relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors';
const BELL_PANEL_CLASS =
  'absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#0b0e19] shadow-2xl z-50';

export default function MovieOverviewHeader({
  title,
  status,
  releaseInDays,
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
}) {
  const { isPast, days } = releaseCountdownLabel(releaseInDays);
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
              {isPast ? `Released ${days} days ago` : `Releasing in ${days} days`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <NotificationBell buttonClassName={BELL_BUTTON_CLASS} panelClassName={BELL_PANEL_CLASS} />
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-5">
        {tabs.map((tab) => (
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
