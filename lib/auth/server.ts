/**
 * Server-side authentication utilities
 * For use in Next.js server components and API routes
 */

import { cookies } from 'next/headers';
import { getCognitoConfig } from './cognito-config';

export interface ServerAuthSession {
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
}

const SESSION_COOKIE_NAME = 'cognito-session';

/**
 * Gets authentication session from server-side cookies
 * @returns ServerAuthSession with authentication status
 */
export async function getServerSession(): Promise<ServerAuthSession> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return { isAuthenticated: false };
    }

    // In a real implementation, validate the session token with Cognito
    // For now, return basic session info
    const sessionData = JSON.parse(sessionCookie.value);

    return {
      isAuthenticated: true,
      userId: sessionData.userId,
      username: sessionData.username,
    };
  } catch {
    return { isAuthenticated: false };
  }
}

/**
 * Sets authentication session cookie (server-side)
 * @param userId - User ID
 * @param username - Username
 */
export async function setServerSession(userId: string, username: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ userId, username }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears authentication session cookie
 */
export async function clearServerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Validates Cognito configuration is available
 * @returns true if configuration is valid
 */
export function validateServerAuthConfig(): boolean {
  try {
    getCognitoConfig();
    return true;
  } catch {
    return false;
  }
}

