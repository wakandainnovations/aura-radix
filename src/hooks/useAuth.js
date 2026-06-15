import { useEffect, useState } from 'react';

/**
 * Custom hook for managing authentication state.
 * Syncs with the localStorage JWT token.
 *
 * NOTE: admin status is no longer tracked here. It is derived from the backend
 * role via the admin probe in LicenseContext — use `useLicense().isAdmin` instead.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return !!localStorage.getItem('jwtToken');
  });

  // Listen for storage changes (e.g., from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('jwtToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isAuthenticated, setIsAuthenticated };
}
