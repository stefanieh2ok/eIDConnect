import { NextRequest, NextResponse } from 'next/server';
import {
  createDevDemoEnterResponse,
} from '@/lib/security/dev-demo-enter';
import {
  isDevDemoAutoEnterEnabled,
} from '@/lib/security/dev-demo-enter-path';

import { getDefaultDemoId } from '@/lib/security/dev-demo-enter-path';

const DEFAULT_DEMO_ID = getDefaultDemoId();

/**
 * GET /api/dev/enter-demo?demo_id=...
 * Lokaler Dev-Einstieg: setzt demo_session-Cookie ohne NDA/Admin-Secret.
 * Nur in NODE_ENV=development verfügbar.
 */
export async function GET(request: NextRequest) {
  if (!isDevDemoAutoEnterEnabled()) {
    return NextResponse.redirect(new URL('/access/denied?reason=invalid', request.url));
  }

  const demoId =
    request.nextUrl.searchParams.get('demo_id')?.trim() || DEFAULT_DEMO_ID;

  return createDevDemoEnterResponse(request.url, demoId);
}
