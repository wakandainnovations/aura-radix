import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Users, Filter, Loader2, Tag, Copy, Check,
  Clock, BarChart3, Zap, Target, AlertTriangle, Lightbulb,
  Calendar, MessageSquare, TrendingUp, Megaphone, Shield,
  Activity, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, FileText, Info,
} from 'lucide-react';
import { auraMathService } from '../../api/auraMathService';
import HourlyActivityHeatmap from './HourlyActivityHeatmap';
import {
  TONE_CONFIG, TIER_COLORS, CLASSIFICATION_COLORS,
  AUDIENCE_CLASSIFICATIONS, INFLUENCE_TIERS, POSTING_STYLES,
  DOMINANT_TONES, PLATFORMS,
  fmt, PlatformBadge, ColoredBadge,
  Section, KeywordSearch, KeyValueCards, FilterSelect,
} from './audienceIntelShared';
import { useSortableRows, SortableHeader } from '../shared';

function CopyableId({ id }) {
  const [copied, setCopied] = useState(false);
  if (!id) return <span className="text-muted-foreground">—</span>;
  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1 text-primary hover:underline font-mono group" title="Copy to use in User Lookup">
      <span className="truncate max-w-[120px]">{id}</span>
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

function shortDate(str) {
  if (!str) return '—';
  const cleaned = str.replace(/\s+[A-Z]{2,4}$/, '');
  const d = new Date(cleaned);
  if (isNaN(d)) return str.split('T')[0] || str;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatCard({ label, value, sub, icon: Icon, color = 'text-sky-400' }) {
  return (
    <div className="bg-background border border-border rounded-lg p-3 flex items-start gap-3">
      {Icon && <Icon className={`w-4 h-4 mt-0.5 ${color} shrink-0`} />}
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ReportHeader({ profile, generatedAt }) {
  if (!profile) return null;
  const tone = TONE_CONFIG[profile.dominantTone] || TONE_CONFIG.neutral;
  return (
    <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
            <User className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{profile.author}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <ColoredBadge value={profile.influenceTier} colorMap={TIER_COLORS} />
              {profile.activePlatforms?.map((p) => (
                <PlatformBadge key={p} platform={p} />
              ))}
            </div>
          </div>
        </div>
        {generatedAt && (
          <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {generatedAt}
          </p>
        )}
      </div>

      {profile.influenceTierExplained && (
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed bg-background/40 rounded-lg px-3 py-2 border border-border/50">
          {profile.influenceTierExplained}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <StatCard label="Total Posts" value={profile.totalPosts ?? '—'} icon={MessageSquare} color="text-sky-400" />
        <StatCard label="Avg Posts/Day" value={fmt(profile.averagePostsPerDay, 1)} icon={TrendingUp} color="text-emerald-400" />
        <StatCard
          label="Observation Span"
          value={`${fmt(profile.observationSpanDays, 1)} days`}
          icon={Calendar}
          color="text-amber-400"
        />
        <StatCard
          label="Active Period"
          value={shortDate(profile.firstSeen)}
          sub={profile.lastSeen ? `to ${shortDate(profile.lastSeen)}` : undefined}
          icon={Clock}
          color="text-purple-400"
        />
      </div>
    </div>
  );
}

function EngagementSection({ data }) {
  if (!data) return null;
  const burst = data.longestBurst;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Activity className="w-4 h-4 text-amber-400" />
        <h4 className="text-sm font-semibold text-foreground">Engagement Profile</h4>
        {data.postingStyle && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">
            {data.postingStyle}
          </span>
        )}
      </div>
      <div className="p-4 space-y-4">
        {data.postingStyleExplained && (
          <p className="text-xs text-muted-foreground leading-relaxed">{data.postingStyleExplained}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Burst Events" value={data.distinctBurstEvents ?? '—'} icon={Zap} color="text-amber-400" />
          <StatCard
            label="Avg Gap in Burst"
            value={data.averageGapInsideBurstMinutes != null ? `${fmt(data.averageGapInsideBurstMinutes, 1)} min` : '—'}
            icon={Clock}
            color="text-sky-400"
          />
          <StatCard
            label="Most Active Day"
            value={data.mostActiveDayOfWeek?.split(' ')[0] || '—'}
            sub={data.mostActiveDayOfWeek?.match(/\(.*\)/)?.[0]}
            icon={Calendar}
            color="text-purple-400"
          />
        </div>

        {data.peakActivityWindows?.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Peak Activity Windows</p>
            <div className="flex flex-wrap gap-2">
              {data.peakActivityWindows.map((w, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-[11px] font-medium border border-sky-500/20">
                  <Clock className="w-3 h-3" />
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {burst && (
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Longest Burst</p>
            <p className="text-xs text-foreground font-medium">{burst.readableDescription}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-muted-foreground">
              <span>Keyword: <span className="text-foreground font-medium">{burst.keyword}</span></span>
              <span>Duration: <span className="text-foreground font-medium">{fmt(burst.durationMinutes, 1)} min</span></span>
              <span>Peak Excitation: <span className="text-foreground font-medium">{fmt(burst.peakExcitationSpike, 3)}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicSection({ topics }) {
  if (!topics?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Target className="w-4 h-4 text-cyan-400" />
        <h4 className="text-sm font-semibold text-foreground">Topic Intelligence</h4>
        <span className="ml-auto text-[10px] text-muted-foreground">{topics.length} topic{topics.length > 1 ? 's' : ''}</span>
      </div>
      <div className="p-4 space-y-3">
        {topics.map((t, i) => {
          const tone = TONE_CONFIG[t.dominantTone] || TONE_CONFIG.neutral;
          const ToneIcon = tone.icon;
          return (
            <div key={i} className="bg-background border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">{t.keyword}</span>
                  {t.contentCategory && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-medium">
                      {t.contentCategory}
                    </span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 text-xs ${tone.cls}`}>
                  <ToneIcon className="w-3 h-3" />
                  {t.dominantTone}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Mentions</p>
                  <p className="text-sm font-bold text-foreground">{t.totalMentions}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Bursts Triggered</p>
                  <p className="text-sm font-bold text-foreground">{t.burstsTriggered}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Avg Sentiment</p>
                  <p className="text-sm font-bold text-foreground">{fmt(t.averageSentimentScore, 1)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Avg Excitation</p>
                  <p className="text-sm font-bold text-foreground">{fmt(t.averageExcitationSpike, 3)}</p>
                </div>
              </div>
              {t.toneBreakdown && (
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-muted-foreground">Tone Split:</p>
                  {Object.entries(t.toneBreakdown).map(([tone, count]) => {
                    const cfg = TONE_CONFIG[tone] || TONE_CONFIG.neutral;
                    const Icon = cfg.icon;
                    return (
                      <span key={tone} className={`inline-flex items-center gap-1 text-[11px] ${cfg.cls}`}>
                        <Icon className="w-3 h-3" /> {tone} ({count})
                      </span>
                    );
                  })}
                </div>
              )}
              {t.excitationProfile && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t.excitationProfile}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketingSection({ data }) {
  if (!data) return null;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Megaphone className="w-4 h-4 text-emerald-400" />
        <h4 className="text-sm font-semibold text-foreground">Marketing Recommendations</h4>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.primaryChannel && (
            <div className="bg-background border border-border rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Primary Channel</p>
              <p className="text-sm font-semibold text-foreground mt-1">{data.primaryChannel}</p>
            </div>
          )}
          {data.bestTimeToEngage && (
            <div className="bg-background border border-border rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best Time to Engage</p>
              <p className="text-sm font-semibold text-foreground mt-1">{data.bestTimeToEngage}</p>
            </div>
          )}
          {data.amplificationPotential && (
            <div className="bg-background border border-border rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Amplification Potential</p>
              <p className="text-sm font-semibold text-foreground mt-1">{data.amplificationPotential}</p>
            </div>
          )}
          {data.estimatedReachMultiplier && (
            <div className="bg-background border border-border rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reach Multiplier</p>
              <p className="text-sm font-semibold text-foreground mt-1">{data.estimatedReachMultiplier}</p>
            </div>
          )}
        </div>

        {data.audienceClassification && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider">Audience Classification</p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">{data.audienceClassification}</p>
          </div>
        )}

        {data.campaignType && (
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recommended Campaign</p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">{data.campaignType}</p>
          </div>
        )}

        {data.contentTriggers?.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Content Triggers</p>
            <div className="flex flex-wrap gap-2">
              {data.contentTriggers.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-medium border border-indigo-500/20">
                  <Zap className="w-3 h-3" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.contentStrategy && (
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Content Strategy</p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">{data.contentStrategy}</p>
          </div>
        )}

        {data.actionableAdvice && (
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-3">
            <p className="text-[10px] text-sky-400/70 uppercase tracking-wider mb-2">Actionable Advice</p>
            <div className="space-y-2">
              {data.actionableAdvice.split(/\d+\.\s+/).filter(Boolean).map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{tip.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlagsSection({ redFlags, opportunities }) {
  if (!redFlags?.length && !opportunities?.length) return null;
  const severityColor = {
    HIGH: 'bg-red-500/15 text-red-400 border-red-500/25',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    LOW: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {redFlags?.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-semibold text-foreground">Red Flags</h4>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">{redFlags.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {redFlags.map((f, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${severityColor[f.severity] || severityColor.LOW}`}>
                    {f.severity}
                  </span>
                  <p className="text-xs font-semibold text-foreground">{f.flag}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {opportunities?.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-foreground">Opportunities</h4>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{opportunities.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {opportunities.map((o, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-3">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  {o.opportunity}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{o.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserReportDisplay({ data }) {
  if (!data) return null;

  if (data.message) {
    return (
      <div className="mt-4 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium">No report available</p>
          <p className="text-xs text-muted-foreground">{data.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <ReportHeader profile={data.userProfile} generatedAt={data.generatedAt} />
      <EngagementSection data={data.engagementProfile} />
      <TopicSection topics={data.topicIntelligence} />
      <MarketingSection data={data.marketingRecommendations} />
      <FlagsSection redFlags={data.redFlags} opportunities={data.opportunityFlags} />
    </div>
  );
}

const CLASSIFICATION_DESCRIPTIONS = {
  'Brand Evangelist': 'Enthusiastic, high-reach advocate. Priority for ambassador programs.',
  'Active Critic': 'Vocal critic with significant engagement. Monitor and address concerns proactively.',
  'Critical Power Influencer': 'High-influence user with critical stance. Key target for sentiment conversion.',
  'Neutral Informer': 'Fact-focused, neutral content sharer. Reliable for organic information spread.',
  'Positive Engager': 'Consistently positive engagement. Natural amplifier for brand messaging.',
  'Casual Engager': 'Low-frequency, casual interactions. Potential to nurture into deeper engagement.',
  'Silent Observer': 'Consumes content without engaging. Large latent audience segment.',
};

const TIER_DESCRIPTIONS = {
  'Viral Node': 'Near-supercritical spreading threshold. Content cascades organically through their network.',
  'Amplifier': 'Strong signal booster. Reliably extends content reach beyond immediate followers.',
  'Participant': 'Active community member. Contributes to conversations without driving virality.',
  'Observer': 'Watches and occasionally engages. Minimal amplification effect.',
  'Micro-Influencer': 'Niche authority with a focused, engaged audience. High trust within their circle.',
};

const POSTING_STYLE_DESCRIPTIONS = {
  'Steady Poster': 'Consistent posting cadence with predictable engagement windows.',
  'Reactive Poster': 'Responds to external events and trending topics. Engagement spikes around news cycles.',
  'Burst Poster': 'Posts in concentrated bursts around specific triggers, then goes quiet.',
  'Power Burst Poster': 'Extremely high-velocity bursts. Content they engage with is amplified in rapid, concentrated waves.',
};

function BranchingRatioGauge({ value }) {
  if (value == null) return null;
  const pct = Math.min(value * 100, 100);
  const color = value >= 0.9 ? 'from-amber-500 to-red-500' : value >= 0.5 ? 'from-sky-500 to-amber-500' : 'from-emerald-500 to-sky-500';
  const label = value >= 1.0 ? 'Supercritical' : value >= 0.8 ? 'Near-critical' : value >= 0.5 ? 'Moderate' : 'Subcritical';
  const labelColor = value >= 0.9 ? 'text-amber-400' : value >= 0.5 ? 'text-sky-400' : 'text-emerald-400';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xl font-bold text-foreground font-mono">{fmt(value)}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${labelColor}`}>{label}</span>
      </div>
      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-muted-foreground/50">0.0</span>
        <span className="text-[9px] text-muted-foreground/50">1.0</span>
      </div>
    </div>
  );
}

const PLATFORM_STAT_CONFIG = {
  xStats: {
    label: 'X (Twitter)',
    icon: 'text-blue-400',
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    metrics: [
      { key: 'postCount', label: 'Posts' },
      { key: 'totalLikes', label: 'Likes' },
      { key: 'totalViews', label: 'Views' },
      { key: 'totalRetweets', label: 'Retweets' },
      { key: 'totalReplies', label: 'Replies' },
    ],
  },
  youtubeStats: {
    label: 'YouTube',
    icon: 'text-red-400',
    bg: 'from-red-500/10 to-red-500/5',
    border: 'border-red-500/20',
    metrics: [
      { key: 'commentCount', label: 'Comments' },
      { key: 'totalReplies', label: 'Replies' },
      { key: 'totalLikes', label: 'Likes' },
    ],
  },
  redditStats: {
    label: 'Reddit',
    icon: 'text-orange-400',
    bg: 'from-orange-500/10 to-orange-500/5',
    border: 'border-orange-500/20',
    metrics: [
      { key: 'postCount', label: 'Posts' },
      { key: 'totalScore', label: 'Total Score' },
      { key: 'averageScore', label: 'Avg Score', format: true },
    ],
  },
  instagramStats: {
    label: 'Instagram',
    icon: 'text-pink-400',
    bg: 'from-pink-500/10 to-pink-500/5',
    border: 'border-pink-500/20',
    metrics: [
      { key: 'preferredMediaType', label: 'Preferred Media' },
    ],
  },
};

function PlatformStatsCard({ platformKey, stats }) {
  const config = PLATFORM_STAT_CONFIG[platformKey];
  if (!config || !stats) return null;

  const hasData = config.metrics.some((m) => {
    const v = stats[m.key];
    return v != null && v !== 0 && v !== '' && v !== null;
  });

  const visibleMetrics = config.metrics.filter((m) => stats[m.key] != null);
  if (visibleMetrics.length === 0) return null;

  return (
    <div className={`bg-gradient-to-br ${config.bg} border ${config.border} rounded-xl p-4 ${!hasData ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <PlatformBadge platform={platformKey.replace('Stats', '')} />
        {!hasData && <span className="text-[9px] text-muted-foreground/60 ml-auto">No activity</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {visibleMetrics.map((m) => {
          const val = stats[m.key];
          const display = typeof val === 'object' && val !== null
            ? Object.keys(val).length > 0 ? Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'
            : m.format ? fmt(val) : (val?.toLocaleString?.() ?? String(val ?? '—'));
          return (
            <div key={m.key}>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-bold text-foreground">{display}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserProfileDisplay({ data, onViewReport }) {
  if (!data) return null;

  if (data.upstreamStatus || data.message) {
    const msg = data.message || (data.upstreamStatus === 404 ? 'User not found' : 'Could not load profile');
    return (
      <div className="mt-4 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium">Profile not found</p>
          <p className="text-xs text-muted-foreground">{msg}</p>
        </div>
      </div>
    );
  }

  const author = data.normalizedAuthor || data.author || data.globalUserId || '—';
  const userId = data.globalUserId || data.global_user_id;
  const platformStatsKeys = Object.keys(data).filter((k) => k.endsWith('Stats'));
  const activePlatforms = platformStatsKeys.filter((k) => {
    const stats = data[k];
    if (!stats || typeof stats !== 'object') return false;
    return Object.values(stats).some((v) => v != null && v !== 0 && v !== '' && v !== null && !(typeof v === 'object' && Object.keys(v).length === 0));
  });
  const inactivePlatforms = platformStatsKeys.filter((k) => !activePlatforms.includes(k));

  const hasLegacyFields = data.audience_classification || data.influence_tier || data.posting_style;
  const tone = TONE_CONFIG[data.dominant_tone] || TONE_CONFIG.neutral;
  const ToneIcon = tone.icon;

  const knownKeys = new Set([
    'globalUserId', 'normalizedAuthor', 'author', 'global_user_id',
    'audience_classification', 'influence_tier', 'posting_style',
    'dominant_tone', 'primary_platform', 'total_posts', 'branching_ratio',
    'last_categorized_at', 'upstreamStatus', 'upstreamBody', 'message',
    ...platformStatsKeys,
  ]);
  const extraFields = Object.fromEntries(Object.entries(data).filter(([k]) => !knownKeys.has(k)));

  return (
    <div className="mt-4 space-y-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-purple-500/10 border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center">
              <User className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{author}</h3>
              {userId && userId !== author && (
                <div className="mt-0.5">
                  <CopyableId id={userId} />
                </div>
              )}
              {activePlatforms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {activePlatforms.map((k) => (
                    <PlatformBadge key={k} platform={k.replace('Stats', '')} />
                  ))}
                  {data.dominant_tone && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${tone.cls}`}>
                      <ToneIcon className="w-3 h-3" />
                      {data.dominant_tone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {data.last_categorized_at && (
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              Updated {shortDate(data.last_categorized_at)}
            </p>
          )}
        </div>
      </div>

      {/* Platform Stats */}
      {platformStatsKeys.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-semibold text-foreground">Platform Engagement</h4>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {activePlatforms.length} active platform{activePlatforms.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePlatforms.map((k) => (
              <PlatformStatsCard key={k} platformKey={k} stats={data[k]} />
            ))}
            {inactivePlatforms.map((k) => (
              <PlatformStatsCard key={k} platformKey={k} stats={data[k]} />
            ))}
          </div>
        </div>
      )}

      {/* Legacy classification/tier/metrics (if present) */}
      {hasLegacyFields && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.audience_classification && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 p-3 border-b border-border">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Audience Classification</span>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <ColoredBadge value={data.audience_classification} colorMap={CLASSIFICATION_COLORS} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {CLASSIFICATION_DESCRIPTIONS[data.audience_classification] || '—'}
                  </p>
                </div>
              </div>
            )}
            {data.influence_tier && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 p-3 border-b border-border">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Influence Tier</span>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <ColoredBadge value={data.influence_tier} colorMap={TIER_COLORS} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {TIER_DESCRIPTIONS[data.influence_tier] || '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.total_posts != null && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Posts</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{data.total_posts?.toLocaleString() ?? '—'}</p>
              </div>
            )}
            {data.posting_style && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Posting Style</span>
                </div>
                <p className="text-sm font-bold text-foreground mb-1">{data.posting_style}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {POSTING_STYLE_DESCRIPTIONS[data.posting_style] || '—'}
                </p>
              </div>
            )}
            {data.branching_ratio != null && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Branching Ratio</span>
                </div>
                <BranchingRatioGauge value={data.branching_ratio} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Extra fields fallback */}
      {Object.keys(extraFields).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <KeyValueCards data={extraFields} />
        </div>
      )}

      {/* Get Full Report CTA */}
      {(data.normalizedAuthor || data.author) && onViewReport && (
        <button
          onClick={() => onViewReport(data.normalizedAuthor || data.author)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-colors text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          Generate Full Report for {data.normalizedAuthor || data.author}
        </button>
      )}
    </div>
  );
}

const USERS_PER_PAGE = 10;

function UsersDisplay({ data }) {
  const usersList = data ? (data.users || (Array.isArray(data) ? data : [])) : [];
  const { rows: sortedUsers, sortState, requestSort } = useSortableRows(usersList, null);
  const [page, setPage] = useState(1);
  // Reset to the first page whenever a new result set comes in.
  useEffect(() => { setPage(1); }, [usersList]);
  if (!data) return null;
  const totalUsers = data.totalUsers ?? usersList.length;
  const pageCount = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const currentPage = Math.min(page, pageCount || 1);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const pageUsers = sortedUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  const sp = (sortKey) => ({ sortKey, sortState, onSort: requestSort });
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
                <SortableHeader label="Author" {...sp('author')} />
                <SortableHeader label="Classification" {...sp('audience_classification')} />
                <SortableHeader label="Tier" {...sp('influence_tier')} />
                <SortableHeader label="Posting Style" {...sp('posting_style')} />
                <SortableHeader label="Tone" {...sp('dominant_tone')} />
                <SortableHeader label="Platform" {...sp('primary_platform')} />
                <SortableHeader label="Posts" {...sp('total_posts')} />
                <SortableHeader label="Branch Ratio" {...sp('branching_ratio')} />
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((u, i) => {
                const tone = TONE_CONFIG[u.dominant_tone] || TONE_CONFIG.neutral;
                const ToneIcon = tone.icon;
                return (
                  <tr key={startIndex + i} className="border-b border-border/50 hover:bg-accent/20">
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
          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Showing {startIndex + 1}–{Math.min(startIndex + USERS_PER_PAGE, usersList.length)} of {usersList.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1 rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">Page {currentPage} of {pageCount}</span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= pageCount}
                  className="p-1 rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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

export default function UserIntelligenceView({ selectedEntity }) {
  const [userProfile, setUserProfile] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [users, setUsers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [userFilters, setUserFilters] = useState({});
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState({});
  const [lookupTab, setLookupTab] = useState('report');

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
            <h2 className="text-2xl font-bold text-foreground">User Intel</h2>
            <p className="text-sm text-muted-foreground">Look up user profiles and browse the user directory</p>
          </div>
        </div>

        {selectedEntity?.id && (
          <div className="bg-card border border-border rounded-xl p-5">
            <HourlyActivityHeatmap entityId={selectedEntity.id} />
          </div>
        )}

        <Section icon={Search} title="User Lookup" subtitle="Search for a specific user's profile or detailed influence report" color="text-sky-400">
          <div className="mt-3">
            <div className="flex items-center gap-1 p-0.5 bg-background border border-border rounded-lg w-fit mb-4">
              <button
                onClick={() => setLookupTab('report')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${lookupTab === 'report' ? 'bg-sky-500/15 text-sky-400 font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                Report by Author
              </button>
              <button
                onClick={() => setLookupTab('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${lookupTab === 'profile' ? 'bg-indigo-500/15 text-indigo-400 font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <User className="w-3.5 h-3.5" />
                Profile by User ID
              </button>
            </div>

            {lookupTab === 'report' && (
              <div>
                <KeywordSearch
                  label="Author name..."
                  loading={loading.userReport}
                  onSearch={(a) => withLoading('userReport', () => auraMathService.getUserReport(a).then(setUserReport).catch((e) => setUserReport(e && typeof e === 'object' ? e : { message: 'Failed to load report' })))}
                />
                <UserReportDisplay data={userReport} />
              </div>
            )}

            {lookupTab === 'profile' && (
              <div>
                <KeywordSearch
                  label="Global user ID..."
                  loading={loading.userProfile}
                  onSearch={(id) => withLoading('userProfile', () => auraMathService.getUserProfile(id).then(setUserProfile).catch((e) => setUserProfile(e && typeof e === 'object' ? e : { message: 'Failed to load profile' })))}
                />
                <UserProfileDisplay
                  data={userProfile}
                  onViewReport={(author) => {
                    setLookupTab('report');
                    withLoading('userReport', () => auraMathService.getUserReport(author).then(setUserReport).catch((e) => setUserReport(e && typeof e === 'object' ? e : { message: 'Failed to load report' })));
                  }}
                />
              </div>
            )}
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
          {(() => {
            const hints = [
              ['Classification', userFilters.audienceClassification, CLASSIFICATION_DESCRIPTIONS],
              ['Influence Tier', userFilters.influenceTier, TIER_DESCRIPTIONS],
              ['Posting Style', userFilters.postingStyle, POSTING_STYLE_DESCRIPTIONS],
            ].filter(([, value, map]) => value && map[value]);
            if (!hints.length) return null;
            return (
              <div className="mt-2 space-y-1">
                {hints.map(([label, value, map]) => (
                  <p key={label} className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">{value}</span>
                    <span className="text-muted-foreground/60"> · {label}</span>
                    {' — '}{map[value]}
                  </p>
                ))}
              </div>
            );
          })()}
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
