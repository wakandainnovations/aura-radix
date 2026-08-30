import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  LayoutGrid,
  Clapperboard,
  Users,
  Target,
  ClipboardList,
  ShieldAlert,
  Bot,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { SIDEBAR_BG } from './theme';
import SwitchMovieMenu from './SwitchMovieMenu';
import PreviewTabsToggle from './PreviewTabsToggle';

const NAV_ITEMS = [
  { key: 'command-center', label: 'Command Center', icon: LayoutGrid },
  { key: 'my-movie', label: 'My Movie', icon: Clapperboard },
  { key: 'audience-intelligence', label: 'Audience Intelligence', icon: Users },
  { key: 'competitor-intelligence', label: 'Competitor Intelligence', icon: Target },
  { key: 'campaign-planner', label: 'Campaign Planner', icon: ClipboardList },
  { key: 'war-room', label: 'War Room', icon: ShieldAlert },
  { key: 'ai-producer', label: 'AI Copilot', icon: Bot },
];

export default function NewUISidebar({
  activeItem = 'my-movie',
  onSelect,
  movieTitle,
  releaseInDays,
  movies,
  selectedMovie,
  onSelectMovie,
  userName,
  onLogout,
  hiddenNavKeys = [],
  isAdmin = false,
  fullAccess = false,
  onToggleFullAccess,
}) {
  const displayName = userName || 'Account';
  const navItems = NAV_ITEMS.filter((item) => !hiddenNavKeys.includes(item.key));
  return (
    <div className={`w-64 shrink-0 h-full flex flex-col ${SIDEBAR_BG}`}>
      <div className="px-5 pt-6 pb-5">
        <div className="text-white font-extrabold tracking-wide text-lg leading-none">FRAMEHOUSE</div>
        <div className="text-[10px] tracking-[0.2em] text-white/40 mt-1.5">AI OPERATING SYSTEM</div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
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
        <SwitchMovieMenu
          movies={movies}
          selectedMovie={selectedMovie}
          onSelect={onSelectMovie}
          fallbackTitle={movieTitle}
          releaseInDays={releaseInDays}
        />
      </div>

      {isAdmin && (
        <div className="px-3 pb-3">
          <PreviewTabsToggle fullAccess={fullAccess} onToggle={onToggleFullAccess} />
        </div>
      )}

      <div className="border-t border-white/[0.07] px-4 py-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full flex items-center gap-3 hover:bg-white/[0.04] rounded-lg px-2 py-1.5 transition-colors outline-none">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm text-white/90 truncate">{displayName}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal container={document.body}>
            <DropdownMenu.Content
              className="overflow-hidden bg-[#0b0e19] rounded-lg border border-white/[0.07] shadow-xl w-56 z-[999] p-1"
              side="top"
              align="start"
              sideOffset={8}
            >
              <DropdownMenu.Item
                onSelect={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded text-sm text-white/80 hover:bg-white/[0.06] hover:text-white outline-none cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-white/40" />
                Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
