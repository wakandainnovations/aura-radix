import { Info } from 'lucide-react';
import { releaseCountdownLabel } from '../dateUtils';
import NotificationBell from '../../notifications/NotificationBell';

const BELL_BUTTON_CLASS =
  'relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] transition-colors shrink-0';
const BELL_PANEL_CLASS =
  'absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#0b0e19] shadow-2xl z-50';

function greetingFor(hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function CommandCenterHeader({ userName, title, releaseInDays, status }) {
  const greeting = greetingFor(new Date().getHours());
  const { isPast, days } = releaseCountdownLabel(releaseInDays);

  return (
    <div className="px-8 pt-6 pb-5 border-b border-white/[0.07]">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-4">
        <div className="text-sm text-white/60">
          {greeting}{userName ? `, ${userName}` : ''} 👋
        </div>

        <div className="flex items-center gap-3 justify-end">
          <NotificationBell buttonClassName={BELL_BUTTON_CLASS} panelClassName={BELL_PANEL_CLASS} />
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
