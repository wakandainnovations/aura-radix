import { useState } from 'react';
import { Eye, EyeOff, Radar } from 'lucide-react';
import { authService } from '../../api';

// Full-screen auth gate shown instead of the app shell whenever the user isn't
// logged in — nothing behind it (nav, header, panels) should mount until
// isAuthenticated flips true. Modeled on the Instagram/X/Reddit pattern: a
// single centered card on a branded backdrop, not a dialog over live app chrome.
export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isRegister) {
        await authService.register(username, password);
      }
      await authService.login(username, password);
      onLoginSuccess?.();
    } catch (error) {
      if (error.response?.status === 403) {
        authService.logout();
        setErrorMessage('Your session has expired. Please login again.');
      } else {
        setErrorMessage(error.message || 'Authentication failed. Check credentials or register first.');
      }
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-6">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Radar className="w-7 h-7 text-primary-foreground" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">FRAMEHOUSE</h1>
          <p className="text-sm text-muted-foreground mt-1">An AI Operating System for Movies</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5 text-center">
            {isRegister ? 'Create your account' : 'Log in'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="text-xs font-medium text-muted-foreground">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2.5 pr-10 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-in fade-in duration-300">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full px-4 py-2.5 h-11 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {isRegister ? 'Creating account...' : 'Logging in...'}
                </>
              ) : (
                isRegister ? 'Sign up' : 'Log in'
              )}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-sm text-muted-foreground text-center mt-6">
          {isRegister ? (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMessage(''); }}
                className="text-primary font-medium hover:underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>New here?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMessage(''); }}
                className="text-primary font-medium hover:underline"
              >
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
