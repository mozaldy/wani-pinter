import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PARENT_SECRET = new TextEncoder().encode(process.env.PARENT_JWT_SECRET!);
const TEACHER_SECRET = new TextEncoder().encode(process.env.TEACHER_JWT_SECRET!);

export const config = {
  matcher: [
    '/orang-tua/dashboard/:path*',
    '/orang-tua/anak/:path*',
    '/kepsek/:path*',
    '/dashboard/:path*',
    '/analytics/:path*',
    '/jurnal/:path*',
    '/penilaian/:path*',
    '/bank/:path*',
    '/catatan/:path*',
    '/rpp/:path*',
    '/admin/:path*',
    '/kurikulum/:path*',
    '/settings/:path*',
    '/siswa/:path*',
  ],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Parent routes
  if (pathname.startsWith('/orang-tua/')) {
    const token = req.cookies.get('parent_session')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    try {
      const { payload } = await jwtVerify(token, PARENT_SECRET);
      const res = NextResponse.next();
      res.headers.set('x-parent-id', payload.parentId as string);
      res.headers.set('x-parent-nama', payload.nama as string);
      return res;
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Kepsek routes
  if (pathname.startsWith('/kepsek/')) {
    const token = req.cookies.get('teacher_session')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    try {
      const { payload } = await jwtVerify(token, TEACHER_SECRET);
      if (payload.role !== 'kepsek') return NextResponse.redirect(new URL('/dashboard', req.url));
      const res = NextResponse.next();
      res.headers.set('x-user-id', payload.userId as string);
      res.headers.set('x-user-nama', payload.nama as string);
      res.headers.set('x-user-initials', payload.initials as string);
      res.headers.set('x-user-role', payload.role as string);
      res.headers.set('x-user-jabatan', payload.jabatan as string);
      return res;
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Teacher routes
  const token = req.cookies.get('teacher_session')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try {
    const { payload } = await jwtVerify(token, TEACHER_SECRET);
    const res = NextResponse.next();
    res.headers.set('x-user-id', payload.userId as string);
    res.headers.set('x-user-nama', payload.nama as string);
    res.headers.set('x-user-initials', payload.initials as string);
    res.headers.set('x-user-role', payload.role as string);
    res.headers.set('x-user-jabatan', payload.jabatan as string);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
