import { useState } from 'react';
import { Bot, Settings, Mic, Send, ThumbsUp, ThumbsDown, Copy, TrendingUp, Hash, Instagram, Youtube, Film, MessageSquare, ArrowRight, Calendar, GitCompare, Share2, Bell, User } from 'lucide-react';
import { CARD, PAGE_BG } from '../theme';
import { initialMessages, liveInsights, recommendedActions, quickPrompts, tryPrompts } from './aiProducerData';

const BULLET_ICONS = { youtube: Youtube, x: MessageSquare, instagram: Instagram, trend: TrendingUp, hashtag: Hash, clip: Film };
const IMPACT_TONE = { High: 'bg-emerald-500/15 text-emerald-400', Medium: 'bg-amber-500/15 text-amber-400' };

function AIBubble({ msg }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className={`${CARD} p-4 max-w-2xl`}>
        {msg.lines?.map((l) => (
          <p key={l} className="text-sm text-white/80 mb-2 last:mb-0">{l}</p>
        ))}
        {msg.bullets && (
          <div className="space-y-2 my-3">
            {msg.bullets.map((b) => {
              const Icon = BULLET_ICONS[b.iconKey] ?? MessageSquare;
              return (
                <div key={b.text} className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-white/50 shrink-0" />
                  <span className="text-sm text-white/75">{b.text}</span>
                </div>
              );
            })}
          </div>
        )}
        {msg.numbered && (
          <div className="space-y-2 my-3">
            {msg.numbered.map((n, i) => (
              <div key={n} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-white/75">{n}</span>
              </div>
            ))}
          </div>
        )}
        {msg.checklist && (
          <div className="space-y-2 my-3">
            {msg.checklist.map((c) => (
              <div key={c} className="flex items-start gap-2.5">
                <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-white/75">{c}</span>
              </div>
            ))}
          </div>
        )}
        {msg.footer && <p className="text-sm text-white/80 mt-1">{msg.footer}</p>}
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

export default function AIProducerSection() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  function send(text) {
    const value = text ?? input;
    if (!value.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { role: 'user', time, text: value },
      {
        role: 'ai',
        time,
        lines: ["This is a UI preview — I'm not wired up to live data yet, but here's how a response would look."],
        footer: 'Once connected, I\'ll pull real answers from your movie\'s live dashboard data.',
        showFeedback: true,
      },
    ]);
    setInput('');
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="px-8 pt-6 pb-4 border-b border-white/[0.07] flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white leading-none">AI Producer</h1>
            <span className="text-[11px] font-bold tracking-wide px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">BETA</span>
          </div>
          <p className="text-sm text-white/40 mt-1">Your AI co-pilot for smarter, faster decisions.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <Calendar className="w-4 h-4" />
            May 1 – May 15, 2025
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <GitCompare className="w-4 h-4" />
            Compare
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 hover:bg-white/[0.08] transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/10 text-white/70">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 p-6">
          <div className={`${CARD} p-4 flex items-center justify-between mb-4`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">AI Producer</div>
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

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, i) =>
              msg.role === 'ai' ? (
                <AIBubble
                  key={i}
                  msg={{ ...msg, showFeedback: msg.showFeedback ?? (i === messages.length - 1 && messages.length > initialMessages.length) }}
                />
              ) : (
                <UserBubble key={i} msg={msg} />
              )
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ask anything about your movie launch..."
              />
              <button className="w-11 h-11 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 shrink-0">
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={() => send()} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shrink-0">
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
                  className="text-xs text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-full bg-blue-500/10 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-96 shrink-0 border-l border-white/[0.07] p-6 space-y-4 overflow-y-auto">
          <div className={`${CARD} p-4`}>
            <h3 className="text-sm font-semibold text-white/90 tracking-wide mb-3">LIVE INSIGHTS</h3>
            <div className="space-y-3.5">
              {liveInsights.map((ins) => {
                const Icon = BULLET_ICONS[ins.iconKey] ?? TrendingUp;
                return (
                  <div key={ins.text} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white/80 leading-snug">{ins.text}</div>
                      <div className="text-[11px] text-white/35">{ins.caption}</div>
                    </div>
                    <span className="text-[10px] text-white/25 shrink-0">{ins.time}</span>
                  </div>
                );
              })}
            </div>
            <button className="mt-3 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all insights <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`${CARD} p-4`}>
            <h3 className="text-sm font-semibold text-white/90 tracking-wide mb-3">RECOMMENDED ACTIONS</h3>
            <div className="space-y-3">
              {recommendedActions.map((a) => {
                const Icon = BULLET_ICONS[a.iconKey] ?? MessageSquare;
                return (
                  <div key={a.text} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-white/50 shrink-0" />
                      <span className="text-sm text-white/75 truncate">{a.text}</span>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${IMPACT_TONE[a.impact]}`}>{a.impact} Impact</span>
                  </div>
                );
              })}
            </div>
            <button className="mt-3 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all actions <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`${CARD} p-4`}>
            <h3 className="text-sm font-semibold text-white/90 tracking-wide mb-3">QUICK PROMPTS</h3>
            <div className="space-y-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05] text-sm text-white/70 transition-colors text-left"
                >
                  {p}
                  <ArrowRight className="w-3.5 h-3.5 text-white/25 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
