import { Info, ArrowRight } from 'lucide-react';
import { CARD } from './theme';

export default function TopPositiveThemes({ themes }) {
  return (
    <div className={`${CARD} p-5 flex flex-col`}>
      <div className="flex items-center gap-1.5 mb-4">
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">TOP POSITIVE THEMES</h3>
        <Info className="w-3.5 h-3.5 text-white/30" />
      </div>

      <div className="space-y-3.5 flex-1">
        {themes.map((theme) => (
          <div key={theme.label}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-white/70">{theme.label}</span>
              <span className="text-white/85 font-medium">{theme.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${theme.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors self-start">
        View all themes
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
