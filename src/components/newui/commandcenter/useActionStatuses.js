import { useEffect, useState } from 'react';

// Recommended-action status (Active/Done/Irrelevant) has no backend concept
// yet — the /recommended-actions response has no id or status field — so it's
// tracked client-side, keyed by action title (the same key already used as
// the React list key) and scoped per movie so switching movies doesn't leak
// one movie's dismissed actions onto another's.
const STORAGE_PREFIX = 'commandCenter.actionStatus.';

function loadStatuses(entityId) {
  if (entityId == null) return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${entityId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function useActionStatuses(entityId) {
  const [statuses, setStatuses] = useState(() => loadStatuses(entityId));

  useEffect(() => {
    setStatuses(loadStatuses(entityId));
  }, [entityId]);

  function setStatus(title, status) {
    setStatuses((prev) => {
      const next = { ...prev, [title]: status };
      if (entityId != null) {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${entityId}`, JSON.stringify(next));
        } catch {
          // Storage unavailable/full — status just won't persist across reloads.
        }
      }
      return next;
    });
  }

  return [statuses, setStatus];
}
