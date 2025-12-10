'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { respondToNewPasswordChallenge } from '@/lib/auth/auth';
import { mapCognitoError } from '@/lib/auth/errors';

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [session, setSession] = useState('');

  useEffect(() => {
    // Get username and session from URL params or state
    const usernameParam = searchParams.get('username');
    const sessionParam = searchParams.get('session');
    
    if (usernameParam) setUsername(usernameParam);
    if (sessionParam) setSession(sessionParam);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!username || !session) {
      setError('Missing required information. Please try logging in again.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await respondToNewPasswordChallenge(
        username,
        temporaryPassword,
        newPassword,
        session
      );

      if (result.success) {
        // Redirect to dashboard after successful password change
        router.push('/dashboard');
        router.refresh();
      } else {
        const mappedError = mapCognitoError(new Error(result.error || 'Password change failed'));
        setError(mappedError.userFriendlyMessage);
      }
    } catch (err) {
      const mappedError = mapCognitoError(err);
      setError(mappedError.userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = temporaryPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Set New Password
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please set a new password for your account
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
              <label htmlFor="temporaryPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Temporary Password
              </label>
              <input
                id="temporaryPassword"
                name="temporaryPassword"
                type="password"
                autoComplete="current-password"
                required
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your temporary password"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your new password (min. 8 characters)"
                disabled={isLoading}
                minLength={8}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                placeholder="Confirm your new password"
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting password...
                </span>
              ) : (
                'Set New Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

