import { NextRequest, NextResponse } from 'next/server';

// Alles inline, damit keine Imports aus dem Projektpfad nötig sind (vermeidet
// "Cannot find the middleware module" bei Pfaden mit Umlaut wie bürgerapp).

function decodeBasicAuth(authHeader: string | null): { user: string; pass: string } | null {
  if (!authHeader?.startsWith('Basic ')) return null;
  try {
    const base64 = authHeader.slice(6).trim();
    const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decoded = new TextDecoder().decode(bytes);
    const sep = decoded.indexOf(':');
    if (sep === -1) return null;
    return { user: decoded.slice(0, sep), pass: decoded.slice(sep + 1) };
  } catch {
    return null;
  }
}

function isAdminRoute(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return (
    p.startsWith('/admin') ||
    p.startsWith('/api/admin') ||
    p === '/api/tokens' ||
    p.startsWith('/api/tokens/')
  );
}

function needsDemoHeaders(pathname: string): boolean {
  return pathname.startsWith('/demo') || pathname.startsWith('/access');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname)) {
    const user = (process.env.ADMIN_BASIC_USER ?? '').trim();
    const pass = (process.env.ADMIN_BASIC_PASS ?? '').trim();
    const credsConfigured = user.length > 0 && pass.length > 0;

    if (!credsConfigured) {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Admin nicht konfiguriert</title></head><body style="font-family:sans-serif;max-width:520px;margin:2rem auto;padding:1rem;"><h1 style="color:#b91c1c;">Admin-Login nicht konfiguriert</h1><p>Bitte in Vercel unter <strong>Settings → Environment Variables</strong> setzen:</p><ul><li><code>ADMIN_BASIC_USER</code> (z.&nbsp;B. admin)</li><li><code>ADMIN_BASIC_PASS</code> (starkes Passwort)</li></ul><p>Danach Projekt neu deployen.</p></body></html>`;
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ success: false, error: 'ADMIN_BASIC_USER/ADMIN_BASIC_PASS nicht gesetzt.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new NextResponse(html, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const creds = decodeBasicAuth(request.headers.get('authorization'));
    if (!creds || creds.user !== user || creds.pass !== pass) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Nicht autorisiert.' },
          { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' } }
        );
      }
      return new NextResponse('Authentifizierung erforderlich.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      });
    }
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, private, max-age=0');
    return response;
  }

  const response = NextResponse.next();

  if (needsDemoHeaders(pathname)) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const connectSrc = supabaseUrl
      ? `'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co`
      : "'self' https://*.supabase.co wss://*.supabase.co";
    response.headers.set(
      'Content-Security-Policy',
      ["default-src 'self'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "img-src 'self' data: blob: https:", "font-src 'self' data:", "style-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'", `connect-src ${connectSrc}`, "object-src 'none'", "media-src 'self' blob:"].join('; ')
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/demo/:path*',
    '/access/:path*',
    '/admin',
    '/admin/',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/tokens',
    '/api/tokens/:path*',
  ],
};
