/**
 * Tests for Cognito configuration utility
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getCognitoConfig, validateCognitoConfig } from './cognito-config';

describe('cognito-config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getCognitoConfig', () => {
    it('should return valid config when all required env vars are set', () => {
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_test123';
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'client123';
      process.env.NEXT_PUBLIC_COGNITO_REGION = 'us-west-2';

      const config = getCognitoConfig();

      expect(config).toEqual({
        userPoolId: 'us-east-1_test123',
        clientId: 'client123',
        region: 'us-west-2',
      });
    });

    it('should use default region when NEXT_PUBLIC_COGNITO_REGION is not set', () => {
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_test123';
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'client123';
      delete process.env.NEXT_PUBLIC_COGNITO_REGION;

      const config = getCognitoConfig();

      expect(config.region).toBe('us-east-1');
    });

    it('should throw error when NEXT_PUBLIC_COGNITO_USER_POOL_ID is missing', () => {
      delete process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'client123';

      expect(() => getCognitoConfig()).toThrow(
        'NEXT_PUBLIC_COGNITO_USER_POOL_ID environment variable is required'
      );
    });

    it('should throw error when NEXT_PUBLIC_COGNITO_CLIENT_ID is missing', () => {
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_test123';
      delete process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      expect(() => getCognitoConfig()).toThrow(
        'NEXT_PUBLIC_COGNITO_CLIENT_ID environment variable is required'
      );
    });
  });

  describe('validateCognitoConfig', () => {
    it('should return true when config is valid', () => {
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_test123';
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'client123';

      expect(validateCognitoConfig()).toBe(true);
    });

    it('should return false when config is invalid', () => {
      delete process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
      delete process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      expect(validateCognitoConfig()).toBe(false);
    });
  });
});

