import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { addToWatchItem, listToWatchItems, removeToWatchItem, ToWatchType } from '@/lib/to-watch/repository';

function requireAuth(session: { isAuthenticated?: boolean; userId?: string }) {
  if (!session?.isAuthenticated || !session.userId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: null };
  }
  return { error: null, userId: session.userId };
}

function validatePostPayload(body: any) {
  const required = ['mediaId', 'type', 'title', 'poster', 'year', 'tmdbId'];
  const missing = required.filter((key) => body?.[key] === undefined || body?.[key] === null);
  if (missing.length > 0) {
    return `Missing fields: ${missing.join(', ')}`;
  }

  if (!['movie', 'tv'].includes(body.type)) {
    return 'type must be "movie" or "tv"';
  }

  return null;
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession();
  const { error, userId } = requireAuth(session);
  if (error || !userId) return error;

  const items = await listToWatchItems(userId);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const { error, userId } = requireAuth(session);
  if (error || !userId) return error;

  const body = await req.json();
  const validationError = validatePostPayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    await addToWatchItem({
      userId,
      mediaId: body.mediaId,
      type: body.type as ToWatchType,
      title: body.title,
      poster: body.poster,
      year: body.year,
      tmdbId: body.tmdbId,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') {
      return NextResponse.json({ error: 'Item already saved' }, { status: 409 });
    }
    console.log('Error adding to-watch item:', err);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  const { error, userId } = requireAuth(session);
  if (error || !userId) return error;

  const body = await req.json();
  if (!body?.mediaId) {
    return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
  }

  await removeToWatchItem(userId, body.mediaId);
  return NextResponse.json({}, { status: 204 });
}

