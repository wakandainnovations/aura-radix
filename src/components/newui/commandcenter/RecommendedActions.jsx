import { useState } from 'react';
import { Target, ExternalLink, TrendingUp, Eye, Check, Ban, ArrowRight } from 'lucide-react';
import { CARD } from '../theme';
import useActionStatuses from './useActionStatuses';
import RecommendedActionsModal from './RecommendedActionsModal';
import { RelatedUsersPreview } from './RelatedUsers';

const IMPACT_TONE = {
  High: 'bg-red-500/15 text-red-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  Low: 'bg-blue-500/15 text-blue-400',
};

const ICONS = { external: ExternalLink, trending: TrendingUp, eye: Eye };

function ActionCard({ action, onMarkDone, onMarkIrrelevant }) {
  const CornerIcon = ICONS[action.icon] ?? ExternalLink;
  return (
    <div className={`${CARD} p-4 flex flex-col`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full shrink-0 ${IMPACT_TONE[action.impact]}`}>
          {action.impact.toUpperCase()} IMPACT
        </span>
        <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 shrink-0">
          <CornerIcon className="w-3.5 h-3.5" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white/90 leading-snug mb-3">{action.title}</h4>

      {action.reason && <p className="text-xs text-white/50 leading-snug mb-3">{action.reason}</p>}

      <RelatedUsersPreview users={action.relatedUsers} />

      <div className="space-y-1.5 flex-1">
        {action.metrics ? (
          action.metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between text-xs">
              <span className="text-white/40">{m.label}</span>
              <span className="text-white/85 font-medium">{m.value}</span>
            </div>
          ))
        ) : (
          !action.reason && <p className="text-xs text-white/40">{action.note}</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 pt-3 border-t border-white/[0.06]">
        <button
          onClick={onMarkDone}
          className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded-md hover:bg-emerald-500/10"
        >
          <Check className="w-3.5 h-3.5" /> Done
        </button>
        <button
          onClick={onMarkIrrelevant}
          className="flex items-center gap-1 text-xs font-medium text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.06]"
        >
          <Ban className="w-3.5 h-3.5" /> Irrelevant
        </button>
      </div>
    </div>
  );
}

function ActionCardSkeleton() {
  return (
    <div className={`${CARD} p-4 flex flex-col animate-pulse`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-4 w-20 rounded-full bg-white/10" />
        <div className="w-7 h-7 rounded-full bg-white/[0.06]" />
      </div>
      <div className="h-3.5 bg-white/10 rounded w-5/6 mb-3" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function RecommendedActions({ actions, isLoading = false, entityId }) {
  const [statuses, setStatus] = useActionStatuses(entityId);
  const [modalOpen, setModalOpen] = useState(false);

  const withStatus = actions.map((a) => ({ ...a, status: statuses[a.title] ?? 'active' }));
  const activeActions = withStatus.filter((a) => a.status === 'active');

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-white/40" />
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">RECOMMENDED ACTIONS</h3>
        </div>
        {!isLoading && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0"
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        role={isLoading ? 'status' : undefined}
        aria-label={isLoading ? 'Loading recommended actions' : undefined}
      >
        {isLoading ? (
          [0, 1, 2].map((i) => <ActionCardSkeleton key={i} />)
        ) : activeActions.length > 0 ? (
          activeActions.map((a) => (
            <ActionCard
              key={a.title}
              action={a}
              onMarkDone={() => setStatus(a.title, 'done')}
              onMarkIrrelevant={() => setStatus(a.title, 'irrelevant')}
            />
          ))
        ) : (
          <p className="col-span-full text-sm text-white/40 text-center py-6">
            No active actions right now — check View Details for done/irrelevant history.
          </p>
        )}
      </div>

      {!isLoading && (
        <RecommendedActionsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          actions={withStatus}
          onSetStatus={setStatus}
        />
      )}
    </div>
  );
}
