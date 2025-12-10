import { NextResponse } from 'next/server';
import { setServerSession } from '@/lib/auth/server';

/**
 * API route to set server-side session after successful login
 */
export async function POST(request: Request) {
  try {
    const { userId, username } = await request.json();
    
    if (!userId || !username) {
      return NextResponse.json(
        { error: 'userId and username are required' },
        { status: 400 }
      );
    }
    
    await setServerSession(userId, username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

