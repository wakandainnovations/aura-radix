import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText } from 'lucide-react';
import { thClass, tdClass, trClass, PLATFORM_COLOR } from '../theme';
import SortableTh from '../shared/SortableTh';
import InfluencerName from '../shared/InfluencerName';
import { useSortableRows } from '../../shared/SortableTable';

const SORT_ACCESSORS = {
  reach: (row) => row.reachValue,
  engRate: (row) => row.engRateValue,
};

const SENTIMENT_TONE = { Positive: 'text-emerald-400 bg-emerald-500/15', Neutral: 'text-white/50 bg-white/[0.06]', Negative: 'text-red-400 bg-red-500/15' };

export default function AllInfluencerContentModal({ open, onOpenChange, data = [] }) {
  const { rows, sortState, requestSort } = useSortableRows(data, { key: 'reach', dir: 'desc' }, SORT_ACCESSORS);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,820px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                ALL INFLUENCER CONTENT
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Every post from top spreaders about this movie, sorted by reach</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {rows.length > 0 ? (
              <table className="w-full table-fixed">
                <thead className="sticky top-0 bg-[#0b0e19]">
                  <tr>
                    <th className={`${thClass} w-[32%]`}>Content</th>
                    <th className={`${thClass} w-[18%]`}>Influencer</th>
                    <th className={`${thClass} w-[13%]`}>Platform</th>
                    <SortableTh label="Reach" sortKey="reach" sortState={sortState} onSort={requestSort} align="right" />
                    <SortableTh label="Eng. Rate" sortKey="engRate" sortState={sortState} onSort={requestSort} align="right" />
                    <th className={`${thClass} text-right w-[12%]`}>Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} className={trClass}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shrink-0" />
                          <div className="min-w-0">
                            {c.permalink ? (
                              <a href={c.permalink} target="_blank" rel="noopener noreferrer" className="block text-white/85 truncate hover:underline hover:text-white">
                                {c.title}
                              </a>
                            ) : (
                              <div className="text-white/85 truncate">{c.title}</div>
                            )}
                            <div className="text-[11px] text-white/35">{c.date}</div>
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <InfluencerName name={c.influencer} url={c.profileUrl} className="text-white/60" />
                      </td>
                      <td className={tdClass}>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLOR[c.platform]}22`, color: PLATFORM_COLOR[c.platform] }}>
                          {c.platform}
                        </span>
                      </td>
                      <td className={`${tdClass} text-right text-white/60`}>{c.reach}</td>
                      <td className={`${tdClass} text-right text-white/60`}>{c.engRate}</td>
                      <td className={`${tdClass} text-right`}>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${SENTIMENT_TONE[c.sentiment]}`}>{c.sentiment}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No influencer content found for this movie yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
