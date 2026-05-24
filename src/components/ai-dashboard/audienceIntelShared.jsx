import React, { useState } from 'react';
import {
  Search, Loader2, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Minus, ExternalLink
} from 'lucide-react';

export const PLATFORM_COLORS = {
  x: 'bg-blue-500/20 text-blue-400',
  twitter: 'bg-blue-500/20 text-blue-400',
  reddit: 'bg-orange-500/20 text-orange-400',
  youtube: 'bg-red-500/20 text-red-400',
  instagram: 'bg-pink-500/20 text-pink-400',
};

export const TONE_CONFIG = {
  positive: { cls: 'text-emerald-400', icon: ThumbsUp },
  negative: { cls: 'text-red-400', icon: ThumbsDown },
  neutral: { cls: 'text-gray-400', icon: Minus },
};

export const TIER_COLORS = {
  'Viral Node': 'bg-amber-500/20 text-amber-400',
  'Amplifier': 'bg-purple-500/20 text-purple-400',
  'Participant': 'bg-blue-500/20 text-blue-400',
  'Observer': 'bg-slate-500/20 text-slate-400',
  'Micro-Influencer': 'bg-cyan-500/20 text-cyan-400',
};

export const CLASSIFICATION_COLORS = {
  'Brand Evangelist': 'bg-emerald-500/20 text-emerald-400',
  'Active Critic': 'bg-red-500/20 text-red-400',
  'Critical Power Influencer': 'bg-orange-500/20 text-orange-400',
  'Neutral Informer': 'bg-slate-500/20 text-slate-400',
  'Positive Engager': 'bg-cyan-500/20 text-cyan-400',
  'Casual Engager': 'bg-blue-500/20 text-blue-400',
  'Silent Observer': 'bg-gray-500/20 text-gray-400',
};

export const AUDIENCE_CLASSIFICATIONS = [
  'Brand Evangelist', 'Active Critic', 'Critical Power Influencer',
  'Neutral Informer', 'Positive Engager', 'Casual Engager', 'Silent Observer',
];

export const INFLUENCE_TIERS = ['Viral Node', 'Amplifier', 'Participant', 'Observer', 'Micro-Influencer'];

export const POSTING_STYLES = ['Steady Poster', 'Reactive Poster', 'Burst Poster', 'Power Burst Poster'];

export const DOMINANT_TONES = ['positive', 'negative', 'neutral'];

export const PLATFORMS = ['x', 'reddit', 'youtube', 'instagram'];

export function fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  if (typeof n !== 'number') return String(n);
  if (Math.abs(n) < 0.01 && n !== 0) return n.toFixed(Math.max(decimals, 3));
  return n.toFixed(decimals);
}

export function getDominantReach(signals) {
  if (!signals) return { label: '—', value: 0 };
  const entries = Object.entries(signals).filter(([, v]) => v > 0);
  if (entries.length === 0) return { label: '—', value: 0 };
  entries.sort((a, b) => b[1] - a[1]);
  const [key, val] = entries[0];
  const label = key.replace(/_count$/, '').replace(/_/g, ' ').replace(/^(x|instagram|reddit|youtube)\s*/i, '');
  return { label: `${val.toLocaleString()} ${label}`, value: val };
}

export function PlatformBadge({ platform }) {
  const p = (platform || '').toLowerCase();
  const cls = PLATFORM_COLORS[p] || 'bg-gray-500/20 text-gray-400';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${cls}`}>{platform || '—'}</span>;
}

export function ColoredBadge({ value, colorMap }) {
  const cls = colorMap[value] || 'bg-gray-500/20 text-gray-400';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${cls}`}>{value || '—'}</span>;
}

export function ScoreBar({ value, max = 2, color = 'bg-amber-400' }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono w-12 text-right">{fmt(value)}</span>
      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden max-w-[80px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SmallJsonFallback({ data }) {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;
  const json = JSON.stringify(data, null, 2);
  const isLong = json.length > 400;
  return (
    <div className="mt-2">
      <pre className="bg-background border border-border rounded-lg p-3 text-xs text-foreground overflow-x-auto max-h-60 overflow-y-auto">
        {isLong && !expanded ? json.slice(0, 400) + '\n...' : json}
      </pre>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary mt-1">
          {expanded ? 'Show less' : 'Show all'}
        </button>
      )}
    </div>
  );
}

export function KeyValueCards({ data, depth = 0 }) {
  if (!data || typeof data !== 'object') return <span className="text-xs text-foreground">{String(data ?? '—')}</span>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-xs text-muted-foreground">Empty list</span>;
    if (typeof data[0] !== 'object') {
      return (
        <ul className="list-disc list-inside text-xs text-foreground space-y-0.5">
          {data.map((item, i) => <li key={i}>{String(item)}</li>)}
        </ul>
      );
    }
    if (data.length <= 20) {
      const cols = Object.keys(data[0]).slice(0, 8);
      return (
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {cols.map((c) => <th key={c} className="text-left py-1.5 px-2 text-muted-foreground font-medium">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                  {cols.map((c) => (
                    <td key={c} className="py-1.5 px-2 text-foreground">
                      {typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : String(row[c] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <SmallJsonFallback data={data} />;
  }
  const entries = Object.entries(data);
  if (depth > 2) return <SmallJsonFallback data={data} />;
  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-3 pl-3 border-l border-border/50' : ''}`}>
      {entries.map(([key, val]) => (
        <div key={key}>
          <span className="text-xs font-medium text-muted-foreground">{key}</span>
          {typeof val === 'object' && val !== null ? (
            <div className="mt-1"><KeyValueCards data={val} depth={depth + 1} /></div>
          ) : (
            <span className="text-xs text-foreground ml-2">{String(val ?? '—')}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function CollapsibleKV({ title, data }) {
  const [open, setOpen] = useState(false);
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return null;
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden mt-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors">
        <span className="text-xs font-medium text-foreground">{title}</span>
        {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 py-2 border-t border-border/50"><KeyValueCards data={data} /></div>}
    </div>
  );
}

export function Section({ icon: Icon, title, color, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 hover:bg-accent/20 transition-colors"
      >
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-semibold text-foreground flex-1 text-left">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 pt-0 border-t border-border">{children}</div>}
    </div>
  );
}

export function KeywordSearch({ label, onSearch, loading }) {
  const [keyword, setKeyword] = useState('');
  return (
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && keyword.trim() && onSearch(keyword.trim())}
        placeholder={label}
        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        onClick={() => keyword.trim() && onSearch(keyword.trim())}
        disabled={loading || !keyword.trim()}
        className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Search
      </button>
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground w-44 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
