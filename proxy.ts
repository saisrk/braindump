import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from auth pages
  const authOnlyPaths = ['/login', '/signup'];
  if (authOnlyPaths.includes(pathname)) {
    const session = await auth();
    if (session?.user?.id) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // Routes that are always public — no auth required.
  const publicPaths = [
    '/',
    '/landing',
    '/login',
    '/signup',
    '/capture',     // capture + analyze is allowed without auth; save requires auth
    '/onboarding',
  ];

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/auth/send-otp') ||
    pathname.startsWith('/api/auth/verify-otp') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  if (isPublic) return NextResponse.next();

  const session = await auth();
  if (!session?.user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
