import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, Plus, Check, Sparkles, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { searchNames } from './investmentAdvisorUtils';

const FIELD =
  'w-full flex flex-wrap items-center gap-1.5 min-h-[36px] px-3 py-1 bg-white/[0.04] border rounded-lg transition-colors focus-within:ring-1 focus-within:ring-blue-500';

// Autocomplete over a backend name list that still accepts a name the list
// doesn't have (a debutant actor, a new banner). Single mode: the input text
// *is* the value. Multi mode (`multiple`): chips, capped at `max`.
export default function CreditCombobox({
  names = [],
  isLoading = false,
  isError = false,
  value,
  onChange,
  multiple = false,
  max = Infinity,
  exclude = [],
  placeholder,
  icon: Icon,
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState('');

  const selected = multiple ? value : [];
  const text = multiple ? query : value;
  const atMax = multiple && selected.length >= max;

  const lowerIndex = useMemo(() => new Map(names.map((n) => [n.toLowerCase(), n])), [names]);
  // Without a loaded list (still loading, or the endpoint failed) there's
  // nothing to compare against, so don't flag every name as new.
  const isKnown = (name) => !names.length || lowerIndex.has(name.toLowerCase());
  const matches = useMemo(
    () => searchNames(names, text, { exclude: [...exclude, ...selected] }),
    [names, text, exclude, selected],
  );
  const trimmed = text.trim();
  const exactMatch = trimmed ? lowerIndex.get(trimmed.toLowerCase()) : undefined;
  const offerNew = multiple && trimmed && !exactMatch && !selected.some((s) => s.toLowerCase() === trimmed.toLowerCase());
  const options = offerNew ? [...matches, { newName: trimmed }] : matches;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, exactMatch, value]);

  useEffect(() => setHighlight(0), [text]);

  function close() {
    setOpen(false);
    // Snap a case-insensitive hit to the canonical spelling — AuraPredictor
    // matches names exactly, so "allu arjun" would otherwise be "unknown".
    if (!multiple && exactMatch && exactMatch !== value) onChange(exactMatch);
  }

  function pick(option) {
    const name = typeof option === 'string' ? option : option.newName;
    if (multiple) {
      if (!atMax) onChange([...selected, name]);
      setQuery('');
      inputRef.current?.focus();
    } else {
      onChange(name);
      setOpen(false);
    }
  }

  function remove(name) {
    onChange(selected.filter((s) => s !== name));
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && options[highlight]) {
        e.preventDefault();
        pick(options[highlight]);
      } else if (multiple && trimmed) {
        e.preventDefault();
        pick(exactMatch ?? { newName: trimmed });
      }
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Tab') {
      close();
    } else if (e.key === 'Backspace' && multiple && !query && selected.length) {
      remove(selected[selected.length - 1]);
    }
  }

  const isNewValue = !multiple && trimmed && !exactMatch && !isLoading && names.length > 0;
  const showList = open && !atMax && (options.length > 0 || isLoading || isError);

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`${FIELD} ${open ? 'border-blue-500/50' : 'border-white/10'} ${atMax ? 'cursor-default' : 'cursor-text'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {Icon && !multiple && <Icon className="w-4 h-4 text-white/30 shrink-0" />}
        {selected.map((name) => (
          <span
            key={name}
            className={`inline-flex items-center gap-1 pl-2 pr-1 py-px rounded-md text-xs border ${
              isKnown(name)
                ? 'bg-blue-500/10 border-blue-500/25 text-blue-200'
                : 'bg-violet-500/10 border-violet-500/25 text-violet-200'
            }`}
          >
            {!isKnown(name) && <Sparkles className="w-3 h-3 text-violet-300" />}
            {name}
            <button
              type="button"
              aria-label={`Remove ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(name);
              }}
              className="p-0.5 rounded hover:bg-white/10 text-white/50 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {!atMax && (
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            value={text}
            placeholder={selected.length ? 'Add another…' : placeholder}
            onChange={(e) => {
              if (multiple) setQuery(e.target.value);
              else onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-[80px] bg-transparent py-0.5 text-sm text-white/90 placeholder:text-white/25 outline-none"
          />
        )}
        {isNewValue && (
          <span
            title="Not in our film database — the model will treat them as having no track record."
            className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/15 text-[10px] font-semibold text-violet-300"
          >
            <Sparkles className="w-3 h-3" />
            New name
          </span>
        )}
        {!multiple && value ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded text-white/30 hover:text-white/70"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          !atMax && <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-30 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#11141f] shadow-2xl py-1"
        >
          {isError && !names.length && (
            <li className="flex items-start gap-2 px-3 py-2 text-xs text-amber-200/80">
              <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
              Name suggestions are unavailable right now. Type the full name exactly as credited.
            </li>
          )}
          {isLoading && !names.length && (
            <li className="flex items-center gap-2 px-3 py-2 text-xs text-white/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading names…
            </li>
          )}
          {options.map((option, i) => {
            const isNew = typeof option !== 'string';
            const label = isNew ? option.newName : option;
            const active = i === highlight;
            return (
              <li
                key={isNew ? `__new__${label}` : label}
                role="option"
                aria-selected={active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(option)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer ${
                  active ? 'bg-blue-600/15 text-white' : 'text-white/70'
                } ${isNew ? 'border-t border-white/[0.06] mt-1 pt-2' : ''}`}
              >
                {isNew ? (
                  <>
                    <Plus className="w-3.5 h-3.5 text-violet-300" />
                    <span>
                      Add <span className="font-medium text-violet-200">“{label}”</span> as a new name
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate">{label}</span>
                    {!multiple && label === value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
