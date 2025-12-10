'use client';

import { useToWatch, ToWatchItem } from '@/hooks/useToWatch';

interface Props {
  initialItems: ToWatchItem[];
}

export function ToWatchClient({ initialItems }: Props) {
  const { items, loading, toggleItem, pendingIds } = useToWatch(initialItems);
  const pendingSet = new Set(pendingIds);

  if (loading) {
    return <div className="text-muted-foreground">Loading your list...</div>;
  }

  if (items.length === 0) {
    return <div className="text-muted-foreground">Your list is empty. Start saving shows and movies from the dashboard.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.mediaId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex gap-4 items-start">
          <img
            src={item.poster ?? '/placeholder-poster.png'}
            alt={item.title}
            className="w-20 h-28 object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-poster.png';
            }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.type} • {item.year || 'Unknown'}
                </p>
              </div>
              <button
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                onClick={() => void toggleItem(item)}
                disabled={pendingSet.has(item.mediaId)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

