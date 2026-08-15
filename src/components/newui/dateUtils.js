// Shared date helper for the new UI — a movie entity's releaseDate is the one
// real field several unrelated widgets (sidebar switcher, movie header) need.
export function daysUntilRelease(releaseDate) {
  if (!releaseDate) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date().setHours(0, 0, 0, 0);
  const release = new Date(releaseDate).setHours(0, 0, 0, 0);
  return Math.round((release - today) / msPerDay);
}

// A negative releaseInDays means the movie already released, so "Releasing
// in -N days" needs to flip into "Released N days ago" instead.
export function releaseCountdownLabel(releaseInDays) {
  const isPast = releaseInDays < 0;
  return { isPast, days: isPast ? -releaseInDays : releaseInDays };
}

// Renders a backend `generatedAt` timestamp as "Updated N mins/hours ago",
// matching the Command Center panels' existing copy style.
export function timeAgoLabel(isoString) {
  if (!isoString) return null;
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
}

// Renders a `checkpointDate` ("YYYY-MM-DD") as "May 10" for the timeline
// step labels. Anchored to local midnight rather than parsed as UTC so the
// displayed day doesn't shift a day back in timezones behind UTC.
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Today's date in the same "YYYY-MM-DD" shape as `checkpointDate`, so the two
// can be compared with plain string ordering to derive done/current/upcoming.
export function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
