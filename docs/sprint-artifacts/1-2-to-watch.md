# Story 1.2: Save "To Watch" Movies & TV Shows

Status: Approved

## Story

As a **signed-in user**,
I want **to save movies and TV shows to a personal "To Watch" list**,
so that **I can track and revisit titles across devices**.

## Acceptance Criteria

1. **AC1: Add to List**
   - [ ] From dashboard cards, I can click "Save" to add a movie or show
   - [ ] UI reflects saved state (e.g., filled bookmark icon)
   - [ ] Duplicate saves are prevented

2. **AC2: View My List**
   - [ ] A dedicated `/to-watch` page shows my saved items (movies + TV)
   - [ ] Items display title, type (movie/show), poster, and year
   - [ ] Empty state message when no items saved

3. **AC3: Remove from List**
   - [ ] I can remove an item from my list via UI control
   - [ ] UI updates immediately

4. **AC4: Persistence & Auth**
   - [ ] List is stored per user and persists across sessions/devices
   - [ ] Only authenticated users can add/view/remove
   - [ ] Unauthorized access redirects to `/login`

5. **AC5: API & Data Integrity**
   - [ ] Server API validates auth and user ownership
   - [ ] API returns normalized item shape (id, type, title, poster, year, tmdbId)
   - [ ] Basic rate/abuse safeguards (simple request limit or debouncing)

## Tasks / Subtasks

- [ ] Task 1: Data model & storage (AC4, AC5)
  - [ ] Subtask 1.1: Choose storage: **DynamoDB table** with partition key `userId`, sort key `mediaId` (tmdb:movie:123)
  - [ ] Subtask 1.2: Define item shape (userId, itemId, type, title, poster, year, createdAt)
  - [ ] Subtask 1.3: Add env vars for AWS creds/region/table name; document in README/SETUP

- [ ] Task 2: Server API (AC1, AC3, AC5)
  - [ ] Subtask 2.1: POST `/api/to-watch` to add item (auth required)
  - [ ] Subtask 2.2: GET `/api/to-watch` to list current user items
  - [ ] Subtask 2.3: DELETE `/api/to-watch` to remove item by `itemId`
  - [ ] Subtask 2.4: Validate payload, enforce auth, and prevent duplicates

- [ ] Task 3: Client integration on dashboard (AC1, AC3)
  - [ ] Subtask 3.1: Add "Save" / "Saved" toggle to cards on `/dashboard`
  - [ ] Subtask 3.2: Wire to API with optimistic UI and error fallback
  - [ ] Subtask 3.3: Handle disabled state if not authenticated (redirect to `/login`)

- [ ] Task 4: To-Watch page (AC2, AC3)
  - [ ] Subtask 4.1: Create `/to-watch` route (protected)
  - [ ] Subtask 4.2: List saved items with poster, title, year, type
  - [ ] Subtask 4.3: Remove action with immediate UI update
  - [ ] Subtask 4.4: Empty state UX

- [ ] Task 5: Persistence wiring (AC4)
  - [ ] Subtask 5.1: Reuse Cognito session to derive `userId` server-side
  - [ ] Subtask 5.2: Ensure server APIs reject unauthenticated requests
  - [ ] Subtask 5.3: Add minimal throttling/debouncing on client adds/removes

- [ ] Task 6: Testing (AC1–AC5)
  - [ ] Subtask 6.1: Unit tests for API handlers (auth, dedupe, delete)
  - [ ] Subtask 6.2: Integration test for add/list/remove flow
  - [ ] Subtask 6.3: Basic UI test for save/remove states and empty state

## Dev Notes

### Proposed AWS Storage
- DynamoDB table `to-watch` (or env-configurable)
  - PK: `userId` (string)
  - SK: `itemId` (string, e.g., `movie:123` or `tv:456`)
  - Attributes: `title`, `type` (movie|tv), `poster`, `year`, `tmdbId`, `createdAt`
- Alt (if preferred): S3 JSON per user; DynamoDB recommended for query by userId.

### APIs
- POST `/api/to-watch` body: { itemId, type, title, poster, year, tmdbId }
- GET `/api/to-watch`
- DELETE `/api/to-watch` body: { itemId }
- Auth: reuse existing Cognito session cookie; server-side validation required.

### UX
- Dashboard cards get a Save/Saved toggle
- `/to-watch` page shows list with remove control and empty state

### Env Vars
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DDB_TO_WATCH_TABLE` (e.g., `to-watch`)

### Open Questions
- Do we need per-item notes/priority? (future)
- Do we need pagination on `/to-watch`? (not in scope now; assume <100 items)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
