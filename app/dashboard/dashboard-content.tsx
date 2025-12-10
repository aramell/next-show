'use client';

import { useAuth } from '@/hooks/useAuth';
import { useToWatch } from '@/hooks/useToWatch';
import { useRouter } from 'next/navigation';
import { getPosterUrl } from '@/lib/tmdb';
import type { TMDBMovie, TMDBTVShow } from '@/lib/tmdb';

interface DashboardContentProps {
  trending: { movies: TMDBMovie[]; tvShows: TMDBTVShow[] };
  popularMovies: TMDBMovie[];
  popularShows: TMDBTVShow[];
  username: string;
}

export default function DashboardContent({
  trending,
  popularMovies,
  popularShows,
  username,
}: DashboardContentProps) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { isSaved, toggleItem, pendingIds } = useToWatch();
  const pendingSet = new Set(pendingIds);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const makeItem = (type: 'movie' | 'tv', item: TMDBMovie | TMDBTVShow) => ({
    mediaId: `${type}:${item.id}`,
    type,
    title: type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name,
    poster: item.poster_path ? getPosterUrl(item.poster_path) : null,
    year: parseInt((type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date) || '0', 10),
    tmdbId: item.id,
  });

  const renderSaveButton = (mediaId: string, payload: ReturnType<typeof makeItem>) => {
    const saved = isSaved(mediaId);
    const pending = pendingSet.has(mediaId);
    return (
      <button
        className={`absolute top-2 right-2 rounded-md px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${
          saved
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-slate-900 text-white hover:bg-slate-800'
        } ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          void toggleItem(payload);
        }}
        disabled={pending}
        aria-pressed={saved}
      >
        {pending ? 'Saving...' : saved ? 'Saved' : 'Save'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Welcome, {username}!
            </h1>
            <p className="text-muted-foreground mt-2">Discover your next favorite show or movie</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Trending Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Trending Today</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3 text-muted-foreground">Movies</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending.movies.map((movie) => (
                <div
                  key={movie.id}
                  className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank')}
                >
                  {renderSaveButton(`movie:${movie.id}`, makeItem('movie', movie))}
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                    }}
                  />
                  <div className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{movie.overview}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium">⭐ {movie.vote_average.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-3 text-muted-foreground">TV Shows</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending.tvShows.map((show) => (
                <div
                  key={show.id}
                  className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => window.open(`https://www.themoviedb.org/tv/${show.id}`, '_blank')}
                >
                  {renderSaveButton(`tv:${show.id}`, makeItem('tv', show))}
                  <img
                    src={getPosterUrl(show.poster_path)}
                    alt={show.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                    }}
                  />
                  <div className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">{show.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{show.overview}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium">⭐ {show.vote_average.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(show.first_air_date).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Movies Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Popular Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularMovies.slice(0, 12).map((movie) => (
              <div
                key={movie.id}
                className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank')}
              >
                {renderSaveButton(`movie:${movie.id}`, makeItem('movie', movie))}
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                  }}
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{movie.overview}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs font-medium">⭐ {movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular TV Shows Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Popular TV Shows</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularShows.slice(0, 12).map((show) => (
              <div
                key={show.id}
                className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => window.open(`https://www.themoviedb.org/tv/${show.id}`, '_blank')}
              >
                {renderSaveButton(`tv:${show.id}`, makeItem('tv', show))}
                <img
                  src={getPosterUrl(show.poster_path)}
                  alt={show.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-poster.png';
                  }}
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">{show.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{show.overview}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs font-medium">⭐ {show.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

