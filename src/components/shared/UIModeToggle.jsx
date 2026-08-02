import { Sparkles, RotateCcw } from 'lucide-react';
import { useUIMode } from '../../contexts/UIModeContext';

// Admin-only floating control for switching between the classic UI and the
// new UI. Rendered by App.jsx only when isAdmin is true, so it stays out of
// the way for regular users.
export default function UIModeToggle() {
  const { isNewUI, toggleUIMode } = useUIMode();

  return (
    <button
      onClick={toggleUIMode}
      className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-2xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
      title={isNewUI ? 'Switch back to the classic UI' : 'Preview the new UI'}
    >
      {isNewUI ? (
        <>
          <RotateCcw className="w-4 h-4" />
          Classic UI
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 text-primary" />
          Try New UI
        </>
      )}
    </button>
  );
}
