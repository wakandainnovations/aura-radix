import * as Dialog from '@radix-ui/react-dialog';
import { X, Users } from 'lucide-react';
import { thClass, tdClass, trClass, PLATFORM_COLOR } from '../theme';
import SortableTh from '../shared/SortableTh';
import InfluencerName from '../shared/InfluencerName';
import { useSortableRows } from '../../shared/SortableTable';

const SORT_ACCESSORS = {
  views: (row) => row.viewsValue,
  engRate: (row) => row.engRateValue,
  impact: (row) => row.impact,
};

export default function AllInfluencersModal({ open, onOpenChange, data = [] }) {
  const { rows, sortState, requestSort } = useSortableRows(data, { key: 'views', dir: 'desc' }, SORT_ACCESSORS);

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
                <Users className="w-3.5 h-3.5 text-blue-400" />
                ALL INFLUENCERS
              </Dialog.Title>
              <p className="text-xs text-white/40 mt-1">Every top spreader for this movie, sorted by views</p>
            </div>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {rows.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-[#0b0e19]">
                  <tr>
                    <th className={thClass}>#</th>
                    <th className={thClass}>Influencer</th>
                    <th className={thClass}>Platform</th>
                    <SortableTh label="Views" sortKey="views" sortState={sortState} onSort={requestSort} align="right" />
                    <SortableTh label="Eng. Rate" sortKey="engRate" sortState={sortState} onSort={requestSort} align="right" />
                    <SortableTh label="Impact" sortKey="impact" sortState={sortState} onSort={requestSort} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((inf, i) => (
                    <tr key={inf.rank} className={trClass}>
                      <td className={tdClass}>{i + 1}</td>
                      <td className={tdClass}>
                        <div className="min-w-0">
                          <InfluencerName name={inf.name} url={inf.profileUrl} className="block text-sm text-white/85" />
                          <div className="text-[11px] text-white/35 truncate">{inf.handle}</div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLOR[inf.platform]}22`, color: PLATFORM_COLOR[inf.platform] }}>
                          {inf.platform}
                        </span>
                      </td>
                      <td className={`${tdClass} text-right text-white/60`}>{inf.views}</td>
                      <td className={`${tdClass} text-right text-white/60`}>{inf.engRate}</td>
                      <td className={`${tdClass} text-right text-white/70`}>{inf.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-white/40 text-center py-8">No influencers found for this movie yet.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
