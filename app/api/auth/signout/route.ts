import { NextResponse } from 'next/server';
import { clearServerSession } from '@/lib/auth/server';

/**
 * API route to handle server-side sign out
 * Clears the server-side session cookie
 */
export async function POST() {
  try {
    await clearServerSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

