/**
 * TMDB (The Movie Database) API client
 * Fetches movies, TV shows, and recommendations
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

/**
 * Gets TMDB API key from environment
 */
function getTMDBApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.warn('TMDB_API_KEY not found - TMDB features will be disabled');
    return '';
  }
  return apiKey;
}

/**
 * Fetches popular movies from TMDB
 */
export async function getPopularMovies(): Promise<TMDBMovie[]> {
  try {
    const apiKey = getTMDBApiKey();
    if (!apiKey) return [];
    
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=1`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data: TMDBResponse<TMDBMovie> = await response.json();
    return data.results;
  } catch (error) {
    console.error('Failed to fetch popular movies:', error);
    return [];
  }
}

/**
 * Fetches popular TV shows from TMDB
 */
export async function getPopularTVShows(): Promise<TMDBTVShow[]> {
  try {
    const apiKey = getTMDBApiKey();
    if (!apiKey) return [];
    
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}&language=en-US&page=1`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data: TMDBResponse<TMDBTVShow> = await response.json();
    return data.results;
  } catch (error) {
    console.error('Failed to fetch popular TV shows:', error);
    return [];
  }
}

/**
 * Gets movie/TV show recommendations based on a specific item
 */
export async function getMovieRecommendations(movieId: number): Promise<TMDBMovie[]> {
  try {
    const apiKey = getTMDBApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data: TMDBResponse<TMDBMovie> = await response.json();
    return data.results.slice(0, 10); // Return top 10 recommendations
  } catch (error) {
    console.error('Failed to fetch movie recommendations:', error);
    return [];
  }
}

/**
 * Gets TV show recommendations based on a specific show
 */
export async function getTVShowRecommendations(showId: number): Promise<TMDBTVShow[]> {
  try {
    const apiKey = getTMDBApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${showId}/recommendations?api_key=${apiKey}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data: TMDBResponse<TMDBTVShow> = await response.json();
    return data.results.slice(0, 10); // Return top 10 recommendations
  } catch (error) {
    console.error('Failed to fetch TV show recommendations:', error);
    return [];
  }
}

/**
 * Gets trending movies and TV shows
 */
export async function getTrending(): Promise<{ movies: TMDBMovie[]; tvShows: TMDBTVShow[] }> {
  try {
    const apiKey = getTMDBApiKey();
    if (!apiKey) return { movies: [], tvShows: [] };
    
    const [moviesResponse, tvResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${apiKey}&language=en-US`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      }),
      fetch(`${TMDB_BASE_URL}/trending/tv/day?api_key=${apiKey}&language=en-US`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      }),
    ]);
    
    const moviesData: TMDBResponse<TMDBMovie> = await moviesResponse.json();
    const tvData: TMDBResponse<TMDBTVShow> = await tvResponse.json();
    
    return {
      movies: moviesData.results.slice(0, 10),
      tvShows: tvData.results.slice(0, 10),
    };
  } catch (error) {
    console.error('Failed to fetch trending content:', error);
    return { movies: [], tvShows: [] };
  }
}

/**
 * Gets poster image URL
 */
export function getPosterUrl(posterPath: string | null): string {
  if (!posterPath) {
    return '/placeholder-poster.png'; // Fallback image
  }
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

