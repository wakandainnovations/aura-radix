import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, ExternalLink, TrendingUp, Eye, Check, Ban, ArrowRight } from 'lucide-react';
import { CARD } from '../theme';
import { dashboardService } from '../../../api/dashboardService';
import RecommendedActionsModal from './RecommendedActionsModal';
import { RelatedUsersPreview } from './RelatedUsers';

// This panel's lowercase status vocabulary onto the backend's
// RecommendedActionItem.status (ACTIVE|DONE|IRRELEVANT).
const UI_STATUS_TO_ACTION_STATUS = { active: 'ACTIVE', done: 'DONE', irrelevant: 'IRRELEVANT' };

const IMPACT_TONE = {
  High: 'bg-red-500/15 text-red-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  Low: 'bg-blue-500/15 text-blue-400',
};

const ICONS = { external: ExternalLink, trending: TrendingUp, eye: Eye };

function ActionCard({ action, onMarkDone, onMarkIrrelevant, onOpenItem, pending }) {
  const CornerIcon = ICONS[action.icon] ?? ExternalLink;
  return (
    <div className={`${CARD} p-4 flex flex-col`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full shrink-0 ${IMPACT_TONE[action.impact]}`}>
          {action.impact.toUpperCase()} IMPACT
        </span>
        <button
          type="button"
          onClick={onOpenItem}
          className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 shrink-0 hover:bg-white/[0.12] hover:text-white/80 transition-colors"
          aria-label={`Open details for ${action.title}`}
        >
          <CornerIcon className="w-3.5 h-3.5" />
        </button>
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
          disabled={pending}
          className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded-md hover:bg-emerald-500/10 disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" /> Done
        </button>
        <button
          onClick={onMarkIrrelevant}
          disabled={pending}
          className="flex items-center gap-1 text-xs font-medium text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.06] disabled:opacity-50"
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
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [focusTitle, setFocusTitle] = useState(null);

  const statusMutation = useMutation({
    mutationFn: ({ candidateId, status }) =>
      dashboardService.updateRecommendedActionStatus(entityId, candidateId, UI_STATUS_TO_ACTION_STATUS[status]),
    onSuccess: () => {
      // Query key also carries a movieSwitchNonce and a page-scope tag this
      // component doesn't have; a partial key still matches by prefix.
      queryClient.invalidateQueries({ queryKey: ['recommended-actions', entityId] });
    },
  });

  // Dummy fallback actions (no real backend candidate yet) have no
  // candidateId — there's nothing to persist a status change against.
  function handleSetStatus(action, status) {
    if (action.candidateId == null) return;
    statusMutation.mutate({ candidateId: action.candidateId, status });
  }

  const withStatus = actions.map((a) => ({ ...a, status: a.status ?? 'active' }));
  const activeActions = withStatus.filter((a) => a.status === 'active');

  const openItemDetail = (title) => {
    setFocusTitle(title);
    setModalOpen(true);
  };

  const handleModalOpenChange = (isOpen) => {
    setModalOpen(isOpen);
    if (!isOpen) setFocusTitle(null);
  };

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-white/40" />
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">RECOMMENDED ACTIONS</h3>
        </div>
        {!isLoading && (
          <button
            onClick={() => {
              setFocusTitle(null);
              setModalOpen(true);
            }}
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
              key={a.candidateId ?? a.title}
              action={a}
              onMarkDone={() => handleSetStatus(a, 'done')}
              onMarkIrrelevant={() => handleSetStatus(a, 'irrelevant')}
              onOpenItem={() => openItemDetail(a.title)}
              pending={
                statusMutation.isPending && statusMutation.variables?.candidateId === a.candidateId
              }
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
          onOpenChange={handleModalOpenChange}
          actions={withStatus}
          onSetStatus={handleSetStatus}
          highlightTitle={focusTitle}
        />
      )}
    </div>
  );
}
