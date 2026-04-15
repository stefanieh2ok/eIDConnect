import { NextResponse } from 'next/server';
import { buildNdaPdfBuffer } from '@/lib/nda-pdf';

/**
 * GET /api/legal/nda-pdf
 * Öffentlicher Download: statischer NDA-Kern ohne Unterschriftsblock (keine Personalisierung).
 * Personalisierte Ergänzung mit Name/E-Mail nur auf der Zugangsseite /access/[token] bzw. DocuSign.
 */
export async function GET() {
  try {
    const buffer = await buildNdaPdfBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="eID-Demo-Connect-Vertraulichkeitsvereinbarung.pdf"',
      },
    });
  } catch (e) {
    console.error('nda-pdf GET failed:', e);
    return NextResponse.json({ error: 'PDF konnte nicht erzeugt werden.' }, { status: 500 });
  }
}
