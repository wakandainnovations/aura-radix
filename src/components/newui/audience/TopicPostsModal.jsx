import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MessagesSquare, Pencil, Loader2 } from 'lucide-react';
import { dashboardService } from '../../../api/dashboardService';
import { mentionActionService } from '../../../api/mentionActionService';
import { useLicense } from '../../../hooks/useLicense';
import { formatImpressions } from '../../../utils/helpers';
import { PLATFORM_COLOR } from '../theme';
import { platformLabel } from './useConversationsData';
import ErrorState from '../shared/ErrorState';

const SENTIMENT_TONE = {
  POSITIVE: 'text-emerald-400 bg-emerald-500/15',
  NEUTRAL: 'text-white/50 bg-white/[0.06]',
  NEGATIVE: 'text-red-400 bg-red-500/15',
};

// Mirrors the canonical topicCategory buckets shown on the "Topics of
// Discussion" panel (see TOPIC_CATEGORY_LABELS in useInfluencersData.js).
// Unlike ReviewAspectCategory this isn't a validated backend enum - any
// non-blank string is accepted (README 26f) - but offering the same fixed
// set the breakdown already groups by keeps corrections consistent with
// what the panel can actually display.
const TOPIC_OPTIONS = [
  { value: 'cast_performance', label: 'Cast performance' },
  { value: 'music_songs', label: 'Music / songs' },
  { value: 'story_screenplay', label: 'Story / screenplay' },
  { value: 'direction_technical_craft', label: 'Direction / technical craft' },
  { value: 'box_office_commercial', label: 'Box office / commercial' },
  { value: 'politics_personal_life_crossover', label: 'Politics / personal-life crossover' },
  { value: 'general', label: 'General / unspecified' },
];

function topicLabel(value) {
  return TOPIC_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatPostTime(instant) {
  if (!instant) return '';
  try {
    return new Date(instant).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

// One classified post, with an inline "fix classification" affordance for
// admins - the backend pairs this filter (README 16) with the override
// endpoint (README 26f) as the intended spot-check-then-correct workflow.
// `defaultCategory` seeds the picker with the bucket's primary raw category
// (the mention's own topicCategory isn't part of MentionResponse), so a
// multi-raw-category bucket still opens on a sensible starting value.
function MentionRow({ mention, entityId, defaultCategory }) {
  const queryClient = useQueryClient();
  const { isAdmin } = useLicense();
  const [editing, setEditing] = useState(false);
  const [newCategory, setNewCategory] = useState(defaultCategory ?? TOPIC_OPTIONS[0].value);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [corrected, setCorrected] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await mentionActionService.overrideTopicCategory(mention.id, {
        category: newCategory,
        reason: reason.trim() || undefined,
      });
      setCorrected(result);
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['topic-category-breakdown', entityId] });
    } catch (err) {
      setError(err?.message || 'Failed to save correction');
    } finally {
      setSaving(false);
    }
  };

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

      {corrected ? (
        <p className="text-[11px] text-emerald-400 mt-2">Recategorized to {topicLabel(corrected.newCategory)}</p>
      ) : !isAdmin ? null : editing ? (
        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {TOPIC_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is the current classification wrong? (optional)"
            className="w-full px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors disabled:opacity-40"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Save correction
            </button>
            <button
              onClick={() => { setEditing(false); setError(''); }}
              disabled={saving}
              className="px-2.5 py-1 text-[11px] text-white/40 hover:text-white/70 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-2 flex items-center gap-1 text-[11px] text-white/35 hover:text-blue-400 transition-colors">
          <Pencil className="w-3 h-3" />
          Wrong classification? Fix it
        </button>
      )}
    </div>
  );
}

// Drill-down for the "Topics of Discussion" panel - clicking a slice (e.g.
// "Cast performance") opens the actual posts the backend classified into it
// via GET /dashboard/{entityId}/mentions?topicCategory=... (README 16), with
// an admin-only inline fix (README 26f) for anything misclassified.
//
// A display bucket can fold several raw topicCategory values into one slice
// (e.g. "General / unspecified" absorbs every long-tail value the classifier
// emits outside the six documented buckets - see useInfluencersData.js), so
// `rawCategories` may hold more than one value; each is fetched separately
// (the filter only accepts one value per call) and merged/sorted client-side.
export default function TopicPostsModal({ open, onOpenChange, entityId, rawCategories = [], label }) {
  // Seeds each row's correction picker with the bucket's primary raw
  // category when it's one of the canonical TOPIC_OPTIONS; long-tail values
  // folded into "General / unspecified" fall back to that bucket instead of
  // an option the dropdown doesn't actually offer.
  const defaultCategory = TOPIC_OPTIONS.some((o) => o.value === rawCategories[0]) ? rawCategories[0] : 'general';

  const { data: mentions = [], isLoading, isError, error } = useQuery({
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
            ) : isError ? (
              <ErrorState error={error} />
            ) : mentions.length > 0 ? (
              mentions.map((m) => <MentionRow key={m.id} mention={m} entityId={entityId} defaultCategory={defaultCategory} />)
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No posts found for this topic yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
