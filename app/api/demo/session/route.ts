import { NextResponse } from 'next/server';
import { getActiveDemoSession } from '@/lib/security/session';

const DEMO_ID = 'eidconnect';

/**
 * GET /api/demo/session
 * Liefert die aktuelle Demo-Session (Cookie), falls vorhanden.
 */
export async function GET() {
  const session = await getActiveDemoSession(DEMO_ID);
  if (!session) {
    return NextResponse.json({ session: null }, { status: 200 });
  }
  return NextResponse.json({
    session: {
      sessionId: session.sessionId,
      demoId: session.demoId,
      fullName: session.fullName,
      company: session.company,
      email: session.email,
    },
  });
}
