import { NextRequest, NextResponse } from 'next/server';
import { applyDemoSecurityHeaders } from '@/lib/security/demo-headers';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

function needsProtectedHeaders(pathname: string): boolean {
  return pathname.startsWith('/demo') || pathname.startsWith('/access');
}

function isAdminRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname === '/api/tokens' ||
    pathname.startsWith('/api/tokens/')
  );
}

function unauthorizedResponse(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, error: 'Nicht autorisiert.' },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      }
    );
  }

  return new NextResponse('Authentifizierung erforderlich.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname)) {
    const authHeader = request.headers.get('authorization');

    if (!isValidBasicAuth(authHeader)) {
      return unauthorizedResponse(request);
    }
  }

  const response = NextResponse.next();

  if (needsProtectedHeaders(pathname)) {
    applyDemoSecurityHeaders(response);
  }

  return response;
}

export const config = {
  matcher: [
    '/demo/:path*',
    '/access/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/tokens',
    '/api/tokens/:path*',
  ],
};
