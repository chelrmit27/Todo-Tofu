import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data: https://*",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data: https://*",
      "connect-src 'self' https://*",
      "frame-src 'self' https://*"
    ].join('; ')
  );
  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|login/login.png|public|api/health).*)'],
};
