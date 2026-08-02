import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PRCommandCenter from './components/PRCommandCenter.api';
import NewCommandCenter from './components/NewCommandCenter';
import UIModeToggle from './components/shared/UIModeToggle';
import { LicenseProvider, useLicense } from './contexts/LicenseContext';
import { UIModeProvider, useUIMode } from './contexts/UIModeContext';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// isAdmin (from LicenseContext) already implies the user is authenticated —
// the admin probe only resolves true after a successful login — so it's a
// safe single source of truth for gating the toggle without duplicating
// auth state here.
function AppShell() {
  const { isAdmin } = useLicense();
  const { isNewUI } = useUIMode();
  const showNewUI = isAdmin && isNewUI;

  return (
    <div className="dark">
      {showNewUI ? <NewCommandCenter /> : <PRCommandCenter />}
      {isAdmin && <UIModeToggle />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LicenseProvider>
        <UIModeProvider>
          <AppShell />
        </UIModeProvider>
      </LicenseProvider>
    </QueryClientProvider>
  );
}

export default App;
