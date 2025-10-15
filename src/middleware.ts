import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to auth pages
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Allow access to root page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Allow access to API auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // For protected routes, check if user has a session cookie
  if (pathname.startsWith('/assets') ||
      pathname.startsWith('/protocols') ||
      pathname.startsWith('/lps') ||
      pathname.startsWith('/users')) {

    const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};