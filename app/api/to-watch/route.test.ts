import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from './route';
import { listToWatchItems, addToWatchItem, removeToWatchItem } from '@/lib/to-watch/repository';
import { getServerSession } from '@/lib/auth/server';

jest.mock('@/lib/to-watch/repository', () => ({
  listToWatchItems: jest.fn(),
  addToWatchItem: jest.fn(),
  removeToWatchItem: jest.fn(),
}));

jest.mock('@/lib/auth/server', () => ({
  getServerSession: jest.fn(),
}));

function makeRequest(method: string, body?: unknown) {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest('http://localhost/api/to-watch', init);
}

describe('to-watch API routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ isAuthenticated: false });

    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('returns list for authenticated user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: 'u1' });
    (listToWatchItems as jest.Mock).mockResolvedValue([{ itemId: 'movie:1' }]);

    const res = await GET(makeRequest('GET'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(listToWatchItems).toHaveBeenCalledWith('u1');
  });

  it('validates POST payload', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: 'u1' });

    const res = await POST(makeRequest('POST', { itemId: 'movie:1' }));
    expect(res.status).toBe(400);
  });

  it('creates item for authenticated user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: 'u1' });

    const res = await POST(
      makeRequest('POST', {
        itemId: 'movie:1',
        type: 'movie',
        title: 'Test',
        poster: '/p',
        year: 2020,
        tmdbId: 1,
      })
    );

    expect(res.status).toBe(201);
    expect(addToWatchItem).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        itemId: 'movie:1',
      })
    );
  });

  it('maps duplicate adds to 409', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: 'u1' });
    (addToWatchItem as jest.Mock).mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    const res = await POST(
      makeRequest('POST', {
        itemId: 'movie:1',
        type: 'movie',
        title: 'Test',
        poster: '/p',
        year: 2020,
        tmdbId: 1,
      })
    );

    expect(res.status).toBe(409);
  });

  it('deletes item for authenticated user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ isAuthenticated: true, userId: 'u1' });

    const res = await DELETE(makeRequest('DELETE', { itemId: 'movie:1' }));

    expect(res.status).toBe(204);
    expect(removeToWatchItem).toHaveBeenCalledWith('u1', 'movie:1');
  });
});

