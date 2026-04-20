import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { X, CheckCircle } from 'lucide-react';
import { authService } from '../../api';

export default function LoginModal({ open, onOpenChange, onLoginSuccess }) {
  const [username, setUsername] = useState('newuser');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStatus(null);
        setErrorMessage('');
        setUsername('newuser');
        setPassword('password123');
        setIsLoading(false);
      }, 300);
    }
  }, [open]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setErrorMessage('');

    try {
      const response = await authService.login(username, password);
      setStatus('success');
      
      // Call the callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Auto close after showing success
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      // Handle 403 Forbidden - token is invalid/expired
      if (error.response?.status === 403) {
        authService.logout();
        setStatus('error');
        setErrorMessage('Your session has expired. Please login again.');
      } else {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || error.message || 'Login failed');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-card border border-border rounded-lg shadow-2xl z-50 p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-bold text-foreground">
              Login
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Dialog.Close>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in duration-300">
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              <p className="text-sm font-medium text-foreground">Login successful!</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label.Root htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </Label.Root>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label.Root htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label.Root>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-in fade-in duration-300">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Info text */}
              <p className="text-xs text-muted-foreground text-center">
                Demo credentials: jason1 / password1234
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
