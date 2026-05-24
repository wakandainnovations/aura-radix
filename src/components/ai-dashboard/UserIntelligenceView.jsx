import React, { useState, useCallback } from 'react';
import { User, Users, Filter, Loader2, Tag } from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import {
  TONE_CONFIG, TIER_COLORS, CLASSIFICATION_COLORS,
  AUDIENCE_CLASSIFICATIONS, INFLUENCE_TIERS, POSTING_STYLES,
  DOMINANT_TONES, PLATFORMS,
  fmt, PlatformBadge, ColoredBadge,
  Section, KeywordSearch, KeyValueCards, FilterSelect,
} from './audienceIntelShared';

function UsersDisplay({ data }) {
  if (!data) return null;
  const usersList = data.users || (Array.isArray(data) ? data : []);
  const totalUsers = data.totalUsers ?? usersList.length;
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-4">
        <div className="bg-background border border-border rounded-lg px-4 py-2">
          <span className="text-lg font-bold text-foreground">{totalUsers.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground ml-2">total users</span>
        </div>
        {data.filtersApplied && Object.keys(data.filtersApplied).length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="w-3 h-3" />
            {Object.entries(data.filtersApplied).map(([k, v]) => (
              <span key={k} className="px-1.5 py-0.5 bg-accent rounded text-[10px]">{k}: {v}</span>
            ))}
          </div>
        )}
      </div>
      {usersList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Author</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Classification</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Posting Style</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tone</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Posts</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Branch Ratio</th>
              </tr>
            </thead>
            <tbody>
              {usersList.slice(0, 50).map((u, i) => {
                const tone = TONE_CONFIG[u.dominant_tone] || TONE_CONFIG.neutral;
                const ToneIcon = tone.icon;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-2 px-3 text-foreground font-medium">{u.author || '—'}</td>
                    <td className="py-2 px-3"><ColoredBadge value={u.audience_classification} colorMap={CLASSIFICATION_COLORS} /></td>
                    <td className="py-2 px-3"><ColoredBadge value={u.influence_tier} colorMap={TIER_COLORS} /></td>
                    <td className="py-2 px-3 text-foreground">{u.posting_style || '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 ${tone.cls}`}>
                        <ToneIcon className="w-3 h-3" />
                        {u.dominant_tone || '—'}
                      </span>
                    </td>
                    <td className="py-2 px-3"><PlatformBadge platform={u.primary_platform} /></td>
                    <td className="py-2 px-3 text-foreground font-mono">{u.total_posts ?? '—'}</td>
                    <td className="py-2 px-3 text-foreground font-mono">{fmt(u.branching_ratio)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {usersList.length > 50 && <p className="text-xs text-muted-foreground mt-1">Showing 50 of {usersList.length}</p>}
        </div>
      )}
    </div>
  );
}

function CategoriesDisplay({ data }) {
  if (!data) return null;
  const groups = Object.entries(data);
  if (groups.length === 0) return <p className="text-xs text-muted-foreground mt-3">No categories</p>;
  const groupColors = {
    audience_classification: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    influence_tier: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    posting_style: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dominant_tone: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    primary_platform: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return (
    <div className="mt-3 space-y-4">
      {groups.map(([group, values]) => (
        <div key={group}>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {group.replace(/_/g, ' ')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(values) ? values : [values]).map((v, i) => (
              <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${groupColors[group] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {String(v)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserIntelligenceView() {
  const [userProfile, setUserProfile] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [users, setUsers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [userFilters, setUserFilters] = useState({});
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState({});

  const withLoading = useCallback(async (key, fn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      return await fn();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const updateFilter = (field, value) => {
    setUserFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-7 h-7 text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">User Intelligence</h2>
            <p className="text-sm text-muted-foreground">Look up user profiles and browse the user directory</p>
          </div>
        </div>

        <Section icon={User} title="User Lookup" subtitle="Search for a specific user's profile or detailed influence report" color="text-sky-400">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Profile by Global User ID</p>
              <KeywordSearch
                label="Global user ID..."
                loading={loading.userProfile}
                onSearch={(id) => withLoading('userProfile', () => auraMathService.getUserProfile(id).then(setUserProfile))}
              />
              {userProfile && <div className="mt-3"><KeyValueCards data={userProfile} /></div>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Report by Author</p>
              <KeywordSearch
                label="Author name..."
                loading={loading.userReport}
                onSearch={(a) => withLoading('userReport', () => auraMathService.getUserReport(a).then(setUserReport))}
              />
              {userReport && <div className="mt-3"><KeyValueCards data={userReport} /></div>}
            </div>
          </div>
        </Section>

        <Section icon={Users} title="User Directory" subtitle="Browse and filter all tracked users by classification, tier, tone, or platform" color="text-indigo-400">
          <div className="flex flex-wrap gap-2 mt-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Classification</label>
              <FilterSelect
                value={userFilters.audienceClassification}
                onChange={(v) => updateFilter('audienceClassification', v)}
                options={AUDIENCE_CLASSIFICATIONS}
                placeholder="All Classifications"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Influence Tier</label>
              <FilterSelect
                value={userFilters.influenceTier}
                onChange={(v) => updateFilter('influenceTier', v)}
                options={INFLUENCE_TIERS}
                placeholder="All Tiers"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Posting Style</label>
              <FilterSelect
                value={userFilters.postingStyle}
                onChange={(v) => updateFilter('postingStyle', v)}
                options={POSTING_STYLES}
                placeholder="All Styles"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Dominant Tone</label>
              <FilterSelect
                value={userFilters.dominantTone}
                onChange={(v) => updateFilter('dominantTone', v)}
                options={DOMINANT_TONES}
                placeholder="All Tones"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Platform</label>
              <FilterSelect
                value={userFilters.primaryPlatform}
                onChange={(v) => updateFilter('primaryPlatform', v)}
                options={PLATFORMS}
                placeholder="All Platforms"
              />
            </div>
            <button
              onClick={() => withLoading('users', () => auraMathService.listUsers(userFilters).then(setUsers))}
              disabled={loading.users}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.users ? <Loader2 className="w-3 h-3 animate-spin" /> : <Filter className="w-3 h-3" />}
              Search
            </button>
          </div>
          <UsersDisplay data={users} />

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => withLoading('categories', () => auraMathService.getUserCategories().then(setCategories))}
              disabled={loading.categories}
              className="px-3 py-1.5 text-xs rounded-lg bg-accent text-foreground hover:bg-accent/80 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.categories ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Load Categories
            </button>
            <button
              onClick={() => withLoading('sync', () => auraMathService.syncUsers().then(() => setSyncStatus('Sync triggered')))}
              disabled={loading.sync}
              className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 flex items-center gap-1"
            >
              {loading.sync ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Trigger User Sync
            </button>
            {syncStatus && <span className="text-xs text-emerald-400 self-center">{syncStatus}</span>}
          </div>
          <CategoriesDisplay data={categories} />
        </Section>
      </div>
    </div>
  );
}
