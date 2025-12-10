# Enable USER_PASSWORD_AUTH in AWS Cognito

## Quick Fix: Enable USER_PASSWORD_AUTH Flow

1. **Go to AWS Cognito Console**
   - Navigate to: https://console.aws.amazon.com/cognito/
   - Select your User Pool: `us-east-1_eoCzzjTkO`

2. **Edit App Client**
   - Click on **"App integration"** tab
   - Find your App Client: `6d2u8v6a4uljs9r733se3m1fvf`
   - Click **"Edit"** on the app client

3. **Enable Authentication Flows**
   - Scroll to **"Explicit authentication flows"** section
   - Check the box: **"Enable username-password (non-SRP) flow for app-based authentication (USER_PASSWORD_AUTH)"**
   - Click **"Save changes"**

## Alternative: Use SRP Flow (More Secure)

If you prefer not to enable USER_PASSWORD_AUTH, you can use the SRP (Secure Remote Password) flow which is more secure but requires additional implementation. However, USER_PASSWORD_AUTH is simpler and works well for web applications.

## After Enabling

Once you've enabled USER_PASSWORD_AUTH:
1. Restart your Next.js dev server
2. Try logging in again at `/login`

The authentication should work immediately.

