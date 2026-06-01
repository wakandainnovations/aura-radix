import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Send, AlertTriangle, Users, Loader2,
  ChevronDown, ChevronUp, FileText, Clock, Flag, Ticket
} from 'lucide-react';
import { mentionActionService } from '../../api/mentionActionService';
import { reportAbuseService, ABUSE_CATEGORIES } from '../../api/reportAbuseService';
import { abuseStatusMeta, abuseCategoryLabel } from '../../utils/abuseReportStatus';

const ACTION_ICONS = {
  REPLY_DRAFT: FileText,
  CRISIS_PLAN: AlertTriangle,
  MOBILIZE: Users,
};

const SENTIMENT_COLORS = {
  POSITIVE: 'text-emerald-400',
  NEGATIVE: 'text-red-400',
  NEUTRAL: 'text-slate-400',
};

/**
 * Expandable mention card with the standard mention-action toolset:
 * Draft Reply, Escalate to Crisis, Mobilize Allies, and Report Abuse.
 *
 * Tolerant of both the dashboard mention DTO (author/content/sentiment as
 * plain strings) and the feed mention shape (author object, textSnippet,
 * aiSentiment) so it can back both the Mention Actions panel and the Crisis Feed.
 */
export default function MentionActionCard({ mention }) {
  const [expanded, setExpanded] = useState(false);
  const [actions, setActions] = useState([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [draftResult, setDraftResult] = useState(null);
  const [crisisResult, setCrisisResult] = useState(null);
  const [mobilizeResult, setMobilizeResult] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportCategory, setReportCategory] = useState(ABUSE_CATEGORIES[0].value);
  const [reportNotes, setReportNotes] = useState('');
  const [reportError, setReportError] = useState('');
  const [abuseReports, setAbuseReports] = useState([]);

  const loadActions = useCallback(async () => {
    setActionsLoading(true);
    try {
      const result = await mentionActionService.getActions(mention.id);
      setActions(Array.isArray(result) ? result : []);
    } catch {
      setActions([]);
    } finally {
      setActionsLoading(false);
    }
  }, [mention.id]);

  const loadAbuseReports = useCallback(async () => {
    try {
      const result = await reportAbuseService.getForMention(mention.id);
      setAbuseReports(Array.isArray(result) ? result : []);
    } catch {
      setAbuseReports([]);
    }
  }, [mention.id]);

  useEffect(() => {
    if (expanded) {
      loadActions();
      loadAbuseReports();
    }
  }, [expanded, loadActions, loadAbuseReports]);

  const handleReportAbuse = async (e) => {
    e.preventDefault();
    setReportError('');
    setActionInProgress('report');
    try {
      await reportAbuseService.reportAbuse(mention.id, {
        category: reportCategory,
        notes: reportNotes.trim(),
      });
      setShowReportForm(false);
      setReportNotes('');
      setReportCategory(ABUSE_CATEGORIES[0].value);
      loadAbuseReports();
    } catch (err) {
      setReportError(err?.message || 'Failed to submit report');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDraftReply = async () => {
    setActionInProgress('draft');
    try {
      const result = await mentionActionService.draftReply(mention.id);
      setDraftResult(result);
      loadActions();
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePostReply = async (draftId) => {
    setActionInProgress('post');
    try {
      await mentionActionService.postReply(mention.id, draftId);
      loadActions();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEscalate = async () => {
    setActionInProgress('escalate');
    try {
      const result = await mentionActionService.escalateToCrisis(mention.id);
      setCrisisResult(result);
      loadActions();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMobilize = async () => {
    setActionInProgress('mobilize');
    try {
      const result = await mentionActionService.mobilizeAllies(mention.id);
      setMobilizeResult(result);
      loadActions();
    } finally {
      setActionInProgress(null);
    }
  };

  const author = mention.author?.name || mention.author || mention.username || 'Unknown';
  const content = mention.content || mention.textSnippet || 'No content available';
  const sentiment = (mention.sentiment || mention.aiSentiment || '').toUpperCase();
  const sentimentColor = SENTIMENT_COLORS[sentiment] || 'text-slate-400';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {mention.platform && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                {mention.platform}
              </span>
            )}
            {sentiment && (
              <span className={`text-xs font-medium ${sentimentColor}`}>
                {sentiment}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              @{author}
            </span>
          </div>
          <p className="text-sm text-foreground line-clamp-2">{content}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDraftReply}
              disabled={!!actionInProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              {actionInProgress === 'draft' ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
              Draft Reply
            </button>
            <button
              onClick={handleEscalate}
              disabled={!!actionInProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {actionInProgress === 'escalate' ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
              Escalate to Crisis
            </button>
            <button
              onClick={handleMobilize}
              disabled={!!actionInProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
            >
              {actionInProgress === 'mobilize' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
              Mobilize Allies
            </button>
            <button
              onClick={() => { setShowReportForm((s) => !s); setReportError(''); }}
              disabled={!!actionInProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors disabled:opacity-50"
            >
              <Flag className="w-3 h-3" />
              Report Abuse
            </button>
          </div>

          {showReportForm && (
            <form onSubmit={handleReportAbuse} className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 space-y-3">
              <p className="text-xs text-rose-400 font-medium">Report this mention for abuse</p>
              <div className="flex flex-wrap gap-3">
                <div className="w-48">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rose-400"
                  >
                    {ABUSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Notes (optional)</label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={2}
                  placeholder="Add any context for the moderation team…"
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rose-400 resize-y"
                />
              </div>
              {reportError && (
                <p className="text-[11px] text-red-400">{reportError}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={actionInProgress === 'report'}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500 text-white hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {actionInProgress === 'report' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReportForm(false); setReportError(''); }}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {abuseReports.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Flag className="w-3 h-3" />
                Abuse Reports ({abuseReports.length})
              </p>
              <div className="space-y-1.5">
                {abuseReports.map((report) => {
                  const statusMeta = abuseStatusMeta(report.status);
                  return (
                    <div key={report.id} className="bg-background/50 border border-border rounded-lg p-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">
                          {abuseCategoryLabel(report.category)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        {report.externalRef && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground" title="Platform moderation ticket">
                            <Ticket className="w-2.5 h-2.5" />
                            {report.externalRef}
                          </span>
                        )}
                      </div>
                      {report.notes && (
                        <p className="text-[11px] text-muted-foreground mt-1 italic">"{report.notes}"</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Filed {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : '—'}
                        {report.resolvedAt && <> · resolved {new Date(report.resolvedAt).toLocaleString()}</>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {draftResult && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-400 font-medium mb-1">AI Draft Reply</p>
              <p className="text-sm text-foreground">{draftResult.generatedText}</p>
              <button
                onClick={() => handlePostReply(draftResult.draftId)}
                disabled={!!actionInProgress}
                className="mt-2 flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
              >
                {actionInProgress === 'post' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Post Reply
              </button>
            </div>
          )}

          {crisisResult && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400 font-medium mb-1">Crisis Plan</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{crisisResult.plan}</p>
            </div>
          )}

          {mobilizeResult?.allies && mobilizeResult.allies.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-xs text-purple-400 font-medium mb-2">
                Ally Recommendations ({mobilizeResult.allies.length})
              </p>
              <div className="space-y-2">
                {mobilizeResult.allies.map((ally, i) => (
                  <div key={i} className="bg-background/50 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{ally.globalUserId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                        {ally.primaryPlatform}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                        {ally.influenceTier}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{ally.suggestedDm}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading action history...
            </div>
          ) : actions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Action History
              </p>
              <div className="space-y-1">
                {actions.map((action, i) => {
                  const ActionIcon = ACTION_ICONS[action.type] || FileText;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ActionIcon className="w-3 h-3" />
                      <span className="font-medium">{action.type}</span>
                      {action.actor && <span>by {action.actor}</span>}
                      {action.createdAt && (
                        <span>{new Date(action.createdAt).toLocaleString()}</span>
                      )}
                      {action.draftStatus && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          action.draftStatus === 'POSTED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {action.draftStatus}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
