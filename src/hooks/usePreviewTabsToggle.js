import { useCallback, useState } from 'react';

const STORAGE_KEY = 'admin_fullAppAccess';

/**
 * Persists (per-browser, via localStorage) whether an admin has opted into
 * full access — seeing every nav section/sub-tab instead of just the
 * demo-ready subset a customer would see. Non-admins never read this — see
 * DEMO_HIDDEN_NAV_KEYS/DEMO_VISIBLE_SUBTABS in newui/previewTabs.js for what
 * it gates.
 */
export function usePreviewTabsToggle() {
  const [fullAccess, setFullAccessState] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  const setFullAccess = useCallback((value) => {
    setFullAccessState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return [fullAccess, setFullAccess];
}
