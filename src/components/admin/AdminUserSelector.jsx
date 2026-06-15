import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { useLicense } from '../../contexts/LicenseContext';
import { adminLicenseService } from '../../api/adminLicenseService';

/**
 * F2 — admin-only "view as user" selector. Picks a user whose entities the admin
 * wants to inspect; the chosen id is stored in LicenseContext as `viewAsUserId` and
 * passed as `ownerId` on entity reads. Renders nothing for non-admins.
 */
export default function AdminUserSelector() {
  const { isAdmin, viewAsUserId, setViewAsUserId } = useLicense();

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminLicenseService.listUsers,
    enabled: isAdmin,
  });

  if (!isAdmin) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 h-10 rounded-lg bg-card border border-border"
      title="View another user's entities"
    >
      <Users className="w-4 h-4 text-muted-foreground" />
      <select
        value={viewAsUserId ?? ''}
        onChange={(e) => setViewAsUserId(e.target.value ? Number(e.target.value) : null)}
        className="bg-transparent text-sm text-foreground focus:outline-none"
      >
        <option value="">All users (mine)</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
    </div>
  );
}
