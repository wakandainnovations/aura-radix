import { useQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MessagesSquare } from 'lucide-react';
import { dashboardService } from '../../../api/dashboardService';
import { formatImpressions } from '../../../utils/helpers';
import { PLATFORM_COLOR } from '../theme';
import { platformLabel } from './useConversationsData';

const SENTIMENT_TONE = {
  POSITIVE: 'text-emerald-400 bg-emerald-500/15',
  NEUTRAL: 'text-white/50 bg-white/[0.06]',
  NEGATIVE: 'text-red-400 bg-red-500/15',
};

function formatPostTime(instant) {
  if (!instant) return '';
  try {
    return new Date(instant).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function MentionRow({ mention }) {
  const sentiment = (mention.sentiment || '').toUpperCase();
  const impressions = formatImpressions(mention.impressions);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span
          className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${PLATFORM_COLOR[platformLabel(mention.platform)]}22`, color: PLATFORM_COLOR[platformLabel(mention.platform)] }}
        >
          {platformLabel(mention.platform)}
        </span>
        {sentiment && <span className={`text-[11px] px-2 py-0.5 rounded-full ${SENTIMENT_TONE[sentiment] ?? SENTIMENT_TONE.NEUTRAL}`}>{sentiment}</span>}
        <span className="text-xs text-white/50">@{mention.author || 'Anonymous'}</span>
        <span className="text-[11px] text-white/30">{formatPostTime(mention.postDate)}</span>
        {impressions && <span className="text-[11px] text-white/30 ml-auto">{impressions} impressions</span>}
      </div>
      {mention.permalink ? (
        <a href={mention.permalink} target="_blank" rel="noopener noreferrer" className="block text-sm text-white/80 hover:text-white hover:underline">
          {mention.content}
        </a>
      ) : (
        <p className="text-sm text-white/80">{mention.content}</p>
      )}
    </div>
  );
}

// Drill-down for the "Topics of Discussion" panel - clicking a slice (e.g.
// "Cast performance") opens the actual posts the backend classified into it
// via GET /dashboard/{entityId}/mentions?topicCategory=... (README 16).
// Unlike the Conversation Drivers panel's reviewAspectCategory drill-down,
// there's no correction endpoint here: topicCategory is populated upstream
// and README 26e is explicit that only reviewAspectCategory can be overridden
// from this codebase, so this view is read-only.
//
// A display bucket can fold several raw topicCategory values into one slice
// (e.g. "General / unspecified" absorbs every long-tail value the classifier
// emits outside the six documented buckets - see useInfluencersData.js), so
// `rawCategories` may hold more than one value; each is fetched separately
// (the filter only accepts one value per call) and merged/sorted client-side.
export default function TopicPostsModal({ open, onOpenChange, entityId, rawCategories = [], label }) {
  const { data: mentions = [], isLoading } = useQuery({
    queryKey: ['mentions', entityId, 'topicCategory', rawCategories.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        rawCategories.map((topicCategory) => dashboardService.getMentions(entityId, { topicCategory, size: 20 }))
      );
      const byId = new Map();
      for (const result of results) {
        for (const m of result?.content ?? []) byId.set(m.id, m);
      }
      return [...byId.values()].sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    },
    enabled: open && entityId != null && rawCategories.length > 0,
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,680px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
                <MessagesSquare className="w-3.5 h-3.5 text-blue-400" />
                {(label ?? 'TOPIC').toUpperCase()} POSTS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">
                Every post classified into this topic, latest first
                {rawCategories.length > 1 && ` · grouped from ${rawCategories.length} sub-topics`}
              </p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
            {isLoading ? (
              <p className="text-sm text-white/40 text-center py-8">Loading posts…</p>
            ) : mentions.length > 0 ? (
              mentions.map((m) => <MentionRow key={m.id} mention={m} />)
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No posts found for this topic yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
