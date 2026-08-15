import { User } from 'lucide-react';

// Renders one related-user hyperlink chip. Falls back to plain (non-link)
// text when the backend didn't resolve a profileUrl for that user id.
function UserChip({ user }) {
  const label = user.name || user.userId;
  const className =
    'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 transition-colors';

  if (!user.profileUrl) {
    return (
      <span className={className}>
        <User className="w-3 h-3 opacity-60" />
        {label}
      </span>
    );
  }

  return (
    <a
      href={user.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${className} hover:bg-blue-500/15 hover:text-blue-300`}
    >
      <User className="w-3 h-3 opacity-60" />
      {label}
    </a>
  );
}

// Compact row for the Recommended Actions card: a handful of linked users
// plus a "+N more" hint pointing the reader at View Details for the rest
// (backend caps relatedUsers at 20, so "more" here is always small).
export function RelatedUsersPreview({ users, max = 3 }) {
  if (!users?.length) return null;
  const shown = users.slice(0, max);
  const remaining = users.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {shown.map((u) => (
        <UserChip key={u.userId} user={u} />
      ))}
      {remaining > 0 && <span className="text-[11px] text-white/40">+{remaining} more</span>}
    </div>
  );
}

// Full list for the View Details modal: every related user for that action
// (already capped to 20 by the data layer), each linked to their profile.
export function RelatedUsersList({ users }) {
  if (!users?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2">
      {users.map((u) => (
        <UserChip key={u.userId} user={u} />
      ))}
    </div>
  );
}
