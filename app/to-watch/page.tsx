import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server';
import { listToWatchItems } from '@/lib/to-watch/repository';
import { ToWatchClient } from './to-watch-client';

export default async function ToWatchPage() {
  const session = await getServerSession();
  if (!session.isAuthenticated || !session.userId) {
    redirect('/login');
  }

  const items = await listToWatchItems(session.userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My To-Watch List</h1>
      <ToWatchClient initialItems={items} />
    </div>
  );
}

