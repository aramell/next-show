import { getServerSession } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { getPopularMovies, getPopularTVShows, getTrending, getPosterUrl } from '@/lib/tmdb';
import DashboardContent from './dashboard-content';

export default async function DashboardPage() {
  // Check authentication
  const session = await getServerSession();
  
  if (!session.isAuthenticated) {
    redirect('/login');
  }

  // Fetch data from TMDB
  const [trending, popularMovies, popularShows] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularTVShows(),
  ]);

  return (
    <DashboardContent
      trending={trending}
      popularMovies={popularMovies}
      popularShows={popularShows}
      username={session.username || 'User'}
    />
  );
}

