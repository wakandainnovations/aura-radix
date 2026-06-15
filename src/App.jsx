import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PRCommandCenter from './components/PRCommandCenter.api';
import { LicenseProvider } from './contexts/LicenseContext';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LicenseProvider>
        <div className="dark">
          <PRCommandCenter />
        </div>
      </LicenseProvider>
    </QueryClientProvider>
  );
}

export default App;
