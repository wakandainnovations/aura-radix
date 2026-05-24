import React, { useState, useCallback } from 'react';
import { Zap, Network, Users } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import {
  PlatformBadge, ScoreBar, getDominantReach, fmt,
  Section, KeywordSearch, KeyValueCards,
} from './audienceIntelShared';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

function ViralSeedsTable({ data }) {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Seed Score</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tribe</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reach</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Link</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => {
            const reach = getDominantReach(row.reachSignals);
            const profileUrl = row.outreachHandle?.profile_url;
            return (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-2 px-3 text-foreground font-mono">{row.rank ?? i + 1}</td>
                <td className="py-2 px-3 text-foreground font-medium">{row.author || '—'}</td>
                <td className="py-2 px-3"><ScoreBar value={row.seedScore} /></td>
                <td className="py-2 px-3"><PlatformBadge platform={row.primaryPlatform || row.outreachHandle?.platform} /></td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px] font-medium">{row.tribe || '—'}</span></td>
                <td className="py-2 px-3 text-foreground">{reach.label}</td>
                <td className="py-2 px-3">
                  {profileUrl ? (
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {rows.length} results</p>}
    </div>
  );
}

function TopSpreadersTable({ data }) {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Hawkes Alpha</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">MOI</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tribe</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reach</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Link</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => {
            const reach = getDominantReach(row.reachSignals);
            const profileUrl = row.outreachHandle?.profile_url;
            return (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-2 px-3 text-foreground font-mono">{row.rank ?? i + 1}</td>
                <td className="py-2 px-3 text-foreground font-medium">{row.author || '—'}</td>
                <td className="py-2 px-3"><ScoreBar value={row.hawkesAlpha} max={1} color="bg-purple-400" /></td>
                <td className="py-2 px-3 font-mono text-foreground">{fmt(row.moiScore, 4)}</td>
                <td className="py-2 px-3"><PlatformBadge platform={row.primaryPlatform || row.outreachHandle?.platform} /></td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px] font-medium">{row.tribe || '—'}</span></td>
                <td className="py-2 px-3 text-foreground">{reach.label}</td>
                <td className="py-2 px-3">
                  {profileUrl ? (
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {rows.length} results</p>}
    </div>
  );
}

function LookalikesDisplay({ data }) {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No lookalikes found</p>;
    if (typeof data[0] === 'object') {
      const cols = Object.keys(data[0]).slice(0, 8);
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {cols.map((c) => <th key={c} className="text-left py-2 px-3 text-muted-foreground font-medium">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 50).map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                  {cols.map((c) => (
                    <td key={c} className="py-2 px-3 text-foreground">
                      {typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : String(row[c] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {data.length}</p>}
        </div>
      );
    }
    return <ul className="mt-3 space-y-1">{data.map((item, i) => <li key={i} className="text-xs text-foreground">{String(item)}</li>)}</ul>;
  }
  if (typeof data === 'object') return <div className="mt-3"><KeyValueCards data={data} /></div>;
  return null;
}

export default function SpreaderAnalysisView() {
  const [viralSeeds, setViralSeeds] = useState(null);
  const [topSpreaders, setTopSpreaders] = useState(null);
  const [lookalikes, setLookalikes] = useState(null);
  const [loading, setLoading] = useState({});

  const withLoading = useCallback(async (key, fn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      return await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-7 h-7 text-amber-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Spreader Analysis</h2>
            <p className="text-sm text-muted-foreground">Find viral seeds, top spreaders, and lookalike audiences</p>
          </div>
        </div>

        <Section icon={Zap} title="Viral Seeds" color="text-amber-400">
          <KeywordSearch
            label="Enter keyword to find viral seeds..."
            loading={loading.viralSeeds}
            onSearch={(kw) => withLoading('viralSeeds', () => auraMathService.getViralSeeds(kw).then(setViralSeeds))}
          />
          <ViralSeedsTable data={viralSeeds} />
        </Section>

        <Section icon={Network} title="Top Spreaders" color="text-purple-400">
          <KeywordSearch
            label="Enter keyword to find top spreaders..."
            loading={loading.topSpreaders}
            onSearch={(kw) => withLoading('topSpreaders', () => auraMathService.getTopSpreaders(kw).then(setTopSpreaders))}
          />
          <TopSpreadersTable data={topSpreaders} />
        </Section>

        <Section icon={Users} title="Find Lookalikes" color="text-emerald-400">
          <KeywordSearch
            label="Enter seed author ID..."
            loading={loading.lookalikes}
            onSearch={(id) => withLoading('lookalikes', () => auraMathService.findLookalikes(id).then(setLookalikes))}
          />
          <LookalikesDisplay data={lookalikes} />
        </Section>
      </div>
    </div>
  );
}
