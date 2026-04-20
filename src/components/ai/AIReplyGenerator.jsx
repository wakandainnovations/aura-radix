import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, Check, Copy } from 'lucide-react';
import { generateAIReply } from '../../utils/helpers';

export default function AIReplyGenerator({ mention, open, onOpenChange }) {
  const [selectedTone, setSelectedTone] = useState('crisis');
  const [drafts, setDrafts] = useState({});
  const [editedDraft, setEditedDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const replyTypes = [
    { 
      id: 'crisis', 
      label: 'Crisis Mitigation', 
      desc: 'Move to private channels',
      scenario: 'High Risk/High Emotion (Threat >85)',
      color: 'border-red-500 hover:border-red-400'
    },
    { 
      id: 'correction', 
      label: 'Factual Correction', 
      desc: 'Counter misinformation',
      scenario: 'False Claims/Inaccurate Info',
      color: 'border-orange-500 hover:border-orange-400'
    },
    { 
      id: 'official', 
      label: 'Official Statement', 
      desc: 'Apply approved message',
      scenario: 'Broad Inquiry/Sensitive Topic',
      color: 'border-blue-500 hover:border-blue-400'
    },
    { 
      id: 'boundary', 
      label: 'Boundary Setting', 
      desc: 'Enforce policy/rules',
      scenario: 'Aggressive/Violative Content',
      color: 'border-purple-500 hover:border-purple-400'
    },
    { 
      id: 'amplification', 
      label: 'Positive Amplification', 
      desc: 'Reward and engage',
      scenario: 'Highly Positive/Fan Love',
      color: 'border-green-500 hover:border-green-400'
    }
  ];

  // Generate drafts when dialog opens
  useEffect(() => {
    if (open && mention) {
      const newDrafts = {
        crisis: generateAIReply(mention, 'crisis'),
        correction: generateAIReply(mention, 'correction'),
        official: generateAIReply(mention, 'official'),
        boundary: generateAIReply(mention, 'boundary'),
        amplification: generateAIReply(mention, 'amplification')
      };
      setDrafts(newDrafts);
      setEditedDraft(newDrafts.crisis);
      setSent(false);
      setCopied(false);
    }
  }, [open, mention]);

  useEffect(() => {
    if (drafts[selectedTone]) {
      setEditedDraft(drafts[selectedTone]);
    }
  }, [selectedTone, drafts]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    // Simulate sending reply
    setSent(true);
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  if (!mention) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[85vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Reply Generator
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground mt-1">
                  Generate contextually relevant draft replies using AI
                </Dialog.Description>
              </div>
              <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          </div>

          {/* Original Mention Context */}
          <div className="px-6 py-4 bg-accent/30 border-b border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Original Mention
            </div>
            <div className="flex items-start gap-3">
              <div className="font-medium text-sm">{mention.author || 'Unknown Author'}</div>
              <div className="flex-1">
                <p className="text-sm">{mention.textSnippet}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="capitalize">Sentiment: {mention.aiSentiment}</span>
                  <span>Threat: {mention.aiThreatScore}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Type Selection */}
          <div className="px-6 py-4 border-b border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Select Strategic Reply Type
            </div>
            <div className="grid grid-cols-5 gap-2">
              {replyTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedTone(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedTone === type.id
                      ? `${type.color} bg-accent/20`
                      : `border-border ${type.color.replace('hover:', '')} hover:bg-accent/10`
                  }`}
                >
                  <div className="font-semibold text-xs mb-1">{type.label}</div>
                  <div className="text-[10px] text-muted-foreground mb-2">{type.desc}</div>
                  <div className="text-[9px] text-muted-foreground/70 italic">{type.scenario}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Draft Editor */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 py-3 border-b border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                AI Generated Draft
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-accent rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <textarea
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="w-full h-full bg-background border border-border rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="AI draft will appear here..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Edit the draft as needed before sending
            </div>
            <div className="flex items-center gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSend}
                disabled={sent}
                className={`px-6 py-2 text-sm rounded-md transition-all ${
                  sent
                    ? 'bg-green-600 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {sent ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Reply Sent!
                  </span>
                ) : (
                  'Send Reply'
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
