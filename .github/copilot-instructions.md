# Next Show - AI Coding Instructions

## Architecture Overview

This is a **Next.js 15 App Router** project with **AWS Cognito** authentication and **TMDB API** integration. Key architectural decisions:

- **Direct AWS SDK v3** usage (no Amplify) for better control and transparency
- **Client + Server auth patterns**: `useAuth()` hook for client components, `getServerSession()` for server components/API routes
- **DynamoDB** for user data (to-watch lists) with composite keys (`userId`, `itemId`)
- **TypeScript first** with comprehensive type safety across auth and data layers

## Authentication Patterns

### Client-Side Auth
- Use `useAuth()` hook in client components: provides `user`, `authenticated`, `loading` states
- Token storage in localStorage with expiration checks
- Auth state automatically synced between tabs

### Server-Side Auth  
- API routes: Use `getServerSession()` → check `isAuthenticated` and extract `userId`
- Server components: Use `getServerSession()` for conditional rendering
- Protected route pattern: Extract `requireAuth()` helper from `/app/api/to-watch/route.ts`

### Error Handling
- Cognito errors mapped through `mapCognitoError()` in `lib/auth/errors.ts`
- Common flows: login, logout, session validation, expired tokens

## Development Workflows

### Environment Setup
```bash
# Required for AWS services
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# Required for DynamoDB  
AWS_REGION=us-east-1
DDB_TO_WATCH_TABLE=towatch-table

# Required for TMDB integration
NEXT_PUBLIC_TMDB_API_KEY=xxx
```

### Testing
- `npm test` runs Jest with React Testing Library
- Test files co-located: `*.test.ts|tsx`
- Mock external services (AWS SDK, TMDB API) in tests
- Server action testing pattern in `app/api/to-watch/route.test.ts`

### Key Commands
- `npm run dev` - Development server  
- `npm run build` - Production build
- `npm test` - Run test suite

## Data Layer Patterns

### Repository Pattern
- DynamoDB repositories in `lib/*/repository.ts` (e.g., `lib/to-watch/repository.ts`)
- Composite key pattern: `userId` (partition) + `itemId` (sort)
- Type-safe interfaces for all data operations
- Error handling with descriptive messages

### API Route Structure
- Consistent pattern: auth check → validation → repository call → response
- Error responses: `{ error: string }` with appropriate HTTP status
- Success responses: `{ items: T[] }` or `{ item: T }`

## Key Files & Patterns

### Core Auth Files
- `lib/auth/auth.ts` - Main auth service with AWS SDK v3
- `lib/auth/server.ts` - Server-side session management  
- `hooks/useAuth.ts` - Client-side auth hook
- `lib/auth/token-storage.ts` - Secure token management

### Feature Organization
- Feature-based folders: `lib/to-watch/`, `lib/tmdb/`
- Co-locate tests, types, and implementations
- Repository pattern for data access

### Component Patterns
- Server components for data fetching (leverage React cache)
- Client components for interactivity with clear `'use client'` boundaries
- Providers minimal - direct AWS SDK usage, no complex state management

When implementing new features, follow these established patterns for consistency with the existing codebase.