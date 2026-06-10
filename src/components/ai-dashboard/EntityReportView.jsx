import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Loader2, Sparkles, Share2, AlertTriangle, Lightbulb, X,
  Activity, Radio, Hash, Gauge, Megaphone, Users, Copy, Check, RefreshCw,
} from 'lucide-react';
import { marketingService } from '../../api/marketingService';
import {
  fmt, PlatformBadge, ColoredBadge, Section,
} from './audienceIntelShared';
import { useSortableRows, SortableHeader } from '../shared';

const SEVERITY_COLORS = {
  HIGH: 'bg-red-500/20 text-red-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  LOW: 'bg-slate-500/20 text-slate-400',
};

const TONE_BAR_COLORS = {
  positive: 'bg-emerald-400',
  negative: 'bg-red-400',
  neutral: 'bg-slate-400',
};

// A small labelled metric tile used across the profile / recommendation grids.
function Stat({ label, value, hint }) {
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5 break-words">{value ?? '—'}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

// Horizontal positive/negative/neutral breakdown from a { tone: count } map.
function ToneBreakdown({ breakdown }) {
  if (!breakdown || typeof breakdown !== 'object') return null;
  const total = Object.values(breakdown).reduce((a, b) => a + (Number(b) || 0), 0);
  if (total === 0) return <span className="text-xs text-muted-foreground">No tone data</span>;
  return (
    <div className="space-y-1.5">
      {['positive', 'neutral', 'negative'].map((tone) => {
        const count = Number(breakdown[tone]) || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={tone} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-14 capitalize">{tone}</span>
            <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${TONE_BAR_COLORS[tone]}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-foreground font-mono w-16 text-right">{count} ({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
}

function EntityProfileSection({ profile }) {
  if (!profile) return null;
  return (
    <Section icon={Activity} title="Entity Profile" subtitle="What this entity is and how much chatter it drives" color="text-cyan-400">
      <div className="mt-2 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-foreground">{profile.name}</span>
          {profile.type && <ColoredBadge value={profile.type} colorMap={{}} />}
          {profile.viralityTier && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400">
              {profile.viralityTier}
            </span>
          )}
        </div>
        {profile.viralityTierExplained && (
          <p className="text-xs text-muted-foreground leading-relaxed">{profile.viralityTierExplained}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="Total Posts" value={profile.totalPosts?.toLocaleString?.() ?? profile.totalPosts} />
          <Stat label="Audience Size" value={profile.audienceSize?.toLocaleString?.() ?? profile.audienceSize} hint="distinct authors" />
          <Stat label="Avg Posts / Day" value={fmt(profile.averagePostsPerDay, 1)} />
          <Stat label="Observed Span" value={`${fmt(profile.observationSpanDays, 1)} days`} />
          <Stat label="First Seen" value={profile.firstSeen} />
          <Stat label="Last Seen" value={profile.lastSeen} />
        </div>
        {Array.isArray(profile.activePlatforms) && profile.activePlatforms.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase">Platforms:</span>
            {profile.activePlatforms.map((p) => <PlatformBadge key={p} platform={p} />)}
          </div>
        )}
        {Array.isArray(profile.trackedKeywords) && profile.trackedKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase">Keywords:</span>
            {profile.trackedKeywords.map((k) => (
              <span key={k} className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]">{k}</span>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function ConversationSection({ cp }) {
  if (!cp) return null;
  return (
    <Section icon={Radio} title="Conversation Profile" subtitle="How and when the conversation spikes (virality)" color="text-purple-400">
      <div className="mt-2 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Stat label="Branching Ratio" value={fmt(cp.branchingRatio, 4)} />
          <Stat label="Distinct Bursts" value={cp.distinctBurstEvents} />
          <Stat label="Most Active Day" value={cp.mostActiveDayOfWeek} />
        </div>
        {cp.amplificationExplained && (
          <p className="text-xs text-muted-foreground leading-relaxed">{cp.amplificationExplained}</p>
        )}
        {Array.isArray(cp.peakActivityWindows) && cp.peakActivityWindows.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Peak Activity Windows</p>
            <ul className="space-y-0.5">
              {cp.peakActivityWindows.map((w, i) => (
                <li key={i} className="text-xs text-foreground">• {w}</li>
              ))}
            </ul>
          </div>
        )}
        {cp.longestBurst && (
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Largest Burst</p>
            <p className="text-xs text-muted-foreground">{cp.longestBurst.readableDescription}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <Stat label="Keyword" value={cp.longestBurst.keyword} />
              <Stat label="Posts" value={cp.longestBurst.postCount} />
              <Stat label="Duration" value={`${fmt(cp.longestBurst.durationMinutes, 1)} min`} />
              <Stat label="Peak Spike" value={fmt(cp.longestBurst.peakExcitationSpike, 3)} />
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function TopicIntelligenceSection({ topics }) {
  const list = Array.isArray(topics) ? topics : [];
  const { rows, sortState, requestSort } = useSortableRows(list, null);
  const sp = (sortKey) => ({ sortKey, sortState, onSort: requestSort, compact: true });
  if (list.length === 0) return null;
  return (
    <Section icon={Hash} title="Topic Intelligence" subtitle="Which keywords drive bursts and at what tone" color="text-blue-400">
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <SortableHeader label="Keyword" {...sp('keyword')} />
              <SortableHeader label="Mentions" {...sp('totalMentions')} />
              <SortableHeader label="Bursts" {...sp('burstsTriggered')} />
              <SortableHeader label="Category" {...sp('contentCategory')} />
              <SortableHeader label="Tone" {...sp('dominantTone')} />
              <SortableHeader label="Avg Score" {...sp('averageSentimentScore')} />
              <SortableHeader label="Avg Spike" {...sp('averageExcitationSpike')} />
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20 align-top">
                <td className="py-1.5 px-2"><span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">{t.keyword}</span></td>
                <td className="py-1.5 px-2 text-foreground font-mono">{t.totalMentions}</td>
                <td className="py-1.5 px-2 text-foreground font-mono">{t.burstsTriggered}</td>
                <td className="py-1.5 px-2 text-foreground">{t.contentCategory || '—'}</td>
                <td className="py-1.5 px-2"><span className="capitalize text-foreground">{t.dominantTone || '—'}</span></td>
                <td className="py-1.5 px-2 text-foreground font-mono">{t.averageSentimentScore == null ? '—' : fmt(t.averageSentimentScore, 1)}</td>
                <td className="py-1.5 px-2 text-foreground font-mono">{fmt(t.averageExcitationSpike, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function SentimentChannelSection({ sentiment, channelStrategy }) {
  if (!sentiment && !channelStrategy) return null;
  const channels = channelStrategy?.channels || [];
  return (
    <Section icon={Gauge} title="Audience Sentiment & Channels" subtitle="Overall tone of the conversation and where it lives" color="text-emerald-400">
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sentiment && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Sentiment</span>
              {sentiment.sentimentLabel && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                  {sentiment.sentimentLabel}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">net {fmt(sentiment.netSentiment, 2)}</span>
            </div>
            <ToneBreakdown breakdown={sentiment.toneBreakdown} />
          </div>
        )}
        {channelStrategy && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">Channels</span>
            {channelStrategy.headline && <p className="text-xs text-foreground">{channelStrategy.headline}</p>}
            <div className="space-y-1.5">
              {channels.map((ch, i) => {
                const pct = Math.round((ch.share || 0) * 100);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-24"><PlatformBadge platform={ch.platform} /></div>
                    <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-foreground font-mono w-20 text-right">{ch.postCount} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function RecommendationsSection({ rec }) {
  if (!rec) return null;
  return (
    <Section icon={Megaphone} title="Marketing Recommendations" subtitle="Actionable campaign guidance" color="text-rose-400">
      <div className="mt-2 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Stat label="Primary Channel" value={rec.primaryChannel} />
          <Stat label="Best Time" value={rec.bestTimeToEngage} />
          <Stat label="Reach Multiplier" value={rec.estimatedReachMultiplier} />
        </div>
        {rec.amplificationPotential && <Stat label="Amplification Potential" value={rec.amplificationPotential} />}
        {rec.campaignType && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Campaign Type</p>
            <p className="text-xs text-foreground leading-relaxed">{rec.campaignType}</p>
          </div>
        )}
        {rec.contentStrategy && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Content Strategy</p>
            <p className="text-xs text-foreground leading-relaxed">{rec.contentStrategy}</p>
          </div>
        )}
        {Array.isArray(rec.contentTriggers) && rec.contentTriggers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase">Triggers:</span>
            {rec.contentTriggers.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]">{t}</span>
            ))}
          </div>
        )}
        {rec.actionableAdvice && (
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Actionable Advice</p>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{rec.actionableAdvice}</p>
          </div>
        )}
        {rec.addressableAudience && <p className="text-[11px] text-muted-foreground">{rec.addressableAudience}</p>}
      </div>
    </Section>
  );
}

function AdvocatesSection({ advocates }) {
  const list = Array.isArray(advocates) ? advocates : [];
  const { rows, sortState, requestSort } = useSortableRows(list, null, {
    total_engagement: (a) => (typeof a.total_engagement === 'number' ? a.total_engagement : Number(a.total_engagement) || null),
  });
  const sp = (sortKey) => ({ sortKey, sortState, onSort: requestSort, compact: true });
  if (list.length === 0) return null;
  return (
    <Section icon={Users} title="Top Advocates" subtitle="Highest-amplification voices in the conversation" color="text-amber-400">
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <SortableHeader label="#" compact />
              <SortableHeader label="User" {...sp('global_user_id')} />
              <SortableHeader label="Tribe" {...sp('tribe_label')} />
              <SortableHeader label="Posts" {...sp('post_count')} />
              <SortableHeader label="Engagement" {...sp('total_engagement')} />
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-1.5 px-2 text-foreground font-mono">{i + 1}</td>
                <td className="py-1.5 px-2 text-foreground font-mono text-[10px]">{a.global_user_id || '—'}</td>
                <td className="py-1.5 px-2"><span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]">{a.tribe_label || '—'}</span></td>
                <td className="py-1.5 px-2 text-foreground font-mono">{a.post_count ?? '—'}</td>
                <td className="py-1.5 px-2 text-foreground font-mono">{a.total_engagement?.toLocaleString?.() ?? a.total_engagement ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function FlagsSection({ redFlags, opportunities }) {
  const hasRed = Array.isArray(redFlags) && redFlags.length > 0;
  const hasOpp = Array.isArray(opportunities) && opportunities.length > 0;
  if (!hasRed && !hasOpp) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Section icon={AlertTriangle} title="Red Flags" subtitle="Risks a marketer should know" color="text-red-400">
        <div className="mt-2 space-y-2">
          {hasRed ? redFlags.map((f, i) => (
            <div key={i} className="bg-background border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">{f.flag}</span>
                {f.severity && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.LOW}`}>
                    {f.severity}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.detail}</p>
            </div>
          )) : <p className="text-xs text-muted-foreground">No red flags detected.</p>}
        </div>
      </Section>
      <Section icon={Lightbulb} title="Opportunity Flags" subtitle="Specific openings to exploit" color="text-emerald-400">
        <div className="mt-2 space-y-2">
          {hasOpp ? opportunities.map((o, i) => (
            <div key={i} className="bg-background border border-border rounded-lg p-3">
              <p className="text-xs font-semibold text-foreground mb-1">{o.opportunity}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{o.detail}</p>
            </div>
          )) : <p className="text-xs text-muted-foreground">No standout opportunities yet.</p>}
        </div>
      </Section>
    </div>
  );
}

// Condensed, prospect-facing version of the report shown in a modal. Backed by the
// SHAREABLE endpoint (/v1/marketing/entity-report/{id}) so it mirrors what a prospect
// would see, and exposes a copyable link to that shareable route.
function ShareableReportModal({ entityId, report, loading, error, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/v1/marketing/entity-report/${encodeURIComponent(entityId)}`;

  const copyLink = useCallback(() => {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [shareUrl]);

  const profile = report?.entityProfile;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h4 className="text-foreground font-semibold">Shareable Report</h4>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono"
            />
            <button
              onClick={copyLink}
              className="px-3 py-2 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating shareable report…
            </div>
          )}
          {error && <p className="text-xs text-red-400 py-4">{error}</p>}

          {!loading && !error && report && !profile && report.message && (
            <p className="text-xs text-muted-foreground py-4">{report.message}</p>
          )}

          {!loading && !error && profile && (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-foreground">{profile.name}</p>
                {report.generatedAt && <p className="text-[10px] text-muted-foreground">Generated {report.generatedAt}</p>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Stat label="Virality" value={profile.viralityTier} />
                <Stat label="Audience" value={profile.audienceSize?.toLocaleString?.() ?? profile.audienceSize} />
                <Stat label="Total Posts" value={profile.totalPosts?.toLocaleString?.() ?? profile.totalPosts} />
                <Stat label="Sentiment" value={report.audienceSentiment?.sentimentLabel} />
              </div>
              {report.marketingRecommendations?.actionableAdvice && (
                <div className="bg-background border border-border rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Why this entity matters</p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {report.marketingRecommendations.actionableAdvice}
                  </p>
                </div>
              )}
              {Array.isArray(report.opportunityFlags) && report.opportunityFlags.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Opportunities</p>
                  {report.opportunityFlags.map((o, i) => (
                    <p key={i} className="text-xs text-foreground">• <span className="font-medium">{o.opportunity}:</span> {o.detail}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function errorMessage(err) {
  if (!err) return null;
  if (err.status === 404) return 'No entity found for this id.';
  if (err.status === 502 || err.error === 'upstream_failure' || err.error === 'upstream_unavailable') {
    return 'The report service is temporarily unavailable. Please try again shortly.';
  }
  return err.message || 'Failed to generate the report. Please try again.';
}

export default function EntityReportView({ selectedEntity }) {
  const entityId = selectedEntity?.id;

  // Auto-fetch the in-app report as soon as the view opens with an entity selected
  // (and whenever the selected entity changes). The report reflects live scoring and
  // is not cached server-side, so we don't keep it fresh past the initial load.
  const {
    data: report,
    isFetching: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entity-report', entityId],
    queryFn: () => marketingService.getEntityReport(entityId),
    enabled: !!entityId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const generate = useCallback(() => refetch(), [refetch]);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareReport, setShareReport] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);

  const openShareable = useCallback(async () => {
    if (!entityId) return;
    setShareOpen(true);
    setShareLoading(true);
    setShareError(null);
    try {
      const data = await marketingService.getShareableEntityReport(entityId);
      setShareReport(data);
    } catch (err) {
      setShareError(errorMessage(err));
      setShareReport(null);
    } finally {
      setShareLoading(false);
    }
  }, [entityId]);

  const profile = report?.entityProfile;
  const noHistory = report && !profile && report.message; // valid empty result

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Intelligence Report</h2>
              <p className="text-sm text-muted-foreground">
                AI-generated marketing intelligence for {selectedEntity?.name || 'the selected entity'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              disabled={loading || !entityId}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : report ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating…' : report ? 'Regenerate' : 'Generate Report'}
            </button>
            <button
              onClick={openShareable}
              disabled={!entityId}
              className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-accent/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Shareable Report
            </button>
          </div>
        </div>

        {report?.generatedAt && (
          <p className="text-[11px] text-muted-foreground">Generated {report.generatedAt}</p>
        )}

        {/* Initial empty state */}
        {!report && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
            <Sparkles className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No report generated yet</p>
            <p className="text-xs text-muted-foreground max-w-md">
              Click <span className="font-semibold">Generate Report</span> to build a live marketing intelligence
              report for this entity from its keyword conversation.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Building intelligence report…
          </div>
        )}

        {error && !loading && (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-foreground">{errorMessage(error)}</p>
            <button onClick={generate} className="mt-3 text-xs text-primary hover:underline">Try again</button>
          </div>
        )}

        {noHistory && (
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm font-medium text-foreground mb-1">{report.name || selectedEntity?.name}</p>
            <p className="text-xs text-muted-foreground mb-3">{report.message}</p>
            {Array.isArray(report.trackedKeywords) && report.trackedKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase">Tracked keywords:</span>
                {report.trackedKeywords.map((k) => (
                  <span key={k} className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]">{k}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {profile && !loading && (
          <div className="space-y-4">
            <EntityProfileSection profile={profile} />
            <ConversationSection cp={report.conversationProfile} />
            <TopicIntelligenceSection topics={report.topicIntelligence} />
            <SentimentChannelSection sentiment={report.audienceSentiment} channelStrategy={report.channelStrategy} />
            <RecommendationsSection rec={report.marketingRecommendations} />
            <AdvocatesSection advocates={report.topAdvocates} />
            <FlagsSection redFlags={report.redFlags} opportunities={report.opportunityFlags} />
          </div>
        )}
      </div>

      {shareOpen && (
        <ShareableReportModal
          entityId={entityId}
          report={shareReport}
          loading={shareLoading}
          error={shareError}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
