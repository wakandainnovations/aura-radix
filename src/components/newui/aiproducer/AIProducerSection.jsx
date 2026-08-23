import { useEffect, useRef, useState } from 'react';
import { Bot, Settings, Mic, Send, ThumbsUp, ThumbsDown, Copy, Bell, User, Sparkles } from 'lucide-react';
import { CARD, PAGE_BG } from '../theme';
import { tryPrompts } from './aiProducerData';
import { movieQueryService } from '../../../api/movieQueryService';

function AIBubble({ msg }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className={`${CARD} p-4 max-w-2xl ${msg.isError ? 'border-red-500/30 bg-red-500/10' : ''}`}>
        {msg.lines?.map((l) => (
          <p key={l} className={`text-sm mb-2 last:mb-0 ${msg.isError ? 'text-red-400' : 'text-white/80'}`}>{l}</p>
        ))}
        <div className="text-[11px] text-white/30 mt-2">{msg.time}</div>
        {msg.showFeedback && (
          <div className="flex items-center gap-3 mt-2 text-white/30">
            <ThumbsUp className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
            <ThumbsDown className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
            <Copy className="w-3.5 h-3.5 cursor-pointer hover:text-white/60" />
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ msg }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-blue-600 rounded-2xl px-4 py-2.5 max-w-md">
        <p className="text-sm text-white">{msg.text}</p>
        <div className="text-[11px] text-white/60 mt-1 text-right">{msg.time}</div>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold shrink-0">M</div>
    </div>
  );
}

export default function AIProducerSection({
  selectedMovie,
  chatMessages,
  onChatMessagesChange,
  chatConversationId,
  onChatConversationIdChange,
}) {
  const messages = chatMessages;
  const setMessages = onChatMessagesChange;
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const entityId = selectedMovie?.id;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  async function send(text) {
    const value = (text ?? input).trim();
    if (!value || isSending || !entityId) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', time: timeNow(), text: value }]);
    setIsSending(true);
    try {
      const response = await movieQueryService.ask(entityId, value, chatConversationId);
      if (response?.conversationId) {
        onChatConversationIdChange(response.conversationId);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          time: timeNow(),
          lines: [response?.answer || "I couldn't find an answer to that."],
          showFeedback: true,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          time: timeNow(),
          lines: [err?.message || 'Something went wrong answering that question.'],
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="px-8 pt-6 pb-4 border-b border-white/[0.07] flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white leading-none">AI Copilot</h1>
            <span className="text-[11px] font-bold tracking-wide px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">BETA</span>
          </div>
          <p className="text-sm text-white/40 mt-1">Your AI co-pilot for smarter, faster decisions.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-6">
        <div className={`${CARD} p-4 flex items-center justify-between mb-4`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">AI Copilot</div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70">
            <Settings className="w-3.5 h-3.5" />
            View AI Settings
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && !isSending && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-12">
              <div className="w-11 h-11 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-white/80">Ask me anything about {selectedMovie?.title || 'your movie'}&rsquo;s launch</div>
                <div className="text-xs text-white/40 mt-1">Your conversation stays here for the rest of this session.</div>
              </div>
            </div>
          )}
          {messages.map((msg, i) =>
            msg.role === 'ai' ? <AIBubble key={i} msg={msg} /> : <UserBubble key={i} msg={msg} />
          )}
          {isSending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className={`${CARD} px-4 py-2.5 text-sm text-white/40`}>Thinking…</div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={isSending || !entityId}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Ask anything about your movie launch..."
            />
            <button className="w-11 h-11 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 shrink-0">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => send()}
              disabled={isSending || !input.trim() || !entityId}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2.5">
            <span className="text-xs text-white/30 shrink-0">Try:</span>
            {tryPrompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={isSending || !entityId}
                className="text-xs text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-full bg-blue-500/10 transition-colors disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
