import React, { createContext, useContext, useState, useCallback } from 'react';

const UIModeContext = createContext(null);
const STORAGE_KEY = 'uiMode';

/**
 * Tracks whether the admin has switched to the new (in-progress) UI or is
 * viewing the classic UI. Persisted to localStorage so the choice survives
 * a refresh. Visibility of the toggle itself is gated by isAdmin at the
 * call site (see App.jsx) — this context only tracks the selected mode.
 */
export function UIModeProvider({ children }) {
  const [uiMode, setUiMode] = useState(() => (
    localStorage.getItem(STORAGE_KEY) === 'new' ? 'new' : 'classic'
  ));

  const toggleUIMode = useCallback(() => {
    setUiMode((prev) => {
      const next = prev === 'new' ? 'classic' : 'new';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = { uiMode, isNewUI: uiMode === 'new', toggleUIMode };

  return <UIModeContext.Provider value={value}>{children}</UIModeContext.Provider>;
}

export function useUIMode() {
  const ctx = useContext(UIModeContext);
  if (!ctx) {
    throw new Error('useUIMode must be used within a UIModeProvider');
  }
  return ctx;
}
