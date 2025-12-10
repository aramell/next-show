'use client'

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { mapCognitoError } from '@/lib/auth/errors';

type RegistrationStep = 'signup' | 'confirm' | 'success';

export default function RegisterPage() {
  const { signup, confirmEmail, loading: authLoading } = useAuth();
  const [step, setStep] = useState<RegistrationStep>('signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
      const result = await signup(email, password, username);
       
      if (result.success) {
        setSuccessMessage(result.message);
        setStep('confirm');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (err) {
      const mappedError = mapCognitoError(err);
      setError(mappedError.userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!confirmationCode.trim()) {
      setError('Confirmation code is required');
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmEmail(username, confirmationCode);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setStep('success');
        setConfirmationCode('');
      } else {
        setError(result.error || 'Confirmation failed');
      }
    } catch (err) {
      const mappedError = mapCognitoError(err);
      setError(mappedError.userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignupFormValid = 
    email.trim() !== '' && 
    username.trim() !== '' && 
    password.length >= 8 && 
    password === confirmPassword;

  const isConfirmFormValid = confirmationCode.trim() !== '';
  const isSubmitting = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {step === 'signup' && (
          <>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Sign up to get started
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="johndoe"
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isSignupFormValid || isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Sign In
                </Link>
              </p>
            </form>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Verify Email
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Check your email for a confirmation code
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleConfirm}>
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmation Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456"
                  disabled={isSubmitting}
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={!isConfirmFormValid || isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Back to Sign Up
              </button>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Account Created!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your email has been verified successfully
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
