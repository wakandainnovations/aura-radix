import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import { AlertTriangle, X, ChevronLeft, ChevronRight, User, Bot, Calendar, TrendingUp, FileText, BarChart3, ExternalLink } from 'lucide-react';
import MentionFeed from './MentionFeed';
import MentionActionCard from '../ai-dashboard/MentionActionCard';
import { getThreatColor, getThreatBg, formatTimestamp, getSentimentBg } from '../../utils/helpers';

export default function CrisisFocusView({ mentions, selectedMention, onSelectMention, onMentionDeleted, activeView = 'crisis' }) {
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const [currentCrisisIndex, setCurrentCrisisIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter negative posts
  const negativePosts = mentions.filter(m => m.sentiment?.toUpperCase() === 'NEGATIVE' || m.aiSentiment?.toLowerCase() === 'negative');
  const neutralPosts = mentions.filter(m => m.sentiment?.toUpperCase() !== 'NEGATIVE' && m.aiSentiment?.toLowerCase() !== 'negative');

  // Get current negative post
  const currentNegativePost = negativePosts[currentCrisisIndex];

  // Navigation handlers
  const goToNext = () => {
    if (currentCrisisIndex < negativePosts.length - 1) {
      setCurrentCrisisIndex(currentCrisisIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentCrisisIndex > 0) {
      setCurrentCrisisIndex(currentCrisisIndex - 1);
    }
  };

  // Reset index when modal opens
  React.useEffect(() => {
    if (crisisModalOpen) {
      setCurrentCrisisIndex(0);
    }
  }, [crisisModalOpen]);

  // Calculate summary statistics for neutral posts
  const neutralStats = {
    total: neutralPosts.length,
    critical: neutralPosts.filter(m => m.aiThreatScore >= 80).length,
    high: neutralPosts.filter(m => m.aiThreatScore >= 60 && m.aiThreatScore < 80).length,
    medium: neutralPosts.filter(m => m.aiThreatScore >= 40 && m.aiThreatScore < 60).length,
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Main Feed - All Mentions */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider">Negative Posts</h2>
            <div className="text-xs text-muted-foreground mt-1">
              {negativePosts.length} negative mentions • Real-time monitoring
            </div>
          </div>
          {/* {negativePosts.length > 0 && (
            <button
              onClick={() => setCrisisModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-threat-critical/10 hover:bg-threat-critical/20 text-threat-critical rounded-md transition-colors border border-threat-critical/30"
            >
              <AlertTriangle className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs font-semibold">{negativePosts.length} Negative Posts</div>
                <div className="text-xs opacity-70">Click to review</div>
              </div>
            </button>
          )} */}
        </div>
      </div>

      {/* Crisis Feed posts — Mention Actions look & feel: each post expands to
          Draft Reply / Escalate to Crisis / Mobilize Allies / Report Abuse. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {negativePosts.map((mention) => (
          <MentionActionCard key={mention.id} mention={mention} onMentionDeleted={onMentionDeleted} />
        ))}
      </div>

      {/* Negative Posts Modal */}
      {negativePosts.length > 0  && (
        <Dialog.Root open={crisisModalOpen} onOpenChange={setCrisisModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[1400px] h-[90vh] bg-background border-2 border-threat-critical rounded-lg shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] flex flex-col">
              {/* Negative Posts Modal Header */}
              <div className="p-4 border-b border-threat-critical bg-threat-critical/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-threat-critical" />
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-threat-critical">
                        Negative Posts - Review Required
                      </Dialog.Title>
                      <Dialog.Description className="text-xs text-muted-foreground mt-1">
                        Showing {currentCrisisIndex + 1} of {negativePosts.length} negative {negativePosts.length === 1 ? 'mention' : 'mentions'} • Sentiment: Negative
                      </Dialog.Description>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md border border-border">
                      <button
                        onClick={goToPrevious}
                        disabled={currentCrisisIndex === 0}
                        className="p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Previous negative post"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="px-2 text-sm font-mono">
                        {currentCrisisIndex + 1}/{negativePosts.length}
                      </div>
                      <button
                        onClick={goToNext}
                        disabled={currentCrisisIndex === negativePosts.length - 1}
                        className="p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next negative post"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <Dialog.Close className="rounded-md p-2 hover:bg-accent transition-colors">
                      <X className="w-5 h-5" />
                      <span className="sr-only">Close</span>
                    </Dialog.Close>
                  </div>
                </div>
              </div>

              {/* Negative Posts Feed (Scrollable) */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Side: Negative Post Feed */}
                <div className="w-1/2 border-r border-border overflow-hidden">
                  {currentNegativePost && (
                    <MentionFeed
                      mentions={[currentNegativePost]}
                      selectedMention={selectedMention}
                      onSelectMention={(mention) => {
                        onSelectMention(mention);
                      }}
                    />
                  )}
                </div>

                {/* Right Side: Deep Analysis */}
                <div className="w-1/2 flex flex-col bg-card">
                  <div className="p-3 border-b border-border">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Deep Analysis
                    </h2>
                  </div>

                  <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <Tabs.List className="flex border-b border-border bg-background/50">
                      <Tabs.Trigger
                        value="overview"
                        className="flex-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
                      >
                        <FileText className="w-3 h-3 inline-block mr-1" />
                        Overview
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="user"
                        className="flex-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
                      >
                        <User className="w-3 h-3 inline-block mr-1" />
                        User
                      </Tabs.Trigger>
                    </Tabs.List>

                    {/* Overview Tab */}
                    <Tabs.Content value="overview" className="flex-1 overflow-hidden">
                      <ScrollArea.Root className="h-full">
                        <ScrollArea.Viewport className="w-full h-full">
                          {currentNegativePost && (
                            <div className="p-3 space-y-4">
                              {/* Threat Assessment */}
                              {(currentNegativePost.aiThreatScore !== undefined || currentNegativePost.threatScore !== undefined) && (
                                <div className={`p-3 rounded-lg border ${getThreatBg(currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0)}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className={`w-4 h-4 ${getThreatColor(currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0)}`} />
                                    <h3 className="font-semibold text-xs">Threat Level</h3>
                                  </div>
                                  <div className={`text-3xl font-bold mb-1 ${getThreatColor(currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0)}`}>
                                    {currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0}/100
                                  </div>
                                  <div className="w-full bg-background/50 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        (currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0) >= 80 ? 'bg-threat-critical' :
                                        (currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0) >= 60 ? 'bg-threat-high' :
                                        (currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0) >= 40 ? 'bg-threat-medium' :
                                        'bg-threat-low'
                                      }`}
                                      style={{ width: `${currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {(currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0) >= 80 ? 'Critical - Immediate action' :
                                     (currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0) >= 60 ? 'High - Monitor closely' :
                                     (currentNegativePost.aiThreatScore || currentNegativePost.threatScore || 0) >= 40 ? 'Medium - Routine' :
                                     'Low - Standard'}
                                  </p>
                                </div>
                              )}

                              {/* Full Content */}
                              <div>
                                <h3 className="font-semibold text-xs mb-2">Content</h3>
                                <div className="bg-background/50 p-2 rounded-lg text-xs">
                                  {currentNegativePost.content || currentNegativePost.textSnippet || 'No content available'}
                                </div>
                              </div>

                              {/* Narrative Analysis */}
                              {(currentNegativePost.narrative || currentNegativePost.category) && (
                                <div>
                                  <h3 className="font-semibold text-xs mb-2">Narrative</h3>
                                  <div className="bg-primary/10 border border-primary/30 p-2 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <TrendingUp className="w-3 h-3" />
                                      <span className="font-semibold text-xs">{currentNegativePost.narrative || currentNegativePost.category}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Part of trending "{currentNegativePost.narrative || currentNegativePost.category}" cluster
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Source Link */}
                              {(currentNegativePost.sourceUrl || currentNegativePost.permalink) && (
                                <div>
                                  <a
                                    href={currentNegativePost.sourceUrl || currentNegativePost.permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-xs font-medium"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Open Original Post
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-transparent">
                          <ScrollArea.Thumb className="bg-border rounded-full" />
                        </ScrollArea.Scrollbar>
                      </ScrollArea.Root>
                    </Tabs.Content>

                    {/* User Tab */}
                    <Tabs.Content value="user" className="flex-1 overflow-hidden">
                      <ScrollArea.Root className="h-full">
                        <ScrollArea.Viewport className="w-full h-full">
                          {currentNegativePost && (
                            <div className="p-3 space-y-4">
                              {currentNegativePost.userProfile ? (
                                <div>
                                  <h3 className="font-semibold text-xs mb-3">User Profile</h3>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs">
                                      <User className="w-3 h-3" />
                                      <span className="font-medium">{currentNegativePost.author || 'Unknown'}</span>
                                    </div>

                                    {(currentNegativePost.userProfile.botProbability !== undefined) && (
                                      <div className="bg-background/50 p-2 rounded-lg">
                                        <div className="flex items-center gap-1 mb-1">
                                          <Bot className="w-3 h-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">Bot Risk</span>
                                        </div>
                                        <div className={`text-base font-semibold ${
                                          currentNegativePost.userProfile.botProbability > 70 ? 'text-threat-critical' :
                                          currentNegativePost.userProfile.botProbability > 40 ? 'text-threat-medium' :
                                          'text-threat-low'
                                        }`}>
                                          {currentNegativePost.userProfile.botProbability.toFixed(1)}%
                                        </div>
                                      </div>
                                    )}

                                    {(currentNegativePost.userProfile.accountAge !== undefined) && (
                                      <div className="bg-background/50 p-2 rounded-lg">
                                        <div className="flex items-center gap-1 mb-1">
                                          <Calendar className="w-3 h-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">Age</span>
                                        </div>
                                        <div className="text-base font-semibold">
                                          {Math.floor(currentNegativePost.userProfile.accountAge / 365)}y
                                        </div>
                                      </div>
                                    )}

                                    {(currentNegativePost.userProfile.followerCount !== undefined) && (
                                      <div className="bg-background/50 p-2 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">Followers</div>
                                        <div className="text-base font-semibold">
                                          {currentNegativePost.userProfile.followerCount.toLocaleString()}
                                        </div>
                                      </div>
                                    )}

                                    {(currentNegativePost.userProfile.pastNegativeCount !== undefined) && (
                                      <div className="bg-background/50 p-2 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">Past Negative</div>
                                        <div className="text-base font-semibold text-threat-high">
                                          {currentNegativePost.userProfile.pastNegativeCount}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-xs text-muted-foreground">No user profile data available</p>
                                </div>
                              )}
                            </div>
                          )}
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-transparent">
                          <ScrollArea.Thumb className="bg-border rounded-full" />
                        </ScrollArea.Scrollbar>
                      </ScrollArea.Root>
                    </Tabs.Content>
                  </Tabs.Root>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-border bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Use arrow buttons to navigate • Click mention to inspect details
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (currentNegativePost) {
                          onSelectMention(currentNegativePost);
                          window.dispatchEvent(new CustomEvent('openAIReply', { detail: currentNegativePost }));
                        }
                      }}
                      className="px-4 py-2 bg-threat-critical/10 text-threat-critical border border-threat-critical/30 rounded-md hover:bg-threat-critical/20 transition-colors text-sm font-medium"
                    >
                      Generate AI Reply
                    </button>
                    <Dialog.Close asChild>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                        View All Posts
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) }

      {/* No Negative Posts State */}
      {negativePosts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6 bg-background/95 rounded-lg border border-border shadow-lg">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-threat-low opacity-50" />
            <p className="text-sm font-medium mb-1">No Negative Posts</p>
            <p className="text-xs text-muted-foreground">No mentions with negative sentiment detected</p>
          </div>
        </div>
      )}
    </div>
  );
}
