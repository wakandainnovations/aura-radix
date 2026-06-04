import { useEffect, useState } from 'react';

/**
 * Custom hook for managing authentication state
 * Syncs with localStorage JWT token
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return !!localStorage.getItem('jwtToken');
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    // Admin gate for in-development areas (admin/admin login)
    return localStorage.getItem('isAdmin') === 'true';
  });

  // Listen for storage changes (e.g., from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('jwtToken'));
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin };
}
