import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { CARD } from '../theme';

export default function AskFramehouseBar({ movieTitle, suggestions, onAsk }) {
  const [input, setInput] = useState('');

  function submit(text) {
    const value = text ?? input;
    if (!value.trim()) return;
    onAsk?.(value);
    setInput('');
  }

  return (
    <div className={`${CARD} p-3`}>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
          placeholder={`Ask anything about ${movieTitle}...`}
        />
        <button
          onClick={() => submit()}
          className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shrink-0 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
        <div className="hidden lg:flex items-center gap-2 shrink-0 overflow-x-auto max-w-md">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="text-xs text-white/60 hover:text-white/90 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
