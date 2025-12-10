/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { useToWatch, ToWatchItem } from './useToWatch';

const sample: ToWatchItem = {
  itemId: 'movie:1',
  type: 'movie',
  title: 'Test',
  poster: '/poster',
  year: 2020,
  tmdbId: 1,
};

describe('useToWatch', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [sample] }),
      text: async () => '',
    }) as unknown as typeof fetch;
  });

  it('initializes with provided items', async () => {
    const { result } = renderHook(() => useToWatch([sample]));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.isSaved(sample.itemId)).toBe(true);
  });

  it('toggles add/remove', async () => {
    const { result } = renderHook(() => useToWatch([]));

    await act(async () => {
      await result.current.toggleItem(sample);
    });

    expect(result.current.isSaved(sample.itemId)).toBe(true);

    await act(async () => {
      await result.current.toggleItem(sample);
    });

    expect(result.current.isSaved(sample.itemId)).toBe(false);
  });
});

