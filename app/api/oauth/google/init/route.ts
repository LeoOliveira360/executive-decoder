import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url, { status: 302 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OAuth init error' }, { status: 400 });
  }
}


