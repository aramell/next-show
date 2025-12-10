'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { mapCognitoError } from '@/lib/auth/errors';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const [session, setSession] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect to dashboard after successful login
        router.push('/dashboard');
        router.refresh();
      } else if (result.requiresNewPassword && result.session) {
        // Redirect to new password page
        setSession(result.session);
        setRequiresNewPassword(true);
        router.push(`/new-password?username=${encodeURIComponent(email)}&session=${encodeURIComponent(result.session)}`);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      const mappedError = mapCognitoError(err);
      setError(mappedError.userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.length > 0;
  const isSubmitting = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Sign In
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your email or username"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300">
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}


