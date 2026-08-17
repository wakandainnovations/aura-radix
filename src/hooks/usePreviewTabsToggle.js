import { useCallback, useState } from 'react';

const STORAGE_KEY = 'admin_showPreviewTabs';

/**
 * Persists (per-browser, via localStorage) whether an admin has opted to
 * preview the still-under-construction nav sections/sub-tabs. Non-admins
 * never read this — see PREVIEW_NAV_KEYS/PREVIEW_SUBTABS in newui/previewTabs.js
 * for what it gates.
 */
export function usePreviewTabsToggle() {
  const [showPreviewTabs, setShowPreviewTabsState] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  const setShowPreviewTabs = useCallback((value) => {
    setShowPreviewTabsState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return [showPreviewTabs, setShowPreviewTabs];
}
