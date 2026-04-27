import { NextResponse } from 'next/server';
import { NDA_PDF_FILENAME } from '@/lib/branding';
import { buildNdaPdfBuffer } from '@/lib/nda-pdf';
import { findAccessTokenByRawToken } from '@/lib/security/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';
    let meta:
      | {
          recipientName?: string;
          recipientEmail?: string;
          recipientCompany?: string;
          accessId?: string;
        }
      | undefined;
    if (token) {
      const rec = await findAccessTokenByRawToken(token);
      if (rec) {
        meta = {
          recipientName: rec.full_name,
          recipientEmail: rec.email,
          recipientCompany: rec.company ?? undefined,
          accessId: rec.id,
        };
      }
    }

    const result = await buildNdaPdfBuffer({ withSignatureBlock: true, meta });
    const buffer = result.buffer;
    // NextResponse erwartet BodyInit; Buffer-Typen sind in manchen TS-Setups zu streng.
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${NDA_PDF_FILENAME}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[NDA PDF] Fehler beim Generieren:', err);
    return NextResponse.json(
      { error: 'PDF konnte nicht generiert werden.' },
      { status: 500 }
    );
  }
}
