import * as Select from '@radix-ui/react-select';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Star } from 'lucide-react';

export const TRIGGER =
  'w-full h-9 flex items-center gap-2 px-3 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white/90 hover:bg-white/[0.06] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500 data-[state=open]:border-blue-500/50';
const MENU = 'z-50 overflow-hidden rounded-xl border border-white/10 bg-[#11141f] shadow-2xl';
const ITEM =
  'relative flex items-center gap-2 pl-3 pr-8 py-1.5 rounded-md text-sm text-white/75 cursor-pointer outline-none select-none data-[highlighted]:bg-blue-600/15 data-[highlighted]:text-white';

// Single-choice dropdown. `options` is [{ value, label, hint? }].
export function SelectMenu({ value, onChange, options, ariaLabel }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger aria-label={ariaLabel} className={TRIGGER}>
        <span className="flex-1 text-left truncate"><Select.Value /></span>
        <Select.Icon><ChevronDown className="w-4 h-4 text-white/40" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className={`${MENU} w-[var(--radix-select-trigger-width)] min-w-[180px]`}>
          <Select.Viewport className="p-1">
            {options.map((o) => (
              <Select.Item key={o.value} value={o.value} className={ITEM}>
                <Select.ItemText>{o.label}</Select.ItemText>
                {o.hint && <span className="ml-auto text-[11px] text-white/35">{o.hint}</span>}
                <Select.ItemIndicator className="absolute right-2.5">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// Multi-choice dropdown with checkboxes. Selection order is kept (it matters
// for language: the first one is the original). With `ordered`, the first
// pick is tagged "Original" and any other pick can be promoted.
export function MultiSelectMenu({ value, onChange, options, placeholder, ordered = false, formatLabel = (v) => v, invalid }) {
  const toggle = (opt) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  const promote = (opt) => onChange([opt, ...value.filter((v) => v !== opt)]);

  const summary = value.length === 0
    ? <span className="text-white/25">{placeholder}</span>
    : (
      <span className="truncate">
        {formatLabel(value[0])}
        {ordered && value.length > 1 && <span className="text-white/35"> (original)</span>}
        {value.length > 1 && <span className="text-white/50">, {value.slice(1).map(formatLabel).join(', ')}</span>}
      </span>
    );

  return (
    <Popover.Root>
      <Popover.Trigger className={`${TRIGGER} ${invalid ? 'border-red-500/50' : ''}`}>
        <span className="flex-1 min-w-0 text-left flex">{summary}</span>
        {value.length > 1 && (
          <span className="shrink-0 px-1.5 rounded bg-blue-500/15 text-blue-300 text-[11px] font-semibold">{value.length}</span>
        )}
        <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={`${MENU} w-[var(--radix-popover-trigger-width)] min-w-[220px]`}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-72 overflow-y-auto p-1">
            {options.map((opt) => {
              const idx = value.indexOf(opt);
              const checked = idx !== -1;
              return (
                <div
                  key={opt}
                  role="menuitemcheckbox"
                  aria-checked={checked}
                  tabIndex={0}
                  onClick={() => toggle(opt)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle(opt);
                    }
                  }}
                  className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-white/75 cursor-pointer outline-none hover:bg-white/[0.05] focus-visible:bg-white/[0.05]"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'border-white/25'}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className={`flex-1 ${checked ? 'text-white' : ''}`}>{formatLabel(opt)}</span>
                  {ordered && checked && idx === 0 && value.length > 1 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300"><Star className="w-3 h-3 fill-amber-300" />Original</span>
                  )}
                  {ordered && checked && idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        promote(opt);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-white/40 hover:text-amber-300"
                    >
                      Make original
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-1.5">
              <span className="text-[11px] text-white/35">{value.length} selected</span>
              <button type="button" onClick={() => onChange([])} className="text-[11px] text-white/50 hover:text-white">Clear</button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
