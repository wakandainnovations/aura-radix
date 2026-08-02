import {
  LayoutGrid,
  Clapperboard,
  Users,
  Target,
  ClipboardList,
  ShieldAlert,
  Bot,
  ChevronDown,
} from 'lucide-react';
import { SIDEBAR_BG } from './theme';

const NAV_ITEMS = [
  { key: 'command-center', label: 'Command Center', icon: LayoutGrid },
  { key: 'my-movie', label: 'My Movie', icon: Clapperboard },
  { key: 'audience-intelligence', label: 'Audience Intelligence', icon: Users },
  { key: 'competitor-intelligence', label: 'Competitor Intelligence', icon: Target },
  { key: 'campaign-planner', label: 'Campaign Planner', icon: ClipboardList },
  { key: 'war-room', label: 'War Room', icon: ShieldAlert },
  { key: 'ai-producer', label: 'AI Producer', icon: Bot },
];

export default function NewUISidebar({ activeItem = 'my-movie', onSelect, movieTitle, releaseInDays, producerName = 'Producer' }) {
  return (
    <div className={`w-64 shrink-0 h-full flex flex-col ${SIDEBAR_BG}`}>
      <div className="px-5 pt-6 pb-5">
        <div className="text-white font-extrabold tracking-wide text-lg leading-none">FRAMEHOUSE</div>
        <div className="text-[10px] tracking-[0.2em] text-white/40 mt-1.5">AI OPERATING SYSTEM</div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeItem;
          return (
            <button
              key={item.key}
              onClick={() => onSelect?.(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600/15 text-blue-400 font-medium'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wide text-white/35">SWITCH MOVIE</div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
          <div className="w-8 h-10 rounded bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm text-white/90 truncate">{movieTitle}</div>
            <div className="text-xs text-white/40">Releasing in {releaseInDays} days</div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
        </button>
      </div>

      <div className="border-t border-white/[0.07] px-4 py-3">
        <button className="w-full flex items-center gap-3 hover:bg-white/[0.04] rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {producerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm text-white/90 truncate">{producerName}</div>
            <div className="text-xs text-white/40">Producer</div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
        </button>
      </div>
    </div>
  );
}
