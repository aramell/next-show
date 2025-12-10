# AWS Cognito Direct API Setup

## Required Dependencies

Install AWS SDK v3 for Cognito Identity Provider:

```bash
npm install @aws-sdk/client-cognito-identity-provider
```

## Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

## AWS Cognito User Pool Configuration

### 1. Create User Pool
- Go to AWS Cognito Console
- Create a new User Pool
- Configure sign-in options (email, username, etc.)
- Set password policy

### 2. Create App Client
- In your User Pool, go to "App integration" → "App clients"
- Create a new app client
- **IMPORTANT**: Do NOT generate a client secret (uncheck "Generate client secret")
  - Client secrets cannot be used in browser-based applications
  - The app client must be configured as a public client

### 3. Configure App Client Settings
- Enable "USER_PASSWORD_AUTH" authentication flow
- Set callback URLs (e.g., `http://localhost:3000` for dev)
- Set sign-out URLs

### 4. User Pool Domain (Optional)
- If using Hosted UI, configure a domain
- For direct API usage, domain is not required

## Authentication Flow

The implementation uses:
- `InitiateAuth` with `USER_PASSWORD_AUTH` flow for sign-in
- `GetUser` to retrieve user details
- `GlobalSignOut` for sign-out
- Tokens stored in localStorage (client-side) and cookies (server-side)

## Security Notes

1. **No Client Secret**: The app client must be configured without a secret
2. **Token Storage**: 
   - Client-side: localStorage (for access tokens)
   - Server-side: httpOnly cookies (for session validation)
3. **Token Validation**: Tokens are validated by checking expiration and calling Cognito APIs
4. **HTTPS**: Use HTTPS in production for secure token transmission

## Testing

1. Create a test user in your Cognito User Pool
2. Set environment variables
3. Start the dev server: `npm run dev`
4. Navigate to `/login` and test authentication

# DynamoDB "To Watch" storage

Add environment variables for the to-watch list storage (DynamoDB):

```env
# DynamoDB
DDB_TO_WATCH_TABLE=to-watch
AWS_REGION=us-east-1
# If running locally against DynamoDB Local, also set:
# AWS_ACCESS_KEY_ID=local
# AWS_SECRET_ACCESS_KEY=local
```

Install DynamoDB SDK dependencies (if not already):

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

The table uses:
- Partition key: `userId` (string)
- Sort key: `itemId` (string, e.g., `movie:123`)

