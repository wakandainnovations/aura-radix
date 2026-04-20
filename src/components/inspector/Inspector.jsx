import React, { useState, useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Separator from '@radix-ui/react-separator';
import * as Dialog from '@radix-ui/react-dialog';
import { User, Bot, Calendar, AlertTriangle, MessageCircle, TrendingUp, X } from 'lucide-react';
import { getThreatColor, getThreatBg, formatTimestamp } from '../../utils/helpers';
import SimplifiedReplyGenerator from '../ai/SimplifiedReplyGenerator';
import ThreadGenealogy from '../ai/ThreadGenealogy';

export default function Inspector({ mention }) {
  const [aiReplyOpen, setAiReplyOpen] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);

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
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a mention to inspect</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Inspector</h2>
          <div className="text-xs text-muted-foreground mt-1">
            Deep Analysis & Context
          </div>
        </div>

        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="w-full h-full">
            <div className="p-4 space-y-6">
              {/* Threat Assessment */}
              <div className={`p-4 rounded-lg border ${getThreatBg(mention.aiThreatScore)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${getThreatColor(mention.aiThreatScore)}`} />
                  <h3 className="font-semibold text-sm">Threat Assessment</h3>
                </div>
                <div className={`text-4xl font-bold mb-1 ${getThreatColor(mention.aiThreatScore)}`}>
                  {mention.aiThreatScore}/100
                </div>
                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
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
                  {mention.aiThreatScore >= 80 ? 'Critical - Immediate action required' :
                   mention.aiThreatScore >= 60 ? 'High - Monitor closely' :
                   mention.aiThreatScore >= 40 ? 'Medium - Routine monitoring' :
                   'Low - Standard observation'}
                </p>
              </div>

              {/* Full Content */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Full Content</h3>
                <div className="bg-background/50 p-3 rounded-lg text-sm">
                  {mention.textSnippet}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>❤️ {mention.engagement.likes}</span>
                  <span>💬 {mention.engagement.comments}</span>
                  <span>🔄 {mention.engagement.shares}</span>
                </div>
              </div>

              <Separator.Root className="bg-border" />

              {/* User Profile */}
              <div>
                <h3 className="font-semibold text-sm mb-3">User Profile</h3>
                <div className="space-y-3">
                  <HoverCard.Root>
                    <HoverCard.Trigger asChild>
                      <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{mention.author || 'Unknown Author'}</span>
                      </button>
                    </HoverCard.Trigger>
                    <UserProfileCard mention={mention} />
                  </HoverCard.Root>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Bot Probability</span>
                      </div>
                      <div className={`text-lg font-semibold ${
                        mention.userProfile.botProbability > 70 ? 'text-threat-critical' :
                        mention.userProfile.botProbability > 40 ? 'text-threat-medium' :
                        'text-threat-low'
                      }`}>
                        {mention.userProfile.botProbability.toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-background/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Account Age</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {Math.floor(mention.userProfile.accountAge / 365)}y
                      </div>
                    </div>
                  </div>

                  <div className="bg-background/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Past Negative Interactions</div>
                    <div className="text-lg font-semibold text-threat-high">
                      {mention.userProfile.pastNegativeCount}
                    </div>
                  </div>
                </div>
              </div>

              <Separator.Root className="bg-border" />

              {/* Narrative Analysis */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Narrative Analysis</h3>
                <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">{mention.narrative}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This mention is part of the "{mention.narrative}" narrative cluster,
                    indicating a trending conversation topic.
                  </p>
                </div>
              </div>

              <Separator.Root className="bg-border" />

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setAiReplyOpen(true)}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Generate AI Reply
                  </button>
                  <button
                    onClick={() => setThreadOpen(true)}
                    className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors text-sm font-medium"
                  >
                    View Thread Genealogy
                  </button>
                </div>
              </div>
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-transparent">
            <ScrollArea.Thumb className="bg-border rounded-full" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
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
        className="w-80 bg-popover border border-border rounded-lg p-4 shadow-xl"
        sideOffset={5}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center text-lg font-bold">
              {(mention.author || 'A')[0]}
            </div>
            <div>
              <div className="font-semibold">{mention.author || 'Unknown Author'}</div>
              <div className="text-xs text-muted-foreground">{mention.authorId || 'N/A'}</div>
            </div>
          </div>

          <Separator.Root className="bg-border" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Account Age</div>
              <div className="font-semibold">{Math.floor(mention.userProfile.accountAge / 365)} years</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Followers</div>
              <div className="font-semibold">{mention.userProfile.followerCount.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-background/50 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Bot Probability</span>
              <span className={`text-sm font-semibold ${
                mention.userProfile.botProbability > 70 ? 'text-threat-critical' : 'text-threat-low'
              }`}>
                {mention.userProfile.botProbability.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5">
              <div
                className={`h-full rounded-full ${
                  mention.userProfile.botProbability > 70 ? 'bg-threat-critical' : 'bg-threat-low'
                }`}
                style={{ width: `${mention.userProfile.botProbability}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Past Negative Interactions</span>
            <span className="font-semibold text-threat-high">{mention.userProfile.pastNegativeCount}</span>
          </div>
        </div>

        <HoverCard.Arrow className="fill-border" />
      </HoverCard.Content>
    </HoverCard.Portal>
  );
}
