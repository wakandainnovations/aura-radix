import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { licenseService } from '../api/licenseService';
import { adminLicenseService } from '../api/adminLicenseService';
import { isAtLeast as tierIsAtLeast } from '../lib/licensing';

const LicenseContext = createContext(null);

const getToken = () => localStorage.getItem('jwtToken');

/**
 * Single source of truth for the current user's license, entitlements, usage, and
 * admin status. Admin status is derived by probing the admin-only `GET /api/admin/users`
 * endpoint (the JWT carries no role claim and there is no profile endpoint), so a 200
 * means ROLE_ADMIN and a 403 means a regular user.
 *
 * Also holds the admin "view as user" selection (F2) used to scope entity/dashboard
 * reads to a chosen user via the `ownerId` query param.
 */
export function LicenseProvider({ children }) {
  const queryClient = useQueryClient();
  const [authed, setAuthed] = useState(() => !!getToken());
  const [viewAsUserId, setViewAsUserId] = useState(null);

  const licenseQuery = useQuery({
    queryKey: ['license', 'me'],
    queryFn: licenseService.getMyLicense,
    enabled: authed,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const featuresQuery = useQuery({
    queryKey: ['license', 'features'],
    queryFn: licenseService.getFeatures,
    enabled: authed,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const usageQuery = useQuery({
    queryKey: ['license', 'usage'],
    queryFn: licenseService.getUsage,
    enabled: authed,
    staleTime: 60 * 1000,
    retry: false,
  });

  // Admin probe — 200 ⇒ ROLE_ADMIN, 403 ⇒ regular user.
  const adminQuery = useQuery({
    queryKey: ['license', 'admin-probe'],
    queryFn: async () => {
      try {
        await adminLicenseService.listUsers();
        return true;
      } catch (e) {
        return false;
      }
    },
    enabled: authed,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const refresh = useCallback(() => {
    const hasToken = !!getToken();
    setAuthed(hasToken);
    if (hasToken) {
      queryClient.invalidateQueries({ queryKey: ['license'] });
    } else {
      queryClient.removeQueries({ queryKey: ['license'] });
      setViewAsUserId(null);
    }
  }, [queryClient]);

  const isAdmin = adminQuery.data === true;
  const license = licenseQuery.data ?? null;
  const tier = license?.tier ?? null;
  const features = featuresQuery.data ?? [];

  const featureByKey = useCallback(
    (key) => features.find((f) => f.key === key) || null,
    [features],
  );

  // Admins bypass all gates. Otherwise read the backend's per-feature `entitled` flag.
  const hasFeature = useCallback(
    (key) => {
      if (isAdmin) return true;
      const f = features.find((x) => x.key === key);
      return f ? !!f.entitled : true; // unknown/non-gated features default to visible
    },
    [isAdmin, features],
  );

  const isAtLeast = useCallback(
    (minimum) => isAdmin || tierIsAtLeast(tier, minimum),
    [isAdmin, tier],
  );

  const value = useMemo(
    () => ({
      isAdmin,
      tier,
      license,
      limits: license, // license payload carries the per-tier limits
      features,
      featureByKey,
      usage: usageQuery.data ?? null,
      loading: authed && (licenseQuery.isLoading || featuresQuery.isLoading),
      viewAsUserId,
      setViewAsUserId,
      hasFeature,
      isAtLeast,
      refresh,
    }),
    [
      isAdmin,
      tier,
      license,
      features,
      featureByKey,
      usageQuery.data,
      authed,
      licenseQuery.isLoading,
      featuresQuery.isLoading,
      viewAsUserId,
      hasFeature,
      isAtLeast,
      refresh,
    ],
  );

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return ctx;
}
