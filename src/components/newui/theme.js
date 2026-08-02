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
  red: 'bg-red-500/15 text-red-400',
  amber: 'bg-amber-500/15 text-amber-400',
  pink: 'bg-pink-500/15 text-pink-400',
  purple: 'bg-purple-500/15 text-purple-400',
  teal: 'bg-teal-500/15 text-teal-400',
  gray: 'bg-white/[0.08] text-white/60',
};

// Fixed categorical palette for charts (donuts, multi-line series, bars) —
// used in a stable order per the dataviz palette convention.
export const SERIES_COLORS = ['#3987e5', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#22d3ee', '#f472b6', '#94a3b8'];

export const PLATFORM_COLOR = {
  YouTube: '#f87171',
  Instagram: '#f472b6',
  'X (Twitter)': '#cbd5e1',
  Facebook: '#3987e5',
  Reddit: '#fb923c',
  WhatsApp: '#34d399',
  'News / Web': '#a78bfa',
  'News & Blogs': '#a78bfa',
  Others: '#64748b',
};

export const thClass = 'text-left text-[11px] font-medium text-white/35 uppercase tracking-wide pb-2.5 px-1.5 first:pl-0 last:pr-0';
export const tdClass = 'py-3 text-sm text-white/80 align-middle px-1.5 first:pl-0 last:pr-0';
export const trClass = 'border-t border-white/[0.05]';
