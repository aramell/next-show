/**
 * Authentication service for AWS Cognito (Direct API)
 * Handles sign-in, sign-out, and session management using AWS SDK v3
 */

import { CognitoIdentityProviderClient, InitiateAuthCommand, GlobalSignOutCommand, GetUserCommand, RespondToAuthChallengeCommand, SignUpCommand, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { getCognitoConfig } from './cognito-config';
import { storeTokens, getTokenExpiration } from './token-storage';

export interface SignInResult {
  success: boolean;
  error?: string;
  userId?: string;
  username?: string;
  challengeName?: string;
  session?: string;
  tokens?: {
    idToken: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  userSub?: string;
  username?: string;
  message?: string;
}

export interface ConfirmSignUpResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
}

/**
 * Creates a Cognito Identity Provider client
 */
function createCognitoClient() {
  const config = getCognitoConfig();
  return new CognitoIdentityProviderClient({
    region: config.region,
  });
}

/**
 * Signs in a user with email/username and password
 * @param username - Email or username
 * @param password - User password
 * @returns SignInResult with success status and tokens if successful
 */
export async function signIn(username: string, password: string): Promise<SignInResult> {
  try {
    const config = getCognitoConfig();
    const client = createCognitoClient();

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: config.clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await client.send(command);

    // Handle NEW_PASSWORD_REQUIRED challenge
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        success: false,
        error: 'NEW_PASSWORD_REQUIRED',
        challengeName: 'NEW_PASSWORD_REQUIRED',
        session: response.Session || '',
        username: username,
      };
    }

    if (response.AuthenticationResult) {
      const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

      if (!IdToken || !AccessToken || !RefreshToken) {
        return {
          success: false,
          error: 'Authentication succeeded but tokens are missing',
        };
      }

      // Get user details
      const getUserCommand = new GetUserCommand({
        AccessToken: AccessToken,
      });
      const userResponse = await client.send(getUserCommand);

      const userId = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value || '';
      const email = userResponse.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
      const usernameAttr = userResponse.Username || username;

      // Store tokens client-side
      const expiresAt = getTokenExpiration(IdToken) || Math.floor(Date.now() / 1000) + 3600;
      storeTokens({
        idToken: IdToken,
        accessToken: AccessToken,
        refreshToken: RefreshToken,
        expiresAt,
      });

      // Set server-side session via API route
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username: usernameAttr }),
        });
      } catch (error) {
        // Log but don't fail if server session setup fails
        console.error('Failed to set server session:', error);
      }

      return {
        success: true,
        userId,
        username: usernameAttr,
        tokens: {
          idToken: IdToken,
          accessToken: AccessToken,
          refreshToken: RefreshToken,
        },
      };
    }

    return {
      success: false,
      error: 'Authentication failed - no authentication result',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Signs out the current user
 * @param accessToken - Current access token (optional, will try to get from storage)
 */
export async function signOut(accessToken?: string): Promise<void> {
  try {
    // Try to get access token from parameter or storage
    const token = accessToken || (typeof window !== 'undefined' ? await import('./token-storage').then(m => m.getAccessToken()) : null);
    
    if (token) {
      const client = createCognitoClient();
      const command = new GlobalSignOutCommand({
        AccessToken: token,
      });
      await client.send(command);
    }
  } catch (error) {
    console.error('Sign out error:', error);
    // Continue to clear tokens even if API call fails
  } finally {
    // Clear client-side tokens
    if (typeof window !== 'undefined') {
      await import('./token-storage').then(m => m.clearTokens());
    }
    
    // Clear server-side session via API route
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      // Ignore server-side signout errors
    }
  }
}

/**
 * Gets the current authenticated user
 * @param accessToken - Current access token
 * @returns AuthUser if authenticated, null otherwise
 */
export async function getCurrentAuthUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const client = createCognitoClient();
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await client.send(command);
    const userId = response.UserAttributes?.find(attr => attr.Name === 'sub')?.Value || '';
    const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
    const username = response.Username || '';

    return {
      userId,
      username,
      email,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if user is currently authenticated
 * @param accessToken - Current access token
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(accessToken: string): Promise<boolean> {
  try {
    const client = createCognitoClient();
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Responds to NEW_PASSWORD_REQUIRED challenge
 * @param username - Username
 * @param temporaryPassword - Temporary password
 * @param newPassword - New password to set
 * @param session - Session token from challenge
 * @returns SignInResult with tokens if successful
 */
export async function respondToNewPasswordChallenge(
  username: string,
  temporaryPassword: string,
  newPassword: string,
  session: string
): Promise<SignInResult> {
  try {
    const config = getCognitoConfig();
    const client = createCognitoClient();

    const command = new RespondToAuthChallengeCommand({
      ClientId: config.clientId,
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
      },
    });

    const response = await client.send(command);

    if (response.AuthenticationResult) {
      const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

      if (!IdToken || !AccessToken || !RefreshToken) {
        return {
          success: false,
          error: 'Password change succeeded but tokens are missing',
        };
      }

      // Get user details
      const getUserCommand = new GetUserCommand({
        AccessToken: AccessToken,
      });
      const userResponse = await client.send(getUserCommand);

      const userId = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value || '';
      const email = userResponse.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
      const usernameAttr = userResponse.Username || username;

      // Store tokens client-side
      const expiresAt = getTokenExpiration(IdToken) || Math.floor(Date.now() / 1000) + 3600;
      storeTokens({
        idToken: IdToken,
        accessToken: AccessToken,
        refreshToken: RefreshToken,
        expiresAt,
      });

      // Set server-side session via API route
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username: usernameAttr }),
        });
      } catch (error) {
        console.error('Failed to set server session:', error);
      }

      return {
        success: true,
        userId,
        username: usernameAttr,
        tokens: {
          idToken: IdToken,
          accessToken: AccessToken,
          refreshToken: RefreshToken,
        },
      };
    }

    return {
      success: false,
      error: 'Password change failed - no authentication result',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Signs up a new user with email and password
 * @param email - User email address
 * @param password - User password
 * @param username - Username (optional, defaults to email)
 * @returns SignUpResult with success status and user info
 */
export async function signUp(email: string, password: string, username?: string): Promise<SignUpResult> {
  try {
    const config = getCognitoConfig();
    const client = createCognitoClient();
    const finalUsername = username || email;

    const command = new SignUpCommand({
      ClientId: config.clientId,
      Username: finalUsername,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    });

    const response = await client.send(command);

    return {
      success: true,
      userSub: response.UserSub,
      username: finalUsername,
      message: 'Sign up successful! Please check your email for a confirmation code.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
}

/**
 * Confirms a user's sign-up with a confirmation code
 * @param username - Username
 * @param confirmationCode - Code from email
 * @returns ConfirmSignUpResult with success status
 */
export async function confirmSignUp(username: string, confirmationCode: string): Promise<ConfirmSignUpResult> {
  try {
    const config = getCognitoConfig();
    const client = createCognitoClient();

    const command = new ConfirmSignUpCommand({
      ClientId: config.clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
    });

    await client.send(command);

    return {
      success: true,
      message: 'Email confirmed successfully! You can now sign in.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Confirmation failed',
    };
  }
}

