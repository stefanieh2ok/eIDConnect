import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import { getNdaConfigForRecipient, getNdaDocumentHash } from '@/config/nda';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

type CreateTokenPayload = {
  fullName: string;
  company?: string;
  email: string;
  demoId: string;
  expiresInDays?: number;
  maxViews?: number;
  maxDevices?: number;
};

function generateRawAccessToken(): string {
  return `dm_${randomBytes(24).toString('hex')}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!isValidBasicAuth(request.headers.get('authorization'))) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert.' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
        }
      );
    }

    const body = (await request.json()) as CreateTokenPayload;

    if (!body.fullName || !body.email || !body.demoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'fullName, email und demoId sind Pflichtfelder.',
        },
        { status: 400 }
      );
    }

    const rawToken = generateRawAccessToken();
    const tokenHash = sha256(rawToken);
    const expiresInDays = body.expiresInDays ?? 30;
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const normalizedCompany = body.company?.trim() ?? null;
    const ndaCfg = getNdaConfigForRecipient({
      email: body.email.trim(),
      company: normalizedCompany,
    });

    const { error } = await supabaseAdmin.from('demo_access_tokens').insert({
      token_hash: tokenHash,
      demo_id: body.demoId,
      full_name: body.fullName.trim(),
      company: normalizedCompany,
      email: body.email.trim(),
      nda_version: ndaCfg.version,
      nda_document_hash: getNdaDocumentHash({
        email: body.email.trim(),
        company: normalizedCompany,
      }),
      expires_at: expiresAt,
      max_views: body.maxViews ?? 10,
      max_devices: body.maxDevices ?? 1,
      is_revoked: false,
    });

    if (error) {
      console.error('Token creation failed:', error);
      return NextResponse.json(
        { success: false, error: 'Token konnte nicht erstellt werden.' },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.ACCESS_LINK_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get('x-forwarded-proto') && request.headers.get('host')
        ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}`
        : new URL(request.url).origin);

    return NextResponse.json({
      success: true,
      rawToken,
      accessUrl: `${baseUrl}/access/${rawToken}`,
      expiresAt,
    });
  } catch (error) {
    console.error('Token route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Token-Erstellung fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
