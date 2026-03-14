import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MAX_PENDING_PER_EMAIL = 2;
const SETUP_LINK = '/setup';

function isTableMissingError(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('relation') || err.code === '42P01';
}

function isNetworkError(err: { message?: string } | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? '').toLowerCase();
  return msg.includes('fetch') || msg.includes('network') || msg.includes('econnrefused');
}

function isAuthError(err: { message?: string; status?: number } | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? '').toLowerCase();
  return err.status === 401 || msg.includes('jwt') || msg.includes('invalid') || msg.includes('unauthorized') || msg.includes('api key');
}

type Body = {
  fullName?: string;
  email?: string;
  company?: string;
};

function jsonError(
  error: string,
  status: number,
  opts?: { setupLink?: string; detail?: string }
) {
  return NextResponse.json(
    {
      success: false,
      error,
      setupLink: opts?.setupLink ?? SETUP_LINK,
      ...(opts?.detail && { detail: opts.detail }),
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return jsonError(
        'Zugangsanfragen sind derzeit nicht möglich. Bitte NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.',
        503,
        { setupLink: SETUP_LINK }
      );
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return jsonError('Ungültige Anfrage.', 400);
    }

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : null;

    if (!fullName || fullName.length < 2) {
      return jsonError('Bitte einen gültigen Namen angeben.', 400);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError('Bitte eine gültige E-Mail-Adresse angeben.', 400);
    }

    let count = 0;
    try {
      const { count: c, error: countError } = await supabaseAdmin
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .eq('status', 'pending');
      if (countError) {
        if (isTableMissingError(countError)) {
          return jsonError(
            'Die Tabelle für Zugangsanfragen fehlt noch. Bitte zuerst anlegen (siehe Link unten).',
            503,
            { setupLink: SETUP_LINK }
          );
        }
        if (isAuthError(countError)) {
          return jsonError(
            'Service-Role-Key ungültig oder abgelaufen. In Supabase: Project Settings → API → Service Role (secret) → Reveal → kompletten Key kopieren, in .env.local eintragen, Server neu starten.',
            503,
            { setupLink: SETUP_LINK, detail: countError.message }
          );
        }
        if (isNetworkError(countError)) {
          return jsonError(
            'Verbindung zu Supabase fehlgeschlagen. Bitte .env.local prüfen (Supabase-URL und Service-Role-Key). Nach Änderung an .env.local: Server neu starten (Strg+C, dann npm run dev).',
            503,
            { setupLink: SETUP_LINK, detail: countError.message }
          );
        }
        return jsonError(
          'Supabase-Fehler beim Prüfen der Anfragen.',
          503,
          { setupLink: SETUP_LINK, detail: countError.message }
        );
      } else {
        count = c ?? 0;
      }
    } catch (e) {
      const err = e as { message?: string };
      if (isNetworkError(err)) {
        return jsonError(
          'Verbindung zu Supabase fehlgeschlagen. Bitte Supabase-Einstellungen in .env.local prüfen.',
          503,
          { setupLink: SETUP_LINK, detail: err?.message }
        );
      }
      throw e;
    }

    if (count >= MAX_PENDING_PER_EMAIL) {
      return jsonError(
        'Sie haben bereits eine offene Anfrage. Bitte warten Sie auf die Freigabe oder schreiben Sie uns.',
        429
      );
    }

    const result = await supabaseAdmin.from('access_requests').insert({
      full_name: fullName,
      email,
      company: company ?? null,
      status: 'pending',
    });

    if (result.error) {
      if (isTableMissingError(result.error)) {
        return jsonError(
          'Die Tabelle für Zugangsanfragen fehlt noch. Bitte zuerst anlegen (siehe Link unten).',
          503,
          { setupLink: SETUP_LINK }
        );
      }
      if (isAuthError(result.error)) {
        return jsonError(
          'Service-Role-Key ungültig. Supabase → API → Service Role (Reveal) → kompletten Key in .env.local, dann Server neu starten.',
          503,
          { setupLink: SETUP_LINK }
        );
      }
      if (isNetworkError(result.error)) {
        return jsonError(
          'Verbindung zu Supabase fehlgeschlagen. .env.local prüfen, dann Server neu starten.',
          503,
          { setupLink: SETUP_LINK, detail: result.error.message }
        );
      }
      console.error('Request-access insert failed:', result.error);
      return jsonError(
        'Anfrage konnte nicht gespeichert werden.',
        500,
        { setupLink: SETUP_LINK, detail: result.error.message }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ihre Anfrage wurde gesendet. Sie erhalten eine E-Mail, sobald Ihr Zugang freigegeben wurde.',
    });
  } catch (error) {
    const err = error as { message?: string };
    console.error('Request-access failed:', error);
    if (isNetworkError(err)) {
      return jsonError(
        'Verbindung zu Supabase fehlgeschlagen. Bitte .env.local prüfen (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).',
        503,
        { setupLink: SETUP_LINK, detail: err?.message }
      );
    }
    return jsonError(
      'Ein unerwarteter Fehler ist aufgetreten. Bitte später erneut versuchen oder /setup prüfen.',
      500,
      { setupLink: SETUP_LINK, detail: err?.message }
    );
  }
}
