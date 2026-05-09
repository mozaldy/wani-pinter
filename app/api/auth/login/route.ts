import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getTeacherByEmail, signTeacherToken, TEACHER_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = form.get('email') as string;
  const password = form.get('password') as string;

  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }

  const user = await getTeacherByEmail(email);
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }

  const valid = await bcrypt.compare(password, user.pw_hash);
  if (!valid) {
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }

  const token = await signTeacherToken({
    userId: user.id,
    nama: user.nama,
    initials: user.initials,
    role: user.role,
    jabatan: user.jabatan,
  });

  const dest = user.role === 'kepsek' ? '/kepsek/dashboard' : '/dashboard';
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.set(TEACHER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
