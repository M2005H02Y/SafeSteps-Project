
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'safesteps_session';
const PUBLIC_PATHS = ['/login', '/form', '/standard', '/workstation'];
const ROOT_PATH = '/';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // If user is authenticated
  if (sessionCookie) {
    // If user is on login page, redirect to dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Otherwise, allow access
    return NextResponse.next();
  }

  // If user is not authenticated
  // and trying to access a protected page
  if (!isPublicPath && pathname !== ROOT_PATH) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow access to public paths and root for unauthenticated users
  return NextResponse.next();
}

export const config = {
  // Matcher avoids middleware running on static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|ocplogo.png).*)'],
};
