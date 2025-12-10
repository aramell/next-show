/**
 * AWS Cognito Configuration
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_COGNITO_USER_POOL_ID: AWS Cognito User Pool ID
 * - NEXT_PUBLIC_COGNITO_CLIENT_ID: AWS Cognito App Client ID
 * - NEXT_PUBLIC_COGNITO_REGION: AWS Region (default: us-east-1)
 */

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}

/**
 * Validates and returns Cognito configuration from environment variables
 * @throws Error if required environment variables are missing
 */
export function getCognitoConfig(): CognitoConfig {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1';

  if (!userPoolId) {
    throw new Error('NEXT_PUBLIC_COGNITO_USER_POOL_ID environment variable is required');
  }

  if (!clientId) {
    throw new Error('NEXT_PUBLIC_COGNITO_CLIENT_ID environment variable is required');
  }

  return {
    userPoolId,
    clientId,
    region,
  };
}

/**
 * Validates Cognito configuration without throwing
 * @returns true if configuration is valid, false otherwise
 */
export function validateCognitoConfig(): boolean {
  try {
    getCognitoConfig();
    return true;
  } catch {
    return false;
  }
}

