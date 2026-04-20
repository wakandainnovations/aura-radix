import React, { useState, useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Separator from '@radix-ui/react-separator';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { User, Bot, Calendar, AlertTriangle, MessageCircle, TrendingUp, X, FileText, Network, BarChart3 } from 'lucide-react';
import { getThreatColor, getThreatBg, formatTimestamp } from '../../utils/helpers';
import SimplifiedReplyGenerator from '../ai/SimplifiedReplyGenerator';
import ThreadGenealogy from '../ai/ThreadGenealogy';

export default function TabbedInspector({ mention }) {
  const [aiReplyOpen, setAiReplyOpen] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleOpenAIReply = (e) => {
      setAiReplyOpen(true);
    };

    const handleViewThread = (e) => {
      setThreadOpen(true);
    };

    window.addEventListener('openAIReply', handleOpenAIReply);
    window.addEventListener('viewThread', handleViewThread);

    return () => {
      window.removeEventListener('openAIReply', handleOpenAIReply);
      window.removeEventListener('viewThread', handleViewThread);
    };
  }, []);

  if (!mention) {
    return (
      <div className="h-full flex items-center justify-center bg-card border-l border-border">
        <div className="text-center text-muted-foreground p-6">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Select a mention to inspect</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-card">
        {/* Compact Header */}
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Deep Analysis
          </h2>
        </div>

        {/* Tabs Navigation */}
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
            <Tabs.Trigger
              value="analytics"
              className="flex-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
            >
              <BarChart3 className="w-3 h-3 inline-block mr-1" />
              Analytics
            </Tabs.Trigger>
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Content value="overview" className="flex-1 overflow-hidden">
            <ScrollArea.Root className="h-full">
              <ScrollArea.Viewport className="w-full h-full">
                <div className="p-3 space-y-4">
                  {/* Threat Assessment */}
                  <div className={`p-3 rounded-lg border ${getThreatBg(mention.aiThreatScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${getThreatColor(mention.aiThreatScore)}`} />
                      <h3 className="font-semibold text-xs">Threat Level</h3>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${getThreatColor(mention.aiThreatScore)}`}>
                      {mention.aiThreatScore}/100
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          mention.aiThreatScore >= 80 ? 'bg-threat-critical' :
                          mention.aiThreatScore >= 60 ? 'bg-threat-high' :
                          mention.aiThreatScore >= 40 ? 'bg-threat-medium' :
                          'bg-threat-low'
                        }`}
                        style={{ width: `${mention.aiThreatScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {mention.aiThreatScore >= 80 ? 'Critical - Immediate action' :
                       mention.aiThreatScore >= 60 ? 'High - Monitor closely' :
                       mention.aiThreatScore >= 40 ? 'Medium - Routine' :
                       'Low - Standard'}
                    </p>
                  </div>

                  {/* Full Content */}
                  <div>
                    <h3 className="font-semibold text-xs mb-2">Content</h3>
                    <div className="bg-background/50 p-2 rounded-lg text-xs">
                      {mention.textSnippet}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>❤️ {mention.engagement.likes}</span>
                      <span>💬 {mention.engagement.comments}</span>
                      <span>🔄 {mention.engagement.shares}</span>
                    </div>
                  </div>

                  {/* Narrative Analysis */}
                  <div>
                    <h3 className="font-semibold text-xs mb-2">Narrative</h3>
                    <div className="bg-primary/10 border border-primary/30 p-2 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-semibold text-xs">{mention.narrative}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Part of trending "{mention.narrative}" cluster
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setAiReplyOpen(true)}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
                    >
                      Generate AI Reply
                    </button>
                    <button
                      onClick={() => setThreadOpen(true)}
                      className="w-full px-3 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors text-xs font-medium"
                    >
                      View Thread Genealogy
                    </button>
                  </div>
                </div>
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
                <div className="p-3 space-y-4">
                  <div>
                    <h3 className="font-semibold text-xs mb-3">User Profile</h3>
                    <div className="space-y-3">
                      <HoverCard.Root>
                        <HoverCard.Trigger asChild>
                          <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{mention.author || 'Unknown Author'}</span>
                          </button>
                        </HoverCard.Trigger>
                        <UserProfileCard mention={mention} />
                      </HoverCard.Root>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background/50 p-2 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            <Bot className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Bot Risk</span>
                          </div>
                          <div className={`text-base font-semibold ${
                            mention.userProfile.botProbability > 70 ? 'text-threat-critical' :
                            mention.userProfile.botProbability > 40 ? 'text-threat-medium' :
                            'text-threat-low'
                          }`}>
                            {mention.userProfile.botProbability.toFixed(1)}%
                          </div>
                        </div>

                        <div className="bg-background/50 p-2 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Age</span>
                          </div>
                          <div className="text-base font-semibold">
                            {Math.floor(mention.userProfile.accountAge / 365)}y
                          </div>
                        </div>
                      </div>

                      <div className="bg-background/50 p-2 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Past Negative</div>
                        <div className="text-base font-semibold text-threat-high">
                          {mention.userProfile.pastNegativeCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-transparent">
                <ScrollArea.Thumb className="bg-border rounded-full" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics" className="flex-1 overflow-hidden">
            <ScrollArea.Root className="h-full">
              <ScrollArea.Viewport className="w-full h-full">
                <div className="p-3 space-y-4">
                  <div>
                    <h3 className="font-semibold text-xs mb-2">Engagement Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                        <span className="text-xs text-muted-foreground">Likes</span>
                        <span className="text-xs font-semibold">{mention.engagement.likes}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                        <span className="text-xs text-muted-foreground">Comments</span>
                        <span className="text-xs font-semibold">{mention.engagement.comments}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/50 rounded">
                        <span className="text-xs text-muted-foreground">Shares</span>
                        <span className="text-xs font-semibold">{mention.engagement.shares}</span>
                      </div>
                    </div>
                  </div>

                  <Separator.Root className="bg-border" />

                  <div>
                    <h3 className="font-semibold text-xs mb-2">Sentiment Analysis</h3>
                    <div className="bg-background/50 p-2 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Classification</div>
                      <div className="text-sm font-semibold capitalize">
                        {mention.aiSentiment}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs mb-2">Platform</h3>
                    <div className="bg-background/50 p-2 rounded-lg">
                      <div className="text-sm font-semibold capitalize">
                        {mention.platform}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(mention.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-transparent">
                <ScrollArea.Thumb className="bg-border rounded-full" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Simplified Reply Dialog */}
      <SimplifiedReplyGenerator 
        mention={mention} 
        open={aiReplyOpen} 
        onOpenChange={setAiReplyOpen} 
      />

      {/* Thread Genealogy Dialog */}
      <ThreadGenealogy 
        mention={mention} 
        open={threadOpen} 
        onOpenChange={setThreadOpen} 
      />
    </>
  );
}

function UserProfileCard({ mention }) {
  return (
    <HoverCard.Portal>
      <HoverCard.Content
        className="w-64 bg-popover border border-border rounded-lg p-3 shadow-xl"
        sideOffset={5}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center text-sm font-bold">
              {(mention.author || 'A')[0]}
            </div>
            <div>
              <div className="font-semibold text-xs">{mention.author || 'Unknown Author'}</div>
              <div className="text-xs text-muted-foreground">{mention.authorId || 'N/A'}</div>
            </div>
          </div>

          <Separator.Root className="bg-border" />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Account Age</div>
              <div className="font-semibold">{Math.floor(mention.userProfile.accountAge / 365)}y</div>
            </div>
            <div>
              <div className="text-muted-foreground">Followers</div>
              <div className="font-semibold">{mention.userProfile.followerCount.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-background/50 p-2 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Bot Risk</span>
              <span className={`text-xs font-semibold ${
                mention.userProfile.botProbability > 70 ? 'text-threat-critical' : 'text-threat-low'
              }`}>
                {mention.userProfile.botProbability.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-1">
              <div
                className={`h-full rounded-full ${
                  mention.userProfile.botProbability > 70 ? 'bg-threat-critical' : 'bg-threat-low'
                }`}
                style={{ width: `${mention.userProfile.botProbability}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Past Negative</span>
            <span className="font-semibold text-threat-high">{mention.userProfile.pastNegativeCount}</span>
          </div>
        </div>

        <HoverCard.Arrow className="fill-border" />
      </HoverCard.Content>
    </HoverCard.Portal>
  );
}
