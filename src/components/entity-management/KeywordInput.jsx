import React, { useState } from 'react';
import * as Label from '@radix-ui/react-label';
import { X } from 'lucide-react';

/**
 * Tag-style input for managing a list of keyword strings.
 * Add a keyword by typing and pressing Enter or comma; remove with the chip's X or Backspace.
 */
export default function KeywordInput({
  id = 'keywords',
  label = 'Keywords',
  keywords = [],
  onChange,
  disabled = false,
  required = false,
  helpText = 'Press Enter or comma to add. These drive what mentions are tracked for this entity.',
}) {
  const [draft, setDraft] = useState('');

  const addKeywords = (raw) => {
    const parts = raw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const existing = new Set(keywords.map((k) => k.toLowerCase()));
    const merged = [...keywords];
    parts.forEach((p) => {
      if (!existing.has(p.toLowerCase())) {
        existing.add(p.toLowerCase());
        merged.push(p);
      }
    });
    onChange(merged);
    setDraft('');
  };

  const removeKeyword = (index) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeywords(draft);
    } else if (e.key === 'Backspace' && draft === '' && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label.Root htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label.Root>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 w-full px-3 py-2 bg-card border border-border rounded-lg
          focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {keywords.map((keyword, index) => (
          <span
            key={`${keyword}-${index}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/15 text-primary border border-primary/30"
          >
            {keyword}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="hover:text-red-500 transition-colors"
                aria-label={`Remove ${keyword}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addKeywords(draft)}
          placeholder={keywords.length === 0 ? 'e.g. action, blockbuster, summer-release' : 'Add another…'}
          className="flex-1 min-w-[140px] bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}
