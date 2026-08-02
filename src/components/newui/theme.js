// Shared style tokens for the new UI preview, kept local to this folder so it
// doesn't fight the classic UI's design tokens while both exist side by side.

export const CARD = 'bg-[#0b0e19] border border-white/[0.07] rounded-2xl';
export const PAGE_BG = 'bg-[#05070d]';
export const SIDEBAR_BG = 'bg-[#05070d] border-r border-white/[0.07]';

export function scoreColor(value) {
  if (value >= 80) return { text: 'text-emerald-400', stroke: '#34d399', bar: 'bg-emerald-400', track: '#1c3a2d' };
  if (value >= 50) return { text: 'text-amber-400', stroke: '#fbbf24', bar: 'bg-amber-400', track: '#3a301c' };
  return { text: 'text-red-400', stroke: '#f87171', bar: 'bg-red-400', track: '#3a1c1c' };
}

export const HUE_ICON_BG = {
  violet: 'bg-violet-500/15 text-violet-400',
  blue: 'bg-blue-500/15 text-blue-400',
  green: 'bg-emerald-500/15 text-emerald-400',
  orange: 'bg-orange-500/15 text-orange-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
  indigo: 'bg-indigo-500/15 text-indigo-400',
};
