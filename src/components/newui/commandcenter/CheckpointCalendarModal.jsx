import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronLeft, ChevronRight, CalendarDays, Flag } from 'lucide-react';
import { todayDateStr } from '../dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildMonthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CheckpointCalendarModal({ open, onOpenChange, checkpoints = [] }) {
  const [viewDate, setViewDate] = useState(() => new Date());

  // Jumps to whichever month actually has checkpoints (nearest upcoming one,
  // or the most recent past one if all checkpoints are behind us) each time
  // the modal is opened, so the user isn't dropped on an empty current month.
  useEffect(() => {
    if (!open) return;
    const dated = checkpoints.filter((c) => c.checkpointDate).sort((a, b) => a.checkpointDate.localeCompare(b.checkpointDate));
    if (dated.length === 0) {
      setViewDate(new Date());
      return;
    }
    const today = todayDateStr();
    const target = dated.find((c) => c.checkpointDate >= today) ?? dated[dated.length - 1];
    setViewDate(new Date(`${target.checkpointDate}T00:00:00`));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const cp of checkpoints) {
      if (!cp.checkpointDate) continue;
      const list = map.get(cp.checkpointDate) ?? [];
      list.push(cp);
      map.set(cp.checkpointDate, list);
    }
    return map;
  }, [checkpoints]);

  const monthCheckpoints = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return checkpoints
      .filter((c) => c.checkpointDate?.startsWith(prefix))
      .sort((a, b) => a.checkpointDate.localeCompare(b.checkpointDate));
  }, [checkpoints, year, month]);

  function shiftMonth(delta) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,540px)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0b0e19] shadow-2xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/[0.06] shrink-0">
            <Dialog.Title className="flex items-center gap-1.5 text-sm font-semibold text-white/90 tracking-wide">
              <CalendarDays className="w-3.5 h-3.5 text-white/50" />
              CHECKPOINT CALENDAR
            </Dialog.Title>
            <Dialog.Close className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-semibold text-white/80">{monthLabel(viewDate)}</div>
              <button
                onClick={() => shiftMonth(1)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-white/[0.06]">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="text-[11px] text-white/35 text-center px-1 py-1.5 border-r border-b border-white/[0.06]"
                >
                  {wd}
                </div>
              ))}
              {cells.map((day, i) => {
                const key = day ? dateKey(year, month, day) : `blank-${i}`;
                const dayCheckpoints = day ? byDate.get(dateKey(year, month, day)) : null;
                return (
                  <div
                    key={key}
                    className="border-r border-b border-white/[0.06] px-1.5 py-1.5 text-[11px] text-white/40 min-h-[54px]"
                    title={dayCheckpoints?.map((c) => c.description).join(', ')}
                  >
                    {day && <div className="text-white/50">{day}</div>}
                    {dayCheckpoints?.map((c) => (
                      <div
                        key={c.id}
                        className="mt-1 flex items-center gap-1 px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] truncate"
                      >
                        <Flag className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{c.description}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <div className="text-xs font-medium text-white/40 mb-2">Checkpoints this month</div>
              {monthCheckpoints.length > 0 ? (
                <div className="space-y-1.5">
                  {monthCheckpoints.map((c) => (
                    <div key={c.id} className="flex items-center gap-2.5 text-sm">
                      <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-white/50 shrink-0">{c.checkpointDate}</span>
                      <span className="text-white/80 truncate">{c.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/35">No checkpoints this month.</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
