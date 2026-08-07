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
