import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_DEMO_COOKIE,
  createAdminDemoCookieValue,
} from '@/lib/security/admin-demo';

const DEFAULT_DEMO_ID = process.env.DEMO_ACCESS_DEFAULT_ID ?? 'eidconnect-v1';

/**
 * GET /api/admin/open-demo[?demo_id=...]
 *
 * Admin-Shortcut: Oeffnet die Demo direkt, ohne NDA/DocuSign und ohne
 * zusaetzliche Anmeldung. Die Middleware erzwingt bereits Basic Auth auf
 * /api/admin/*, deshalb ist der Aufruf implizit fuer den eingeloggten Admin
 * abgesichert - kein separater Secret-Parameter noetig, kein Secret in URL
 * oder Clipboard.
 *
 * Der gesetzte Cookie gilt 8 Stunden und bypasst die NDA-Acceptance-Pflicht
 * in /demo/[demoId], damit der Admin in der Tester-Liste auf einen Klick
 * in der App landet.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_DEMO_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'ADMIN_DEMO_SECRET ist nicht gesetzt. In Vercel → Environment Variables eintragen und neu deployen.',
      },
      { status: 503 },
    );
  }

  const demoId =
    request.nextUrl.searchParams.get('demo_id')?.trim() || DEFAULT_DEMO_ID;

  const cookieValue = createAdminDemoCookieValue(secret, demoId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUrl = new URL(
    `/demo/${encodeURIComponent(demoId)}`,
    baseUrl,
  );

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(ADMIN_DEMO_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
  return response;
}
