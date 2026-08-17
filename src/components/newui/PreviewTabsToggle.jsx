import { Eye, EyeOff } from 'lucide-react';

// Admin-only control (rendered by NewCommandCenter) for switching between the
// demo-ready subset of nav sections/sub-tabs (see previewTabs.js) and full
// access to everything, including in-progress work. Fixed to the top-right
// corner so it stays reachable regardless of which section is active.
export default function PreviewTabsToggle({ fullAccess, onToggle }) {
  const Icon = fullAccess ? Eye : EyeOff;
  return (
    <button
      onClick={() => onToggle(!fullAccess)}
      title={fullAccess ? 'Switch to demo view' : 'Show full app (in-progress work included)'}
      className={`fixed top-4 right-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium shadow-lg backdrop-blur transition-colors ${
        fullAccess
          ? 'bg-blue-600/90 border-blue-500 text-white hover:bg-blue-600'
          : 'bg-white/[0.06] border-white/15 text-white/70 hover:bg-white/[0.1]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      Full access {fullAccess ? 'on' : 'off'}
    </button>
  );
}
