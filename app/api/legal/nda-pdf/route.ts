import { NextResponse } from 'next/server';
import { NDA_PDF_FILENAME } from '@/lib/branding';
import { buildNdaPdfBuffer } from '@/lib/nda-pdf';

// Backwards-compatibility: older UI versions may still link to /api/legal/nda-pdf
// instead of the current /api/nda/download.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await buildNdaPdfBuffer({ withSignatureBlock: true });
    const buffer = result.buffer;
    // NextResponse erwartet BodyInit; Buffer-Typen sind in manchen TS-Setups zu streng.
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${NDA_PDF_FILENAME}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[NDA PDF alias] Fehler beim Generieren:', err);
    return NextResponse.json(
      { error: 'PDF konnte nicht generiert werden.' },
      { status: 500 }
    );
  }
}

