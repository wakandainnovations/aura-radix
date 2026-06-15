import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Loader2, Plus, Check, Copy } from 'lucide-react';
import { adminLicenseService } from '../../api/adminLicenseService';
import { TIERS } from '../../lib/licensing';

/**
 * Admin console (F2/F3): list licenses, issue a license key to a user, and edit a
 * license's tier / active status.
 */
export default function LicenseAdminView() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState('');
  const [tier, setTier] = useState('BRONZE');
  const [expiresAt, setExpiresAt] = useState('');
  const [issuedKey, setIssuedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminLicenseService.listUsers,
  });

  const {
    data: licenses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin', 'licenses'],
    queryFn: adminLicenseService.listLicenses,
  });

  const issueMutation = useMutation({
    mutationFn: adminLicenseService.issueLicense,
    onSuccess: (res) => {
      setIssuedKey(res?.licenseKey || null);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'licenses'] });
    },
    onError: (err) => setFormError(err?.message || 'Failed to issue license.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => adminLicenseService.updateLicense(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'licenses'] }),
  });

  const handleIssue = (e) => {
    e.preventDefault();
    setIssuedKey(null);
    if (!userId) {
      setFormError('Select a user.');
      return;
    }
    issueMutation.mutate({
      userId: Number(userId),
      tier,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });
  };

  const copyKey = () => {
    if (!issuedKey) return;
    navigator.clipboard?.writeText(issuedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Licenses</h2>
            <p className="text-sm text-muted-foreground">Issue and manage user license keys.</p>
          </div>
        </div>

        {/* Issue form */}
        <form onSubmit={handleIssue} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Issue a license</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              User
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              >
                <option value="">Select user…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} (#{u.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Tier
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Expires (optional)
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="px-3 py-2 h-10 bg-background border border-border rounded-lg text-sm text-foreground"
              />
            </label>
            <button
              type="submit"
              disabled={issueMutation.isPending}
              className="px-4 py-2 h-10 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {issueMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Issue
            </button>
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}
          {issuedKey && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
              <span className="text-sm text-emerald-500">License key:</span>
              <code className="text-sm font-mono text-foreground">{issuedKey}</code>
              <button type="button" onClick={copyKey} className="ml-auto text-emerald-500 hover:text-emerald-400">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </form>

        {/* License list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-red-500">{error?.message || 'Failed to load licenses.'}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Tier</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold">Expires</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((lic) => (
                  <tr key={lic.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {lic.username || '—'} {lic.userId ? `(#${lic.userId})` : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{lic.licenseKey}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lic.tier}
                        onChange={(e) => updateMutation.mutate({ id: lic.id, patch: { tier: e.target.value } })}
                        className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground"
                      >
                        {TIERS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => updateMutation.mutate({ id: lic.id, patch: { active: !lic.active } })}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          lic.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {lic.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
                {licenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No licenses issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
