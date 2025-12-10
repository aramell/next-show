import { NextResponse } from 'next/server';
import { getPopularMovies, getPopularTVShows, getTrending } from '@/lib/tmdb';

/**
 * API route for TMDB data
 * GET /api/tmdb?type=movies|shows|trending
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending';

    switch (type) {
      case 'movies':
        const movies = await getPopularMovies();
        return NextResponse.json({ movies });
      
      case 'shows':
        const shows = await getPopularTVShows();
        return NextResponse.json({ shows });
      
      case 'trending':
      default:
        const trending = await getTrending();
        return NextResponse.json(trending);
    }
  } catch (error) {
    console.error('TMDB API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TMDB data' },
      { status: 500 }
    );
  }
}

