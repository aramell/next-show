/**
 * Error mapping utilities for AWS Cognito errors
 * Translates Cognito-specific errors to user-friendly messages
 */

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
}

/**
 * Maps AWS Cognito error codes to user-friendly messages
 */
export function mapCognitoError(error: unknown): AuthError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = extractErrorCode(errorMessage);

  const errorMap: Record<string, string> = {
    'NotAuthorizedException': 'Invalid email or password. Please check your credentials and try again.',
    'UserNotFoundException': 'No account found with this email address.',
    'UserNotConfirmedException': 'Your account has not been confirmed. Please check your email for a confirmation link.',
    'PasswordResetRequiredException': 'A password reset is required. Please reset your password.',
    'TooManyFailedAttemptsException': 'Too many failed login attempts. Please try again later.',
    'TooManyRequestsException': 'Too many requests. Please try again in a few moments.',
    'NetworkError': 'Network error. Please check your internet connection and try again.',
    'UnknownError': 'An unexpected error occurred. Please try again.',
  };

  const userFriendlyMessage = errorMap[errorCode] || errorMap['UnknownError'];

  return {
    code: errorCode,
    message: errorMessage,
    userFriendlyMessage,
  };
}

/**
 * Extracts error code from error message
 */
function extractErrorCode(message: string): string {
  // Common Cognito error patterns
  if (message.includes('NotAuthorizedException')) return 'NotAuthorizedException';
  if (message.includes('UserNotFoundException')) return 'UserNotFoundException';
  if (message.includes('UserNotConfirmedException')) return 'UserNotConfirmedException';
  if (message.includes('PasswordResetRequiredException')) return 'PasswordResetRequiredException';
  if (message.includes('TooManyFailedAttemptsException')) return 'TooManyFailedAttemptsException';
  if (message.includes('TooManyRequestsException')) return 'TooManyRequestsException';
  if (message.includes('NetworkError') || message.includes('fetch')) return 'NetworkError';
  
  return 'UnknownError';
}

