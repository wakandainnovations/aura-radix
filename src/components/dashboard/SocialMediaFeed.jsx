import React, { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageSquare, Heart, MessageCircle, Share2, AlertTriangle, Star, Send, X, Sparkles, RotateCcw, Check, Loader } from 'lucide-react';
import { interactionService } from '../../api/interactionService';
import InlineReplyBox from '../feed/InlineReplyBox';

export default function SocialMediaFeed({ mentions, selectedEntity }) {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('postDate'); // 'postDate' or 'sentiment'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [expandedReplyId, setExpandedReplyId] = useState(null);
  const [replies, setReplies] = useState({}); // Store replies by mention id
  const [toast, setToast] = useState(null); // Toast notification state

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

    return mentions.map(mention => ({
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
      permalink: mention.permalink
    }));
  }, [mentions]);

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
    reddit: { icon: '🔴', name: 'Reddit', color: 'text-primary', bg: 'bg-primary/10' },
    instagram: { icon: '📷', name: 'Instagram', color: 'text-primary', bg: 'bg-primary/10' },
    youtube: { icon: '▶️', name: 'YouTube', color: 'text-primary', bg: 'bg-primary/10' },
    x: { icon: '𝕏', name: 'X', color: 'text-primary', bg: 'bg-primary/10' },
    all: { icon: '🌐', name: 'All Platforms', color: 'text-primary', bg: 'bg-primary/10' }
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

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
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
              <span className="mr-1">{info.icon}</span>
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
                    {mention.author?.charAt(0)?.toUpperCase() || 'A'}
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

              {/* Engagement Stats & Reply Button */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex-1">
                  {/* Empty space for balance */}
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
        <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
