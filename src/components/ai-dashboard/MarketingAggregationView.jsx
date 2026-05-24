import React, { useState, useCallback } from 'react';
import {
  Layers, Network, Zap, Search, Heart, Film,
  Loader2, Filter, ChevronDown, ChevronUp,
  ExternalLink, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { marketingAggregationService } from '../../api/marketingAggregationService';
import {
  PlatformBadge, ScoreBar, getDominantReach, fmt,
  Section, SmallJsonFallback, KeyValueCards,
} from './audienceIntelShared';

const GENRE_SUB_TYPES = [
  { value: 'potential-viewers', label: 'Potential Viewers' },
  { value: 'super-spreaders', label: 'Super Spreaders' },
  { value: 'channel-strategy', label: 'Channel Strategy' },
];

function FilterBar({ filters, onChange, loading, onSearch, extraRight }) {
  const update = (key, val) => onChange({ ...filters, [key]: val || '' });
  const hasAnyFilter = Object.values(filters).some((v) => v);
  return (
    <div className="flex flex-wrap items-end gap-2 mt-3">
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Language</label>
        <input
          type="text"
          value={filters.language || ''}
          onChange={(e) => update('language', e.target.value)}
          placeholder="e.g. Tamil"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Industry</label>
        <input
          type="text"
          value={filters.industry || ''}
          onChange={(e) => update('industry', e.target.value)}
          placeholder="e.g. Kollywood"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Genre</label>
        <input
          type="text"
          value={filters.genre || ''}
          onChange={(e) => update('genre', e.target.value)}
          placeholder="e.g. action"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">State</label>
        <input
          type="text"
          value={filters.state || ''}
          onChange={(e) => update('state', e.target.value)}
          placeholder="e.g. Tamil Nadu"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Entity ID</label>
        <input
          type="number"
          value={filters.entityId || ''}
          onChange={(e) => update('entityId', e.target.value ? Number(e.target.value) : '')}
          placeholder="ID"
          className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground w-20 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {extraRight}
      <button
        onClick={onSearch}
        disabled={loading || !hasAnyFilter}
        className="px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1 self-end"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Filter className="w-3 h-3" />}
        Search
      </button>
    </div>
  );
}

function GroupByToggle({ value, onChange, groupLabel = 'keyword' }) {
  const active = !!value;
  return (
    <div className="space-y-1 self-end">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Group by</label>
      <button
        onClick={() => onChange(active ? null : groupLabel)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
          active
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-background text-muted-foreground hover:text-foreground'
        }`}
      >
        {active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
        {groupLabel}
      </button>
    </div>
  );
}

function ResultCount({ data }) {
  if (!data) return null;
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  const isGrouped = !Array.isArray(data) && typeof data === 'object';
  return (
    <span className="text-xs text-muted-foreground">
      {isGrouped
        ? `${count} group${count !== 1 ? 's' : ''}`
        : `${count} result${count !== 1 ? 's' : ''}`}
    </span>
  );
}

function GenericTable({ data, maxRows = 50 }) {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
    if (typeof data[0] !== 'object') {
      return (
        <ul className="mt-3 list-disc list-inside text-xs text-foreground space-y-0.5">
          {data.map((item, i) => <li key={i}>{String(item)}</li>)}
        </ul>
      );
    }
    const cols = Object.keys(data[0]).slice(0, 10);
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {cols.map((c) => (
                <th key={c} className="text-left py-2 px-3 text-muted-foreground font-medium whitespace-nowrap">
                  {c.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, maxRows).map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                {cols.map((c) => (
                  <td key={c} className="py-2 px-3 text-foreground">
                    {renderCell(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > maxRows && (
          <p className="text-xs text-muted-foreground mt-1">Showing {maxRows} of {data.length} results</p>
        )}
      </div>
    );
  }
  if (typeof data === 'object') {
    return <GroupedResults data={data} />;
  }
  return <SmallJsonFallback data={data} />;
}

function renderCell(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'number') return fmt(value);
  return String(value);
}

function GroupedResults({ data }) {
  const [expanded, setExpanded] = useState({});
  const groups = Object.entries(data);
  if (groups.length === 0) return <p className="text-xs text-muted-foreground mt-3">No groups</p>;
  return (
    <div className="mt-3 space-y-2">
      {groups.map(([groupKey, items]) => {
        const isOpen = expanded[groupKey] ?? true;
        const count = Array.isArray(items) ? items.length : 1;
        return (
          <div key={groupKey} className="border border-border/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [groupKey]: !isOpen }))}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors"
            >
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">{groupKey}</span>
                <span className="text-muted-foreground font-normal">{count} item{count !== 1 ? 's' : ''}</span>
              </span>
              {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
            </button>
            {isOpen && (
              <div className="px-3 py-2 border-t border-border/50">
                {Array.isArray(items) ? <GenericTable data={items} maxRows={20} /> : <KeyValueCards data={items} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopSpreadersResults({ data }) {
  if (!data) return null;
  if (!Array.isArray(data)) return <GenericTable data={data} />;
  if (data.length === 0) return <p className="text-xs text-muted-foreground mt-3">No results</p>;
  const hasAlpha = data.some((r) => r.hawkesAlpha !== undefined);
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
            {hasAlpha && <th className="text-left py-2 px-3 text-muted-foreground font-medium">Hawkes Alpha</th>}
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reach</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Link</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((row, i) => {
            const reach = getDominantReach(row.reachSignals);
            const profileUrl = row.outreachHandle?.profile_url;
            return (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-2 px-3 text-foreground font-mono">{row.rank ?? i + 1}</td>
                <td className="py-2 px-3 text-foreground font-medium">{row.author || row.globalUserId || '—'}</td>
                {hasAlpha && <td className="py-2 px-3"><ScoreBar value={row.hawkesAlpha} max={1} color="bg-purple-400" /></td>}
                <td className="py-2 px-3"><PlatformBadge platform={row.primaryPlatform || row.outreachHandle?.platform} /></td>
                <td className="py-2 px-3">
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px] font-medium">
                    {row.influenceTier || row.tribe || '—'}
                  </span>
                </td>
                <td className="py-2 px-3 text-foreground">{reach.label}</td>
                <td className="py-2 px-3">
                  {profileUrl ? (
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {data.length} results</p>}
    </div>
  );
}

function AggregationSection({ icon, title, subtitle, color, description, serviceFn, groupLabel = 'keyword', ResultComponent = GenericTable }) {
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceFn(filters, groupBy);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Request failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, groupBy, serviceFn]);

  return (
    <Section icon={icon} title={title} subtitle={subtitle} color={color}>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        loading={loading}
        onSearch={doSearch}
        extraRight={<GroupByToggle value={groupBy} onChange={setGroupBy} groupLabel={groupLabel} />}
      />
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {data && (
        <div className="mt-2 flex items-center gap-2">
          <ResultCount data={data} />
        </div>
      )}
      <ResultComponent data={data} />
    </Section>
  );
}

function GenreAggregationSection() {
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState(null);
  const [subType, setSubType] = useState('potential-viewers');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await marketingAggregationService.getGenreData(subType, filters, groupBy);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Request failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, groupBy, subType]);

  return (
    <Section icon={Film} title="Genre Aggregation" subtitle="Aggregate viewers, spreaders, and channel data across genres" color="text-rose-400">
      <p className="text-xs text-muted-foreground mt-1">
        Aggregate genre-level data (viewers, spreaders, channel strategy) across all genres matching your filters.
      </p>
      <div className="flex flex-wrap items-end gap-2 mt-3">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Data Type</label>
          <select
            value={subType}
            onChange={(e) => setSubType(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground w-44 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            {GENRE_SUB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        loading={loading}
        onSearch={doSearch}
        extraRight={<GroupByToggle value={groupBy} onChange={setGroupBy} groupLabel="genre" />}
      />
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {data && (
        <div className="mt-2 flex items-center gap-2">
          <ResultCount data={data} />
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-medium">{subType}</span>
        </div>
      )}
      <GenericTable data={data} />
    </Section>
  );
}

export default function MarketingAggregationView() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-7 h-7 text-teal-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Marketing Aggregation</h2>
            <p className="text-sm text-muted-foreground">
              Cross-keyword marketing intelligence aggregated by language, industry, genre, state, or entity
            </p>
          </div>
        </div>

        <AggregationSection
          icon={Network}
          title="Aggregated Top Spreaders"
          subtitle="Cross-keyword top spreaders deduplicated by author"
          color="text-purple-400"
          description="Union of top spreaders across all keywords matching your filters, deduplicated by author."
          serviceFn={marketingAggregationService.getTopSpreaders}
          ResultComponent={TopSpreadersResults}
        />

        <AggregationSection
          icon={Zap}
          title="Aggregated Viral Seeds"
          subtitle="Cross-keyword early adopters who spark viral cascades"
          color="text-amber-400"
          description="Union of viral seed authors across all matching keywords."
          serviceFn={marketingAggregationService.getViralSeeds}
        />

        <AggregationSection
          icon={Search}
          title="Aggregated Aspect Drivers"
          subtitle="Combined sentiment strengths and weaknesses across keywords"
          color="text-blue-400"
          description="Union of aspect drivers (strengths & weaknesses) across all matching keywords."
          serviceFn={marketingAggregationService.getAspectDrivers}
        />

        <AggregationSection
          icon={Heart}
          title="Aggregated Brand Evangelists"
          subtitle="Loyal advocates consistently promoting positive sentiment"
          color="text-emerald-400"
          description="Union of brand evangelists across all matching keywords."
          serviceFn={marketingAggregationService.getBrandEvangelists}
        />

        <GenreAggregationSection />
      </div>
    </div>
  );
}
