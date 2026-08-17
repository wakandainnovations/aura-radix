import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Bot, Send } from 'lucide-react';
import { movieQueryService } from '../../../api/movieQueryService';

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function AIBubble({ text, time, isError }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-md border ${
          isError ? 'border-red-500/30 bg-red-500/10' : 'border-white/[0.08] bg-white/[0.04]'
        }`}
      >
        <p className={`text-sm whitespace-pre-wrap ${isError ? 'text-red-400' : 'text-white/80'}`}>{text}</p>
        {time && <div className="text-[11px] text-white/30 mt-1">{time}</div>}
      </div>
    </div>
  );
}

function UserBubble({ text, time }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-blue-600 rounded-2xl px-4 py-2.5 max-w-md">
        <p className="text-sm text-white whitespace-pre-wrap">{text}</p>
        {time && <div className="text-[11px] text-white/60 mt-1 text-right">{time}</div>}
      </div>
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold shrink-0">
        M
      </div>
    </div>
  );
}

export default function MovieQueryChatModal({ open, onOpenChange, entityId, movieTitle, initialPrompt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const askedInitialRef = useRef(null);
  const conversationRef = useRef(null);

  async function send(text) {
    const value = (text ?? input).trim();
    if (!value || isSending || !entityId) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: value, time: timeNow() }]);
    setIsSending(true);
    try {
      const response = await movieQueryService.ask(entityId, value, conversationRef.current);
      if (response?.conversationId) {
        conversationRef.current = response.conversationId;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: response?.answer || "I couldn't find an answer to that.", time: timeNow() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: err?.message || 'Something went wrong answering that question.', time: timeNow(), isError: true },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!open) {
      askedInitialRef.current = null;
      return;
    }
    if (initialPrompt && askedInitialRef.current !== initialPrompt) {
      askedInitialRef.current = initialPrompt;
      conversationRef.current = null;
      setMessages([]);
      send(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  function handleOpenChange(next) {
    if (!next) {
      setMessages([]);
      setInput('');
      conversationRef.current = null;
    }
    onOpenChange(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] h-[min(80vh,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none flex flex-col"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between gap-3 p-4 pb-3 border-b border-white/[0.06] shrink-0">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold text-white/90 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="truncate">Ask about {movieTitle}</span>
            </Dialog.Title>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) =>
              msg.role === 'ai' ? (
                <AIBubble key={i} text={msg.text} time={msg.time} isError={msg.isError} />
              ) : (
                <UserBubble key={i} text={msg.text} time={msg.time} />
              )
            )}
            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 border border-white/[0.08] bg-white/[0.04] text-sm text-white/40">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="p-4 pt-3 border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                disabled={isSending}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 min-w-0"
                placeholder={`Continue asking about ${movieTitle}...`}
              />
              <button
                onClick={() => send()}
                disabled={isSending || !input.trim()}
                className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shrink-0 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
