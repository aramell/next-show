/**
 * Client-side token storage utilities
 * Stores tokens securely in browser storage
 */

const TOKEN_KEY_PREFIX = 'cognito_tokens_';

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Stores tokens in localStorage
 * @param tokens - Cognito tokens to store
 */
export function storeTokens(tokens: CognitoTokens): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(`${TOKEN_KEY_PREFIX}data`, JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to store tokens:', error);
  }
}

/**
 * Retrieves tokens from localStorage
 * @returns Tokens if found and not expired, null otherwise
 */
export function getStoredTokens(): CognitoTokens | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(`${TOKEN_KEY_PREFIX}data`);
    if (!stored) {
      return null;
    }

    const tokens: CognitoTokens = JSON.parse(stored);
    
    // Check if tokens are expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    if (tokens.expiresAt && tokens.expiresAt < now + 300) {
      clearTokens();
      return null;
    }

    return tokens;
  } catch {
    return null;
  }
}

/**
 * Gets the access token from storage
 * @returns Access token if available, null otherwise
 */
export function getAccessToken(): string | null {
  const tokens = getStoredTokens();
  return tokens?.accessToken || null;
}

/**
 * Gets the ID token from storage
 * @returns ID token if available, null otherwise
 */
export function getIdToken(): string | null {
  const tokens = getStoredTokens();
  return tokens?.idToken || null;
}

/**
 * Gets the refresh token from storage
 * @returns Refresh token if available, null otherwise
 */
export function getRefreshToken(): string | null {
  const tokens = getStoredTokens();
  return tokens?.refreshToken || null;
}

/**
 * Clears all stored tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(`${TOKEN_KEY_PREFIX}data`);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}

/**
 * Parses JWT token to extract expiration time
 * @param token - JWT token string
 * @returns Expiration timestamp in seconds, or null if parsing fails
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload.exp || null;
  } catch {
    return null;
  }
}

