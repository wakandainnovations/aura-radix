import { Search, Bell, User, Info } from 'lucide-react';
import { releaseCountdownLabel } from '../dateUtils';

function greetingFor(hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function CommandCenterHeader({ userName, title, releaseInDays, status, notificationCount = 3 }) {
  const greeting = greetingFor(new Date().getHours());
  const { isPast, days } = releaseCountdownLabel(releaseInDays);

  return (
    <div className="px-8 pt-6 pb-5 border-b border-white/[0.07]">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-4">
        <div className="text-sm text-white/60">
          {greeting}{userName ? `, ${userName}` : ''} 👋
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md min-w-[220px] justify-end">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-10 pr-14 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search anything..."
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/25 border border-white/10 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors shrink-0">
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors shrink-0">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-4xl font-extrabold text-white leading-none">{title}</h1>
        <span className="text-sm text-white/40">
          {isPast ? 'released' : 'releases in'} <span className="text-blue-400 font-semibold">{days}</span> days{isPast ? ' ago' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2.5 mt-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-medium tracking-wide text-white/50">CAMPAIGN STATUS</span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          {status}
        </span>
        <Info className="w-3.5 h-3.5 text-white/30" />
      </div>
    </div>
  );
}
