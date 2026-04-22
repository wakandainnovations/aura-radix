import React, { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  MessageSquare,
  Flag,
  Ban,
  Network,
  ExternalLink,
  MessageSquarePlus,
} from "lucide-react";
import {
  formatTimestamp,
  getThreatColor,
  getSentimentBg,
} from "../../utils/helpers";
import InlineReplyBox from "./InlineReplyBox";
import { PLATFORM_LOGOS } from "../../constants/platformLogos";

export default function MentionFeed({
  mentions,
  selectedMention,
  onSelectMention = () => {},
}) {
  const parentRef = useRef(null);
  const [replyingToId, setReplyingToId] = useState(null);

  const virtualizer = useVirtualizer({
    count: mentions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (replyingToId === mentions[index]?.id ? 450 : 120),
    overscan: 5,
    measureElement: (el) => el?.getBoundingClientRect().height,
  });

  const getPlatformIcon = (platform) => {
    const logo = PLATFORM_LOGOS[platform?.toLowerCase()];
    if (!logo)
      return <MessageSquare className="w-6 h-6 text-muted-foreground" />;

    return (
      <img
        src={logo}
        alt={platform}
        className="w-6 h-6"
        style={{
          filter:
            platform?.toLowerCase() === "reddit"
              ? "invert(42%) sepia(93%) saturate(6449%) hue-rotate(2deg) brightness(103%) contrast(101%)"
              : platform?.toLowerCase() === "instagram"
                ? "invert(35%) sepia(95%) saturate(5844%) hue-rotate(317deg) brightness(89%) contrast(92%)"
                : "invert(100%)",
        }}
      />
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Right-click for actions
          </div>
        </div>
      </div>

      <ScrollArea.Root className="flex-1">
        <ScrollArea.Viewport
          ref={parentRef}
          className="w-full h-full"
          style={{ overflowY: "auto" }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const mention = mentions[virtualRow.index];
              return (
                <ContextMenu.Root key={mention.id}>
                  <ContextMenu.Trigger>
                    <div
                      ref={(el) => virtualizer.measureElement(el)}
                      data-index={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div
                        className={`px-4 py-3 border-b border-border cursor-pointer transition-colors ${
                          selectedMention?.id === mention.id
                            ? "bg-primary/10"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => {
                          onSelectMention(mention);
                          // Open permalink in new tab if available
                          if (mention.permalink || mention.sourceUrl) {
                            window.open(mention.permalink || mention.sourceUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getPlatformIcon(mention.platform)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {mention.author?.name || mention.author || mention.username || mention.userId || "Unknown Author"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(mention.timestamp || mention.postDate)}
                              </span>
                              {mention.isAnomaly && (
                                <span className="px-1.5 py-0.5 text-xs bg-threat-critical/20 text-threat-critical rounded border border-threat-critical/50">
                                  ANOMALY
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingToId(
                                    mention.id === replyingToId
                                      ? null
                                      : mention.id,
                                  );
                                }}
                                className={`ml-auto flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                  replyingToId === mention.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                                }`}
                                title="Quick Reply"
                              >
                                <MessageSquarePlus className="w-3 h-3" />
                                Reply
                              </button>
                            </div>
                            <p className="text-sm text-foreground/90 line-clamp-2 mb-2">
                              {mention.content || mention.textSnippet || "No content available"}
                            </p>
                            <div className="flex items-center gap-3">
                              {/* Sentiment Badge */}
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${getSentimentBg(mention.sentiment?.toLowerCase() || mention.aiSentiment?.toLowerCase())} capitalize`}
                              >
                                {(mention.sentiment || mention.aiSentiment || "unknown").toLowerCase()}
                              </span>
                              {/* Threat Score - Only show if available */}
                              {(mention.aiThreatScore !== undefined || mention.threatScore !== undefined) && (
                                <span
                                  className={`text-xs font-mono font-semibold ${getThreatColor(mention.aiThreatScore || mention.threatScore || 0)}`}
                                >
                                  Threat: {mention.aiThreatScore || mention.threatScore}
                                </span>
                              )}
                              {/* Engagement Metrics - Only show if available */}
                              {mention.engagement && (
                                <span className="text-xs text-muted-foreground">
                                  {mention.engagement.likes || 0} ❤️{" "}
                                  {mention.engagement.comments || 0} 💬
                                </span>
                              )}
                              {/* Platform Link */}
                              {(mention.permalink || mention.sourceUrl) && (
                                <a
                                  href={mention.permalink || mention.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/10"
                                  title="Open post in new tab"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Post
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline Reply Box */}
                      {replyingToId === mention.id && (
                        <InlineReplyBox
                          mention={mention}
                          onClose={() => setReplyingToId(null)}
                          onSend={(replyText) => {
                            console.log("Sending reply:", replyText);
                            // Handle sending reply here
                          }}
                        />
                      )}
                    </div>
                  </ContextMenu.Trigger>

                  <MentionContextMenu
                    mention={mention}
                    onSelectMention={onSelectMention}
                  />
                </ContextMenu.Root>
              );
            })}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="w-2 bg-transparent"
        >
          <ScrollArea.Thumb className="bg-border rounded-full hover:bg-border/80" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

function MentionContextMenu({ mention, onSelectMention }) {
  const [aiReplyOpen, setAiReplyOpen] = React.useState(false);

  return (
    <>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[220px] bg-popover border border-border rounded-md p-1 shadow-lg">
          <ContextMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none"
            onSelect={() => {
              onSelectMention(mention);
              // Trigger AI reply generation
              window.dispatchEvent(
                new CustomEvent("openAIReply", { detail: mention }),
              );
            }}
          >
            <MessageSquare className="w-4 h-4" />
            Generate AI Reply
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-border my-1" />

          <ContextMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none"
            onSelect={() => {
              onSelectMention(mention);
              // Open thread genealogy
              window.dispatchEvent(
                new CustomEvent("viewThread", { detail: mention }),
              );
            }}
          >
            <Network className="w-4 h-4" />
            View Thread Genealogy
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-border my-1" />

          {mention.sourceUrl && (
            <ContextMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none"
              onSelect={() =>
                window.open(mention.sourceUrl, "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink className="w-4 h-4" />
              Open Source URL
            </ContextMenu.Item>
          )}

          <ContextMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none"
            onSelect={() => alert(`Flagged ${mention.author} for legal review`)}
          >
            <Flag className="w-4 h-4" />
            Flag for Legal Review
          </ContextMenu.Item>

          <ContextMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-destructive hover:text-destructive-foreground cursor-pointer outline-none text-destructive"
            onSelect={() => alert(`User ${mention.author} banned`)}
          >
            <Ban className="w-4 h-4" />
            Ban/Block User
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </>
  );
}
