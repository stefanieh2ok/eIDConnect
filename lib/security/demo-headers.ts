import { NextResponse } from 'next/server';

export function applyDemoSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const connectSrc = supabaseUrl
    ? `'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co`
    : "'self' https://*.supabase.co wss://*.supabase.co";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "media-src 'self' blob:",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}
