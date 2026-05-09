import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.PARENT_JWT_SECRET!);

export const config = {
  matcher: ['/orang-tua/dashboard/:path*', '/orang-tua/anak/:path*'],
};

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('parent_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const res = NextResponse.next();
    res.headers.set('x-parent-id', payload.parentId as string);
    res.headers.set('x-parent-nama', payload.nama as string);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
