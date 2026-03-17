import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

/**
 * GET /api/admin/verify
 * Liefert 200 nur bei gültiger Basic-Auth (für Client-seitige Absicherung des Admin-Bereichs).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!isValidBasicAuth(authHeader)) {
    return NextResponse.json(
      { ok: false, error: 'Nicht autorisiert.' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' } }
    );
  }
  return NextResponse.json({ ok: true });
}
