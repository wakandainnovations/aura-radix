import React, { useState, useCallback } from 'react';
import { Target, Search, Loader2 } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import {
  PLATFORMS,
  Section, KeywordSearch, KeyValueCards, CollapsibleKV, FilterSelect,
} from './audienceIntelShared';

function TargetsDisplay({ data }) {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No targets found</p>;
    const cols = Object.keys(data[0]).slice(0, 10);
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
  return <div className="mt-3"><KeyValueCards data={data} /></div>;
}

function DiagnosticsDisplay({ data }) {
  if (!data) return null;
  return <div className="mt-2"><CollapsibleKV title="Details" data={data} /></div>;
}

export default function TargetingView() {
  const [targets, setTargets] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [targetFilters, setTargetFilters] = useState({});
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
          <Target className="w-7 h-7 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Targeting & Diagnostics</h2>
            <p className="text-sm text-muted-foreground">Filter targets and run diagnostic tools</p>
          </div>
        </div>

        <Section icon={Target} title="Targets" color="text-orange-400">
          <div className="flex flex-wrap gap-2 mt-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Genre</label>
              <input
                type="text"
                value={targetFilters.genre || ''}
                onChange={(e) => setTargetFilters((prev) => ({ ...prev, genre: e.target.value }))}
                placeholder="Enter genre..."
                className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Influence</label>
              <input
                type="number"
                value={targetFilters.minInfluenceScore ?? ''}
                onChange={(e) => setTargetFilters((prev) => ({ ...prev, minInfluenceScore: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="0.0"
                className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-32 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Platform</label>
              <FilterSelect
                value={targetFilters.platform}
                onChange={(v) => setTargetFilters((prev) => ({ ...prev, platform: v }))}
                options={PLATFORMS}
                placeholder="All Platforms"
              />
            </div>
            <button
              onClick={() => withLoading('targets', () => auraMathService.listTargets(targetFilters).then(setTargets))}
              disabled={loading.targets}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.targets ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              Search
            </button>
          </div>
          <TargetsDisplay data={targets} />
        </Section>

        <Section icon={Search} title="Diagnostics" color="text-slate-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Raw Mapping</p>
              <KeywordSearch
                label="Author..."
                loading={loading.diagRaw}
                onSearch={(a) => withLoading('diagRaw', () => auraMathService.getDiagnosticsRawMapping(a).then((d) => setDiagnostics((prev) => ({ ...prev, raw: d }))))}
              />
              <DiagnosticsDisplay data={diagnostics?.raw} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Temporal Audit</p>
              <KeywordSearch
                label="Author..."
                loading={loading.diagTemporal}
                onSearch={(a) => withLoading('diagTemporal', () => auraMathService.getDiagnosticsTemporalAudit(a).then((d) => setDiagnostics((prev) => ({ ...prev, temporal: d }))))}
              />
              <DiagnosticsDisplay data={diagnostics?.temporal} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Process User</p>
              <KeywordSearch
                label="Author..."
                loading={loading.diagProcess}
                onSearch={(a) => withLoading('diagProcess', () => auraMathService.getDiagnosticsProcessUser(a).then((d) => setDiagnostics((prev) => ({ ...prev, process: d }))))}
              />
              <DiagnosticsDisplay data={diagnostics?.process} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
