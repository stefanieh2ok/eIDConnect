import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import { getNdaDocumentHash, ndaConfig } from '@/config/nda';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

type Body = {
  fullName: string;
  email: string;
  company?: string;
  demoId?: string;
  expiresInDays?: number;
  requireDocusign?: boolean;
};

function generateRawAccessToken(): string {
  return `dm_${randomBytes(24).toString('hex')}`;
}

/**
 * POST /api/admin/create-access-link
 * Erstellt einen Zugangs-Link (NDA/ DocuSign). Admin Basic Auth erforderlich.
 */
export async function POST(request: NextRequest) {
  if (!isValidBasicAuth(request.headers.get('authorization'))) {
    return NextResponse.json(
      { success: false, error: 'Nicht autorisiert.' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' } }
    );
  }

  try {
    const body = (await request.json()) as Body;
    const fullName = (body.fullName ?? '').trim();
    const email = (body.email ?? '').trim();

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'Vorname/Nachname und E-Mail sind Pflichtfelder.' },
        { status: 400 }
      );
    }

    const rawToken = generateRawAccessToken();
    const tokenHash = sha256(rawToken);
    const demoId = (body.demoId ?? process.env.DEMO_ACCESS_DEFAULT_ID ?? 'eidconnect-v1').trim();
    const expiresInDays = Math.max(1, Number(body.expiresInDays) || 30);
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const requireDocusign = body.requireDocusign !== false;

    const { error } = await supabaseAdmin.from('demo_access_tokens').insert({
      token_hash: tokenHash,
      demo_id: demoId,
      full_name: fullName,
      company: (body.company ?? '').trim() || null,
      email,
      nda_version: ndaConfig.version,
      nda_document_hash: getNdaDocumentHash(),
      expires_at: expiresAt,
      max_views: requireDocusign ? 10 : 50,
      max_devices: 1,
      is_revoked: false,
      require_docusign: requireDocusign,
    });

    if (error) {
      console.error('create-access-link failed:', error);
      return NextResponse.json(
        { success: false, error: 'Link konnte nicht erstellt werden.' },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.ACCESS_LINK_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin;

    const accessUrl = `${baseUrl.replace(/\/$/, '')}/access/${rawToken}`;

    return NextResponse.json({
      success: true,
      accessUrl,
      rawToken,
      expiresAt,
    });
  } catch (e) {
    console.error('create-access-link:', e);
    return NextResponse.json(
      { success: false, error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
