import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Film, Landmark, Star, Loader2,
  ChevronDown, ChevronUp, Map, ExternalLink, BarChart3,
  Sun, Sunrise, Sunset, Moon, Info
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { marketingService } from '../../api/marketingService';

// Small info-icon tooltip used to explain table columns.
function InfoTooltip({ text }) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center align-middle text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-3 h-3" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={5}
            className="z-50 max-w-xs rounded-lg bg-popover border border-border px-3 py-2 text-xs text-popover-foreground shadow-lg"
          >
            {text}
            <Tooltip.Arrow className="fill-border" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Header cell label paired with an info tooltip.
function ColumnHeader({ label, tip, align = 'left' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
      {label}
      <InfoTooltip text={tip} />
    </span>
  );
}

const PLATFORM_COLORS = {
  x: 'bg-sky-400/20 text-sky-400 border-sky-400/30',
  X: 'bg-sky-400/20 text-sky-400 border-sky-400/30',
  reddit: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  Reddit: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  youtube: 'bg-red-400/20 text-red-400 border-red-400/30',
  YouTube: 'bg-red-400/20 text-red-400 border-red-400/30',
  instagram: 'bg-pink-400/20 text-pink-400 border-pink-400/30',
  Instagram: 'bg-pink-400/20 text-pink-400 border-pink-400/30',
};

const PLATFORM_BAR_COLORS = {
  X: 'bg-sky-400',
  x: 'bg-sky-400',
  Reddit: 'bg-orange-400',
  reddit: 'bg-orange-400',
  YouTube: 'bg-red-400',
  youtube: 'bg-red-400',
  Instagram: 'bg-pink-400',
  instagram: 'bg-pink-400',
};

const METHOD_COLORS = {
  GET: 'bg-emerald-500/20 text-emerald-400',
  POST: 'bg-blue-500/20 text-blue-400',
  PUT: 'bg-amber-500/20 text-amber-400',
  DELETE: 'bg-red-500/20 text-red-400',
  PATCH: 'bg-purple-500/20 text-purple-400',
};

function fmt(n, decimals = 2) {
  if (n == null) return '-';
  return Number(n).toFixed(decimals);
}

function fmtInt(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString();
}

function PlatformBadge({ platform }) {
  const cls = PLATFORM_COLORS[platform] || 'bg-muted text-muted-foreground';
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${cls}`}>
      {platform}
    </span>
  );
}

function PeakActivityIndicators({ times }) {
  if (!times) return null;
  const slots = [
    { key: 'morning', icon: Sunrise, label: 'Morning' },
    { key: 'afternoon', icon: Sun, label: 'Afternoon' },
    { key: 'evening', icon: Sunset, label: 'Evening' },
    { key: 'night', icon: Moon, label: 'Night' },
  ];
  return (
    <div className="flex items-center gap-1">
      {slots.map(({ key, icon: Icon, label }) => {
        const val = times[key] ?? 0;
        return (
          <div key={key} title={`${label}: ${fmt(val)}`} style={{ opacity: Math.max(0.15, val) }}>
            <Icon className="w-3 h-3 text-foreground" />
          </div>
        );
      })}
    </div>
  );
}

function ConversionBar({ value }) {
  if (value == null) return <span className="text-muted-foreground">-</span>;
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-background rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{pct}%</span>
    </div>
  );
}

function UserTable({ users, showConversion }) {
  const [showAll, setShowAll] = useState(false);
  if (!users || users.length === 0) return <p className="text-xs text-muted-foreground">No users found</p>;

  const displayed = showAll ? users : users.slice(0, 20);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 pr-3 font-medium">
                <ColumnHeader label="User" tip="Global user ID — click to open their profile where available" />
              </th>
              <th className="pb-2 pr-3 font-medium">
                <ColumnHeader label="Tribe" tip="Audience tribe / segment this user belongs to" />
              </th>
              <th className="pb-2 pr-3 font-medium">
                <ColumnHeader label="Platform" tip="The user's primary social platform" />
              </th>
              <th className="pb-2 pr-3 font-medium text-right">
                <ColumnHeader label="Score" align="right" tip="Affinity / interest score — higher means stronger alignment with this audience" />
              </th>
              <th className="pb-2 pr-3 font-medium text-right">
                <ColumnHeader label="Influence" align="right" tip="Influence rank — the user's reach and impact within their network" />
              </th>
              {showConversion && (
                <th className="pb-2 pr-3 font-medium">
                  <ColumnHeader label="Conversion" tip="Predicted probability this user converts (becomes a viewer / voter / fan)" />
                </th>
              )}
              <th className="pb-2 font-medium">
                <ColumnHeader label="Activity" tip="Peak activity times of day (morning, afternoon, evening, night)" />
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((user, i) => {
              const primary = user.platform_handles?.primary_platform;
              const platformData = user.platform_handles?.by_platform?.[primary];
              const profileUrl = platformData?.profile_url;
              const score = user.genre_interest_score ?? user.affinity_score ?? user.hawkes_alpha;

              return (
                <tr key={user.global_user_id || i} className="border-b border-border/50 hover:bg-accent/10">
                  <td className="py-2 pr-3 font-medium text-foreground">
                    {profileUrl ? (
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        {user.global_user_id}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      user.global_user_id
                    )}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{user.tribe_label || '-'}</td>
                  <td className="py-2 pr-3">
                    {primary ? <PlatformBadge platform={primary} /> : '-'}
                  </td>
                  <td className="py-2 pr-3 text-right text-foreground">{fmt(score)}</td>
                  <td className="py-2 pr-3 text-right text-foreground">{fmt(user.influence_rank)}</td>
                  {showConversion && (
                    <td className="py-2 pr-3">
                      <ConversionBar value={user.p_conv} />
                    </td>
                  )}
                  <td className="py-2">
                    <PeakActivityIndicators times={user.peak_activity_times} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {users.length > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-primary mt-2 hover:underline"
        >
          {showAll ? `Show less` : `Show all ${users.length} users`}
        </button>
      )}
    </div>
  );
}

function ViewersRenderer({ data }) {
  if (!data) return null;
  const totalKey = data.totalViewers != null ? 'totalViewers' : data.totalFans != null ? 'totalFans' : 'totalVoters';
  const totalLabel = data.totalViewers != null ? 'viewers' : data.totalFans != null ? 'fans' : 'voters';
  const usersKey = data.viewers ? 'viewers' : data.fans ? 'fans' : 'voters';
  const users = data[usersKey] || [];
  const total = data[totalKey] ?? users.length;
  const scoring = data.scoringModel || (data.threshold != null ? `threshold: ${data.threshold}` : null);

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">
          {fmtInt(total)} total {totalLabel}
        </span>
        {scoring && (
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
            {scoring}
          </span>
        )}
      </div>
      <UserTable users={users} showConversion={true} />
    </div>
  );
}

function SpreadersRenderer({ data }) {
  if (!data) return null;
  const totalKey = data.totalSpreaders != null ? 'totalSpreaders' : 'totalSuperFans';
  const totalLabel = data.totalSpreaders != null ? 'spreaders' : 'super fans';
  const usersKey = data.spreaders ? 'spreaders' : 'superFans';
  const users = data[usersKey] || [];
  const total = data[totalKey] ?? users.length;
  const metric = data.rankingMetric;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">
          {fmtInt(total)} total {totalLabel}
        </span>
        {metric && (
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
            ranked by {metric}
          </span>
        )}
      </div>
      <UserTable users={users} showConversion={false} />
    </div>
  );
}

function ChannelBar({ channel, maxReach }) {
  const barColor = PLATFORM_BAR_COLORS[channel.platform] || 'bg-muted-foreground';
  const strength = channel.relative_strength ?? 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 shrink-0">
        <PlatformBadge platform={channel.platform} />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-5 bg-background rounded overflow-hidden">
          <div
            className={`h-full ${barColor} rounded transition-all`}
            style={{ width: `${Math.max(strength * 100, strength > 0 ? 2 : 0)}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
          {(strength * 100).toFixed(1)}%
        </span>
      </div>
      <div className="flex gap-4 shrink-0 text-xs">
        <span className="text-foreground w-16 text-right" title="Reach">{fmtInt(channel.reach)}</span>
        <span className="text-muted-foreground w-12 text-right" title="Posts">{fmtInt(channel.postCount)} posts</span>
      </div>
    </div>
  );
}

function StrategyRenderer({ data }) {
  if (!data) return null;
  const channels = data.channels || [];

  return (
    <div className="mt-3 space-y-4">
      {data.headline && (
        <p className="text-sm font-medium text-foreground bg-background border border-border rounded-lg px-3 py-2">
          {data.headline}
        </p>
      )}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-background border border-border rounded-lg px-3 py-2 flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-foreground">{fmtInt(data.audienceSize)}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Audience</span>
        </div>
        {data.topChannel && (
          <div className="bg-background border border-border rounded-lg px-3 py-2 flex flex-col items-center min-w-[100px]">
            <span className="text-lg font-bold text-foreground">{data.topChannel}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Top Channel</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wide px-1 mb-1">
          <span className="w-20 shrink-0"><ColumnHeader label="Platform" tip="Social platform / channel" /></span>
          <span className="flex-1"><ColumnHeader label="Relative Strength" tip="Channel's relative effectiveness compared with the other channels" /></span>
          <span className="w-16 text-right shrink-0"><ColumnHeader label="Reach" align="right" tip="Estimated total audience reach on this channel" /></span>
          <span className="w-12 text-right shrink-0"><ColumnHeader label="Posts" align="right" tip="Number of posts analyzed for this channel" /></span>
        </div>
        {channels.map((ch) => (
          <ChannelBar key={ch.platform} channel={ch} />
        ))}
      </div>
    </div>
  );
}

function CatalogTable({ catalog }) {
  if (!catalog) return null;
  const routes = catalog.routes || [];

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{catalog.totalRoutes ?? routes.length} routes</span>
        {catalog.upstreamBaseUrl && (
          <span className="bg-background px-2 py-0.5 rounded font-mono">{catalog.upstreamBaseUrl}</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 pr-3 font-medium w-16">Method</th>
              <th className="pb-2 pr-3 font-medium">Wrapper Path</th>
              <th className="pb-2 font-medium">Upstream Path</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/10">
                <td className="py-1.5 pr-3">
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${METHOD_COLORS[route.method] || 'bg-muted text-muted-foreground'}`}>
                    {route.method}
                  </span>
                </td>
                <td className="py-1.5 pr-3 font-mono text-foreground">{route.wrapperPath}</td>
                <td className="py-1.5 font-mono text-muted-foreground">{route.upstreamPath}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EntityCard({ name, onViewers, onSpreaders, onStrategy, loading, viewersData, spreadersData, strategyData, viewersLabel, spreadersLabel }) {
  const [open, setOpen] = useState(false);
  // Only one of viewers / spreaders / strategy is shown at a time.
  const [activeTab, setActiveTab] = useState(null);

  const selectTab = (tab, fetchFn) => {
    setActiveTab(tab);
    fetchFn();
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/20 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{name}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="p-3 pt-0 border-t border-border space-y-3">
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => selectTab('viewers', onViewers)}
              disabled={loading?.viewers}
              className={`px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 flex items-center gap-1 ${activeTab === 'viewers' ? 'ring-1 ring-emerald-400' : ''}`}
            >
              {loading?.viewers ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {viewersLabel || 'Potential Viewers'}
            </button>
            <button
              onClick={() => selectTab('spreaders', onSpreaders)}
              disabled={loading?.spreaders}
              className={`px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 flex items-center gap-1 ${activeTab === 'spreaders' ? 'ring-1 ring-purple-400' : ''}`}
            >
              {loading?.spreaders ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {spreadersLabel || 'Super Spreaders'}
            </button>
            <button
              onClick={() => selectTab('strategy', onStrategy)}
              disabled={loading?.strategy}
              className={`px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 flex items-center gap-1 ${activeTab === 'strategy' ? 'ring-1 ring-blue-400' : ''}`}
            >
              {loading?.strategy ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Channel Strategy
            </button>
          </div>
          {activeTab === 'viewers' && viewersData && <ViewersRenderer data={viewersData} />}
          {activeTab === 'spreaders' && spreadersData && <SpreadersRenderer data={spreadersData} />}
          {activeTab === 'strategy' && strategyData && <StrategyRenderer data={strategyData} />}
        </div>
      )}
    </div>
  );
}

function MarketingSection({ icon: Icon, title, color, listFn, viewersFn, spreadersFn, strategyFn, viewersLabel, spreadersLabel }) {
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [itemData, setItemData] = useState({});
  const [itemLoading, setItemLoading] = useState({});

  const loadItems = useCallback(async () => {
    setListLoading(true);
    try {
      const result = await listFn();
      setItems(Array.isArray(result) ? result : []);
      setLoaded(true);
    } catch {
      setItems([]);
      setLoaded(true);
    } finally {
      setListLoading(false);
    }
  }, [listFn]);

  // Auto-load the list when the section mounts (driven by the primary entity)
  // so the user never has to click a "Load" button.
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const fetchData = useCallback(async (name, type, fn) => {
    setItemLoading((prev) => ({ ...prev, [name]: { ...prev[name], [type]: true } }));
    try {
      const result = await fn(name);
      setItemData((prev) => ({ ...prev, [name]: { ...prev[name], [type]: result } }));
    } finally {
      setItemLoading((prev) => ({ ...prev, [name]: { ...prev[name], [type]: false } }));
    }
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {listLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {loaded && items.length === 0 && (
        <p className="text-sm text-muted-foreground">No items found</p>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const name = typeof item === 'string' ? item : item.name || item.genre || item.party || item.celebrity || JSON.stringify(item);
          return (
            <EntityCard
              key={name}
              name={name}
              loading={itemLoading[name]}
              viewersData={itemData[name]?.viewers}
              spreadersData={itemData[name]?.spreaders}
              strategyData={itemData[name]?.strategy}
              viewersLabel={viewersLabel}
              spreadersLabel={spreadersLabel}
              onViewers={() => fetchData(name, 'viewers', viewersFn)}
              onSpreaders={() => fetchData(name, 'spreaders', spreadersFn)}
              onStrategy={() => fetchData(name, 'strategy', strategyFn)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Maps the primary entity's type to the single marketing section that applies.
const SECTION_BY_ENTITY_TYPE = {
  movie: {
    icon: Film,
    title: 'Genre Marketing',
    color: 'text-amber-400',
    listFn: marketingService.listGenres,
    viewersFn: marketingService.getGenrePotentialViewers,
    spreadersFn: marketingService.getGenreSuperSpreaders,
    strategyFn: marketingService.getGenreChannelStrategy,
  },
  political_party: {
    icon: Landmark,
    title: 'Political Party Marketing',
    color: 'text-blue-400',
    listFn: marketingService.listParties,
    viewersFn: marketingService.getPartyPotentialVoters,
    spreadersFn: marketingService.getPartySuperSpreaders,
    strategyFn: marketingService.getPartyChannelStrategy,
    viewersLabel: 'Potential Voters',
  },
  celebrity: {
    icon: Star,
    title: 'Celebrity Marketing',
    color: 'text-purple-400',
    listFn: marketingService.listCelebrities,
    viewersFn: marketingService.getCelebrityPotentialFans,
    spreadersFn: marketingService.getCelebritySuperFans,
    strategyFn: marketingService.getCelebrityChannelStrategy,
    viewersLabel: 'Potential Fans',
    spreadersLabel: 'Super Fans',
  },
};

export default function MarketingIntelView({ primaryEntity }) {
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const entityType = primaryEntity?.entityType;
  const section = entityType ? SECTION_BY_ENTITY_TYPE[entityType] : null;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="w-7 h-7 text-rose-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Marketing Intelligence</h2>
            <p className="text-sm text-muted-foreground">Genre, party, and celebrity audience strategy powered by AuraMath</p>
          </div>
        </div>

        {!primaryEntity ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Select a primary entity to view its marketing intelligence.
            </p>
          </div>
        ) : !section ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Marketing intelligence isn't available for{' '}
              <span className="font-medium text-foreground">{primaryEntity.name}</span>.
              Choose a Movie, Political Party, or Celebrity entity.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <MarketingSection
              // Re-mount the section when the entity type changes so it re-loads cleanly.
              key={entityType}
              icon={section.icon}
              title={section.title}
              color={section.color}
              listFn={section.listFn}
              viewersFn={section.viewersFn}
              spreadersFn={section.spreadersFn}
              strategyFn={section.strategyFn}
              viewersLabel={section.viewersLabel}
              spreadersLabel={section.spreadersLabel}
            />
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-semibold text-foreground">API Catalog</h3>
            </div>
            <button
              onClick={async () => {
                setCatalogLoading(true);
                try {
                  setCatalog(await marketingService.getCatalog());
                } finally {
                  setCatalogLoading(false);
                }
              }}
              disabled={catalogLoading}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent text-foreground hover:bg-accent/80 disabled:opacity-50 flex items-center gap-1"
            >
              {catalogLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Load Catalog
            </button>
          </div>
          {catalog && <CatalogTable catalog={catalog} />}
        </div>
      </div>
    </div>
  );
}