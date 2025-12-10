'use client';

/**
 * Client-side authentication hook
 * Provides authentication state and methods for client components
 */

import { useState, useEffect, useCallback } from 'react';
import { signIn, signOut, getCurrentAuthUser, isAuthenticated, signUp, confirmSignUp } from '@/lib/auth/auth';
import { mapCognitoError } from '@/lib/auth/errors';
import { getAccessToken, getStoredTokens, clearTokens } from '@/lib/auth/token-storage';

export interface UseAuthReturn {
  user: { userId: string; username: string; email?: string } | null;
  loading: boolean;
  authenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; requiresNewPassword?: boolean; session?: string }>;
  signup: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  confirmEmail: (username: string, confirmationCode: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Hook for managing authentication state in client components
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<{ userId: string; username: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const tokens = getStoredTokens();
      if (!tokens || !tokens.accessToken) {
        setUser(null);
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const isAuth = await isAuthenticated(tokens.accessToken);
      if (isAuth) {
        const currentUser = await getCurrentAuthUser(tokens.accessToken);
        setUser(currentUser);
        setAuthenticated(true);
      } else {
        clearTokens();
        setUser(null);
        setAuthenticated(false);
      }
    } catch {
      clearTokens();
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const result = await signIn(username, password);
      
      // Handle NEW_PASSWORD_REQUIRED challenge
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        return {
          success: false,
          requiresNewPassword: true,
          session: result.session,
          error: 'A new password is required',
        };
      }
      
      if (result.success && result.tokens) {
        await checkAuth();
        return { success: true };
      } else {
        const error = mapCognitoError(new Error(result.error || 'Login failed'));
        return { success: false, error: error.userFriendlyMessage };
      }
    } catch (error) {
      const mappedError = mapCognitoError(error);
      return { success: false, error: mappedError.userFriendlyMessage };
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const signup = useCallback(async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      const result = await signUp(email, password, username);
      
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        const error = mapCognitoError(new Error(result.error || 'Sign up failed'));
        return { success: false, error: error.userFriendlyMessage };
      }
    } catch (error) {
      const mappedError = mapCognitoError(error);
      return { success: false, error: mappedError.userFriendlyMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmEmail = useCallback(async (username: string, confirmationCode: string) => {
    setLoading(true);
    try {
      const result = await confirmSignUp(username, confirmationCode);
      
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        const error = mapCognitoError(new Error(result.error || 'Confirmation failed'));
        return { success: false, error: error.userFriendlyMessage };
      }
    } catch (error) {
      const mappedError = mapCognitoError(error);
      return { success: false, error: mappedError.userFriendlyMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      await signOut(accessToken || undefined);
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if API call fails
      clearTokens();
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    authenticated,
    login,
    signup,
    confirmEmail,
    logout,
    checkAuth,
  };
}
