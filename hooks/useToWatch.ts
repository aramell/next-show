'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type ToWatchType = 'movie' | 'tv';

export interface ToWatchItem {
  mediaId: string;
  type: ToWatchType;
  title: string;
  poster: string | null;
  year: number;
  tmdbId: number;
  createdAt?: string;
}

interface FetchResult {
  items: ToWatchItem[];
}

export function useToWatch(initialItems: ToWatchItem[] = []) {
  const [items, setItems] = useState<ToWatchItem[]>(initialItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const isSaved = useCallback(
    (mediaId: string) => items.some((item) => item.mediaId === mediaId),
    [items]
  );

  const addPending = (id: string) =>
    setPending((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const removePending = (id: string) =>
    setPending((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/to-watch', { cache: 'no-store' });
      if (res.status === 401) {
        setError('unauthenticated');
        setItems([]);
        return;
      }
      const data = (await res.json()) as FetchResult;
      setItems(data.items ?? []);
      setError(null);
    } catch {
      setError('Failed to load list');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (item: ToWatchItem) => {
      if (pending.has(item.mediaId)) return;
      addPending(item.mediaId);
      setItems((prev) => (isSaved(item.mediaId) ? prev : [...prev, item]));
      try {
        const res = await fetch('/api/to-watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
      } catch {
        setItems((prev) => prev.filter((i) => i.mediaId !== item.mediaId));
        setError('Failed to save item');
      } finally {
        removePending(item.mediaId);
      }
    },
    [isSaved, pending]
  );

  const removeItem = useCallback(
    async (mediaId: string) => {
      if (pending.has(mediaId)) return;
      addPending(mediaId);
      let previous: ToWatchItem[] = [];
      setItems((prev) => {
        previous = prev;
        return prev.filter((i) => i.mediaId !== mediaId);
      });
      try {
        const res = await fetch('/api/to-watch', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId }),
        });
        if (!res.ok && res.status !== 204) {
          throw new Error(await res.text());
        }
      } catch {
        setItems(previous);
        setError('Failed to remove item');
      } finally {
        removePending(mediaId);
      }
    },
    [pending]
  );

  const toggleItem = useCallback(
    async (item: ToWatchItem) => {
      if (pending.has(item.mediaId)) return;
      if (isSaved(item.mediaId)) {
        await removeItem(item.mediaId);
      } else {
        await addItem(item);
      }
    },
    [addItem, isSaved, pending, removeItem]
  );

  useEffect(() => {
    if (initialItems.length === 0) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [fetchItems, initialItems.length]);

  const pendingIds = useMemo(() => Array.from(pending), [pending]);

  return {
    items,
    loading,
    error,
    isSaved,
    toggleItem,
    pendingIds,
    fetchItems,
  };
}

