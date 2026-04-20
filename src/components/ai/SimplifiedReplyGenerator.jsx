import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, Copy } from 'lucide-react';

export default function SimplifiedReplyGenerator({ mention, open, onOpenChange }) {
  const [finalDraft, setFinalDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setFinalDraft('');
      setSent(false);
      setCopied(false);
    }
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  if (!mention) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl max-h-[80vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                  Quick Reply
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground mt-1">
                  Respond to {mention.author || 'Unknown Author'} • {mention.platform}
                </Dialog.Description>
              </div>
              <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          </div>

          {/* Original Mention */}
          <div className="px-5 py-3 bg-accent/20 border-b border-border">
            <div className="text-xs text-muted-foreground mb-1">Original Post</div>
            <p className="text-sm line-clamp-2">{mention.textSnippet}</p>
          </div>

          {/* Reply Editor - Manual Mode Only */}
          <div className="flex-1 overflow-hidden flex flex-col p-5">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Your Reply
              </div>
              <textarea
                value={finalDraft}
                onChange={(e) => setFinalDraft(e.target.value)}
                className="w-full flex-1 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your reply..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-border flex items-center justify-between">
            <button
              onClick={handleCopy}
              disabled={!finalDraft}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <div className="flex items-center gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSend}
                disabled={sent || !finalDraft}
                className={`px-6 py-2 text-sm rounded-md transition-all font-medium disabled:opacity-50 ${
                  sent
                    ? 'bg-green-600 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {sent ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Sent!
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

