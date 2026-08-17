import { Eye, EyeOff } from 'lucide-react';

// Admin-only control (rendered by NewCommandCenter) for showing/hiding the
// in-progress nav sections and sub-tabs listed in previewTabs.js. Fixed to
// the top-right corner so it stays reachable regardless of which section is
// active, including when Command Center/AI Producer are themselves hidden.
export default function PreviewTabsToggle({ showPreviewTabs, onToggle }) {
  const Icon = showPreviewTabs ? Eye : EyeOff;
  return (
    <button
      onClick={() => onToggle(!showPreviewTabs)}
      title={showPreviewTabs ? 'Hide in-progress tabs' : 'Show in-progress tabs'}
      className={`fixed top-4 right-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium shadow-lg backdrop-blur transition-colors ${
        showPreviewTabs
          ? 'bg-blue-600/90 border-blue-500 text-white hover:bg-blue-600'
          : 'bg-white/[0.06] border-white/15 text-white/70 hover:bg-white/[0.1]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      Preview tabs {showPreviewTabs ? 'on' : 'off'}
    </button>
  );
}
