import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export const runtime = 'nodejs';

const DEFAULT_PATH = '/home';

/** Only allow redirecting to a same-origin relative path — blocks open redirects. */
function safePath(to: string | null): string {
  if (!to) return DEFAULT_PATH;
  if (!to.startsWith('/') || to.startsWith('//')) return DEFAULT_PATH;
  return to;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const to = safePath(req.nextUrl.searchParams.get('to'));

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // redirect:false lets us control the response — signIn still sets the
    // session cookie on this request/response cycle.
    await signIn('magic-link', { token, redirect: false });
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.redirect(new URL(to, req.url));
}
