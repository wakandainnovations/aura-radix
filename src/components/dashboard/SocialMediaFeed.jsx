import React, { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageSquare, Heart, MessageCircle, Share2, AlertTriangle, Star, Send, X, Sparkles, RotateCcw, Check, Loader, Ban, Loader2, Eye } from 'lucide-react';
import { formatImpressions } from '../../utils/helpers';
import { interactionService } from '../../api/interactionService';
import { mentionActionService } from '../../api/mentionActionService';
import InlineReplyBox from '../feed/InlineReplyBox';
import { PLATFORM_LOGOS } from '../../constants/platformLogos';

export default function SocialMediaFeed({ mentions, selectedEntity, onMentionDeleted }) {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('postDate'); // 'postDate' or 'sentiment'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [expandedReplyId, setExpandedReplyId] = useState(null);
  const [replies, setReplies] = useState({}); // Store replies by mention id
  const [toast, setToast] = useState(null); // Toast notification state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // mention id awaiting delete confirmation
  const [deletingId, setDeletingId] = useState(null); // mention id currently being deleted
  const [removedIds, setRemovedIds] = useState(() => new Set()); // locally hidden after delete

  // Format postDate - no timezone offset needed, backend already provides GMT+5:30
  const formatSmartTime = (dateString) => {
    try {
      const postDate = new Date(dateString);
      const relativeTime = formatDistanceToNow(postDate, { addSuffix: true });
      const fullDateTime = format(postDate, 'MMM dd, yyyy • p'); // e.g., "Feb 02, 2026 • 4:27 PM"
      return `${relativeTime}`;
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Transform API response to component format
  const transformedMentions = useMemo(() => {
    if (!mentions || mentions.length === 0) {
      return [];
    }

    return mentions.filter(mention => !removedIds.has(mention.id)).map(mention => ({
      id: mention.id,
      text: mention.content,
      author: mention.author || mention.username || mention.userId || 'Anonymous User',
      platform: mention.platform.toLowerCase(),
      timestamp: formatSmartTime(mention.postDate),
      originalDate: mention.postDate,
      sentiment: mention.sentiment.toLowerCase(),
      aiSentiment: mention.sentiment.toLowerCase(),
      narrative: 'N/A',
      engagement: { likes: 0, comments: 0, shares: 0 },
      aiThreatScore: 0,
      isRealComment: true,
      permalink: mention.permalink,
      impressions: formatImpressions(mention.impressions)
    }));
  }, [mentions, removedIds]);

  // Group and filter mentions by platform
  const platformMentions = useMemo(() => {
    if (!transformedMentions || transformedMentions.length === 0) {
      return { all: [], reddit: [], instagram: [], x: [], youtube: [] };
    }

    // Sort mentions based on sortBy and sortOrder
    const sortMentions = (mentionsToSort) => {
      const sorted = [...mentionsToSort];
      if (sortBy === 'postDate') {
        sorted.sort((a, b) => {
          const timeA = new Date(a.originalDate).getTime();
          const timeB = new Date(b.originalDate).getTime();
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });
      } else if (sortBy === 'sentiment') {
        const sentimentOrder = { positive: 1, neutral: 0, negative: -1 };
        sorted.sort((a, b) => {
          const scoreA = sentimentOrder[a.aiSentiment] || 0;
          const scoreB = sentimentOrder[b.aiSentiment] || 0;
          return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        });
      }
      return sorted;
    };

    const grouped = {
      all: sortMentions(transformedMentions),
      reddit: sortMentions(transformedMentions.filter(m => m.platform === 'reddit')),
      instagram: sortMentions(transformedMentions.filter(m => m.platform === 'instagram')),
      x: sortMentions(transformedMentions.filter(m => m.platform === 'x')),
      youtube: sortMentions(transformedMentions.filter(m => m.platform === 'youtube'))
    };

    return grouped;
  }, [transformedMentions, sortBy, sortOrder]);

  const displayMentions = platformMentions[selectedPlatform] || platformMentions.all;

  const platformInfo = {
    reddit: { name: 'Reddit', color: 'text-primary', bg: 'bg-primary/10' },
    instagram: { name: 'Instagram', color: 'text-primary', bg: 'bg-primary/10' },
    youtube: { name: 'YouTube', color: 'text-primary', bg: 'bg-primary/10' },
    x: { name: 'X', color: 'text-primary', bg: 'bg-primary/10' },
    all: { name: 'All Platforms', color: 'text-primary', bg: 'bg-primary/10' }
  };

  const getPlatformLogoStyle = (platform) => {
    const normalizedPlatform = platform?.toLowerCase();
    if (normalizedPlatform === 'reddit') {
      return {
        filter:
          'invert(42%) sepia(93%) saturate(6449%) hue-rotate(2deg) brightness(103%) contrast(101%)',
      };
    }
    if (normalizedPlatform === 'instagram') {
      return {
        filter:
          'invert(35%) sepia(95%) saturate(5844%) hue-rotate(317deg) brightness(89%) contrast(92%)',
      };
    }
    return { filter: 'invert(100%)' };
  };

  const getPlatformIcon = (platform) => {
    const normalizedPlatform = platform?.toLowerCase();
    const logo = PLATFORM_LOGOS[normalizedPlatform];
    if (!logo) return '🌐';

    return (
      <img
        src={logo}
        alt={platform}
        className="w-4 h-4"
        style={getPlatformLogoStyle(normalizedPlatform)}
      />
    );
  };

  const getHeaderPlatformIcon = (platform) => {
    if (platform === 'all') {
      return <span className="mr-1">🌐</span>;
    }

    const logo = PLATFORM_LOGOS[platform];
    if (!logo) {
      return <span className="mr-1">🌐</span>;
    }

    return (
      <img
        src={logo}
        alt={platform}
        className="w-3.5 h-3.5 inline-block mr-1"
        style={getPlatformLogoStyle(platform)}
      />
    );
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'neutral':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10';
      case 'negative':
        return 'bg-red-500/10';
      case 'neutral':
        return 'bg-yellow-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  const getThreatLevel = (score) => {
    if (score >= 70) return { label: 'High', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (score >= 40) return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'Low', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  const formatEngagement = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleReplyClick = (mentionId) => {
    setExpandedReplyId(expandedReplyId === mentionId ? null : mentionId);
  };

  const handleSendReply = (replyText) => {
    if (replyText.trim()) {
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      const mentionIdx = displayMentions.findIndex(m => m.id === expandedReplyId);
      if (mentionIdx !== -1) {
        setReplies({
          ...replies,
          [mentionIdx]: [
            ...(replies[mentionIdx] || []),
            {
              id: Date.now(),
              text: replyText,
              timestamp,
              author: 'You'
            }
          ]
        });
        setExpandedReplyId(null);
        showToast('Reply posted successfully!');
      }
    }
  };

  const handleCloseReply = () => {
    setExpandedReplyId(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Mark a post as not relevant: hard-delete the mention from the database
  // (README 26b) after an explicit inline confirmation, then drop it from the UI.
  const handleConfirmNotRelevant = async (mentionId) => {
    setDeletingId(mentionId);
    try {
      await mentionActionService.deleteMention(mentionId);
      setRemovedIds((prev) => new Set(prev).add(mentionId));
      setConfirmDeleteId(null);
      onMentionDeleted?.(mentionId);
      showToast('Post removed — marked as not relevant');
    } catch (err) {
      showToast(err?.message || 'Failed to remove post. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenPost = (permalink) => {
    if (permalink) {
      window.open(permalink, '_blank');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Social Media Posts
        </h3>
        <span className="text-xs text-muted-foreground">{displayMentions.length} posts</span>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {['all', 'x', 'reddit', 'instagram', 'youtube'].map((platform) => {
          const info = platformInfo[platform];
          const count = platformMentions[platform]?.length || 0;
          return (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPlatform === platform
                  ? `${info.bg} ${info.color} border border-current`
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {getHeaderPlatformIcon(platform)}
              {info.name}
              {count > 0 && <span className="ml-2 text-xs opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3 pb-4">
        <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('postDate')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              sortBy === 'postDate'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            Post Date
          </button>
          <button
            onClick={() => setSortBy('sentiment')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              sortBy === 'sentiment'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            Sentiment
          </button>
        </div>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-1.5 rounded text-xs font-medium bg-accent text-muted-foreground hover:text-foreground transition-all"
          title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
        >
          {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {displayMentions.length > 0 ? (
          displayMentions.map((mention, idx) => (
            <div key={idx} className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
              <div className="p-4 space-y-3">
              {/* Header - Platform & Author */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {getPlatformIcon(mention.platform)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{mention.author}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mention.platform.toUpperCase()} • {mention.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Impressions - only shown when the platform reports them */}
                  {mention.impressions && (
                    <span
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                      title={`${mention.impressions} impressions on ${mention.platform.toUpperCase()}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {mention.impressions}
                    </span>
                  )}
                  {/* Sentiment Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSentimentColor(
                      mention.aiSentiment
                    )} ${getSentimentBg(mention.aiSentiment)}`}
                  >
                    {mention.aiSentiment}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <p 
                onClick={() => handleOpenPost(mention.permalink)}
                className="text-sm text-foreground leading-relaxed line-clamp-3 cursor-pointer hover:text-primary transition-colors"
              >
                {mention.text}
              </p>

              {/* Engagement Stats & Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex-1">
                  <button
                    onClick={() => setConfirmDeleteId(confirmDeleteId === mention.id ? null : mention.id)}
                    disabled={deletingId === mention.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-accent text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    title="Mark this post as not relevant and remove it from the database"
                  >
                    <Ban className="w-3 h-3" />
                    Not Relevant
                  </button>
                </div>
                <button
                  onClick={() => handleReplyClick(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    expandedReplyId === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-muted-foreground hover:text-foreground hover:bg-primary/20'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </button>
              </div>

              {/* Inline confirmation — deleting a mention is irreversible (README 26b) */}
              {confirmDeleteId === mention.id && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">
                    Remove this post permanently? This deletes it from the mentions database and can't be undone.
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleConfirmNotRelevant(mention.id)}
                      disabled={deletingId === mention.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
                    >
                      {deletingId === mention.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                      Remove
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={deletingId === mention.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Previous Replies */}
              {/* {replies[idx] && replies[idx].length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border/50">
                  {replies[idx].map((reply) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-primary/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-primary">{reply.author}</p>
                          <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                        </div>
                      </div>
                      <p className="text-xs text-foreground mt-1">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )} */}
              </div>

              {/* Reply Box */}
              {expandedReplyId === idx && (
                <InlineReplyBox
                  mention={mention}
                  onClose={handleCloseReply}
                  onSend={handleSendReply}
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No posts found for this platform</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {/* <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>Real comment from social media</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 fill-red-300 text-red-300" />
          <span>Auto-generated comment</span>
        </div>
      </div> */}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === 'error'
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-green-500/20 border border-green-500/50 text-green-400'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
