import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Target, Check, Ban, RotateCcw } from 'lucide-react';

const IMPACT_TONE = {
  High: 'bg-red-500/15 text-red-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  Low: 'bg-blue-500/15 text-blue-400',
};

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
  { key: 'irrelevant', label: 'Irrelevant' },
];

function ActionRow({ action, onSetStatus }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <span className={`inline-block text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full mb-2 ${IMPACT_TONE[action.impact]}`}>
        {action.impact.toUpperCase()} IMPACT
      </span>
      <h4 className="text-sm font-semibold text-white/90 leading-snug mb-1.5">{action.title}</h4>
      {action.reason && <p className="text-xs text-white/50 leading-snug mb-2">{action.reason}</p>}
      {action.metrics ? (
        <div className="space-y-1 mb-2">
          {action.metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between text-xs">
              <span className="text-white/40">{m.label}</span>
              <span className="text-white/80 font-medium">{m.value}</span>
            </div>
          ))}
        </div>
      ) : (
        action.note && <p className="text-xs text-white/40 mb-2">{action.note}</p>
      )}

      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/[0.06]">
        {action.status === 'active' ? (
          <>
            <button
              onClick={() => onSetStatus(action.title, 'done')}
              className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded-md hover:bg-emerald-500/10"
            >
              <Check className="w-3.5 h-3.5" /> Mark Done
            </button>
            <button
              onClick={() => onSetStatus(action.title, 'irrelevant')}
              className="flex items-center gap-1 text-xs font-medium text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.06]"
            >
              <Ban className="w-3.5 h-3.5" /> Mark Irrelevant
            </button>
          </>
        ) : (
          <button
            onClick={() => onSetStatus(action.title, 'active')}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-md hover:bg-blue-500/10"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Mark Active
          </button>
        )}
      </div>
    </div>
  );
}

export default function RecommendedActionsModal({ open, onOpenChange, actions, onSetStatus }) {
  const [tab, setTab] = useState('active');

  const counts = useMemo(() => {
    const c = { active: 0, done: 0, irrelevant: 0 };
    for (const a of actions) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [actions]);

  const visible = actions.filter((a) => a.status === tab);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,600px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
                <Target className="w-3.5 h-3.5 text-white/50" />
                RECOMMENDED ACTIONS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Track and manage every recommended action</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-1.5 px-5 pt-3.5 pb-1 shrink-0">
            {TABS.map((t) => {
              const count = counts[t.key] ?? 0;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                      : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/75 hover:bg-white/[0.06]'
                  }`}
                >
                  {t.label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
            {visible.length > 0 ? (
              visible.map((a) => <ActionRow key={a.title} action={a} onSetStatus={onSetStatus} />)
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No {tab} actions.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
