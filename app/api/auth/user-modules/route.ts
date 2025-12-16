// app/api/auth/user-modules/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Since we removed Clerk, always return unauthorized for now
    // You can implement your own auth logic here later
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  } catch (error) {
    console.error('User modules fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}