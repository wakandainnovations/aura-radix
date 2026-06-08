import React, { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown, HelpCircle } from 'lucide-react';

// Shared click-to-sort table primitives, used across every tabular view so
// sorting behaves identically everywhere (default sort, asc/desc toggle, nulls
// last, numeric-aware string compare) and column header tooltips keep working.

// Compare two values for sorting. Nulls/blank always sort last regardless of
// direction; strings compare with numeric awareness ("2" < "10"); booleans put
// true first; everything else compares numerically.
function compareValues(av, bv, dir) {
  const an = av == null || av === '';
  const bn = bv == null || bv === '';
  if (an || bn) return an === bn ? 0 : an ? 1 : -1;
  let cmp;
  if (typeof av === 'string' || typeof bv === 'string') {
    cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
  } else if (typeof av === 'boolean' || typeof bv === 'boolean') {
    cmp = av === bv ? 0 : av ? -1 : 1;
  } else {
    cmp = av - bv;
  }
  return dir === 'asc' ? cmp : -cmp;
}

// Hook that returns rows sorted by the active column plus the controls to wire
// into <SortableHeader>. `initial` is the default {key, dir} (or null for none).
// `accessors` maps a sortKey to a (row) => value function for derived/computed
// columns (e.g. a value pulled out of a nested object); columns without an
// accessor sort by row[sortKey] directly.
export function useSortableRows(data, initial = null, accessors = {}) {
  const [sortState, setSortState] = useState(initial);

  const requestSort = useCallback((key) => {
    setSortState((prev) =>
      prev && prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' },
    );
  }, []);

  let rows = data;
  if (Array.isArray(data) && sortState) {
    const { key, dir } = sortState;
    const get = accessors[key] || ((row) => row?.[key]);
    rows = [...data].sort((a, b) => compareValues(get(a), get(b), dir));
  }

  return { rows, sortState, requestSort };
}

// A <th> that sorts its column on click (and Enter/Space) and shows a direction
// arrow. When not given sort props it renders a plain header. An optional `tip`
// adds a hover tooltip (help icon + popover) explaining the column.
export function SortableHeader({
  label,
  sortKey,
  sortState,
  onSort,
  align = 'left',
  tip,
  compact = false,
  className = '',
}) {
  const sortable = !!(sortKey && onSort);
  const active = sortable && sortState?.key === sortKey;
  const right = align === 'right';
  const handleSort = sortable ? () => onSort(sortKey) : undefined;
  const padding = compact ? 'py-1.5 px-2' : 'py-2 px-3';

  return (
    <th
      className={`${right ? 'text-right' : 'text-left'} ${padding} text-muted-foreground font-medium whitespace-nowrap ${className}`}
    >
      <span
        className={`group relative inline-flex items-center gap-1 ${
          sortable ? 'cursor-pointer select-none hover:text-foreground' : tip ? 'cursor-help' : ''
        } ${active ? 'text-foreground' : ''}`}
        onClick={handleSort}
        role={sortable ? 'button' : undefined}
        tabIndex={sortable ? 0 : undefined}
        onKeyDown={
          sortable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSort();
                }
              }
            : undefined
        }
      >
        {label}
        {sortable &&
          (active ? (
            sortState.dir === 'asc' ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-30" />
          ))}
        {tip && <HelpCircle className="w-3 h-3 opacity-50" />}
        {tip && (
          <span
            role="tooltip"
            className={`pointer-events-none absolute ${right ? 'right-0' : 'left-0'} top-full z-20 mt-1 hidden w-64 whitespace-normal rounded-lg border border-border bg-popover px-3 py-2 text-[11px] font-normal leading-snug text-popover-foreground normal-case tracking-normal shadow-lg group-hover:block`}
          >
            {tip}
          </span>
        )}
      </span>
    </th>
  );
}
