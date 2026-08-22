import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { thClass } from '../theme';

// A thClass-styled header cell that sorts its column on click, pairing with
// the classic UI's headless useSortableRows hook
// (src/components/shared/SortableTable.jsx) but styled for the new UI's dark
// theme instead of reusing that file's own light-theme SortableHeader.
export default function SortableTh({ label, sortKey, sortState, onSort, align = 'left' }) {
  const active = sortState?.key === sortKey;
  const right = align === 'right';

  return (
    <th className={`${thClass} ${right ? 'text-right' : ''}`}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => onSort(sortKey)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSort(sortKey);
          }
        }}
        className={`inline-flex items-center gap-1 cursor-pointer select-none hover:text-white/70 transition-colors ${active ? 'text-white/70' : ''}`}
      >
        {label}
        {active ? (
          sortState.dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}
