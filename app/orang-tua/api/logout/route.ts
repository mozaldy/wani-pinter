import { NextRequest, NextResponse } from 'next/server';
import { PARENT_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url));
  res.cookies.set(PARENT_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
