import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getParentByEmail, signParentToken, PARENT_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = form.get('email') as string;
  const password = form.get('password') as string;

  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }

  const parent = await getParentByEmail(email);
  if (!parent) {
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }

  const valid = await bcrypt.compare(password, parent.pw_hash);
  if (!valid) {
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }

  const token = await signParentToken(parent.id, parent.nama);

  const res = NextResponse.redirect(new URL('/orang-tua/dashboard', req.url));
  res.cookies.set(PARENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
