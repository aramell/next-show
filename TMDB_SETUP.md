# TMDB API Setup

## Get Your TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/) and create an account
2. Navigate to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (free tier available)
4. Copy your API key

## Add to Environment Variables

Add your TMDB API key to `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

Or if you prefer server-side only:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

## Dashboard Features

The dashboard (`/dashboard`) includes:

- **Trending Today**: Movies and TV shows trending right now
- **Popular Movies**: Currently popular movies
- **Popular TV Shows**: Currently popular TV shows
- **Click to View**: Click any card to open TMDB page in new tab

## API Endpoints

- `GET /api/tmdb?type=trending` - Get trending content
- `GET /api/tmdb?type=movies` - Get popular movies
- `GET /api/tmdb?type=shows` - Get popular TV shows

## After Setup

1. Add TMDB API key to `.env.local`
2. Restart dev server: `npm run dev`
3. Login and you'll be redirected to `/dashboard`
4. Browse movies and TV shows!

