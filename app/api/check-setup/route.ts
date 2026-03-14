import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/check-setup
 * Prüft: Env-Variablen, Supabase-Verbindung, Tabelle access_requests.
 * Keine sensiblen Daten in der Antwort.
 */
export async function GET() {
  const checks: { step: string; ok: boolean; message: string }[] = [];
  let status: 'ok' | 'env_missing' | 'connection_failed' | 'table_missing' = 'ok';

  const hasUrl = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.trim().startsWith('https://')
  );
  const hasKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20);

  if (!hasUrl) {
    checks.push({
      step: 'NEXT_PUBLIC_SUPABASE_URL',
      ok: false,
      message: 'Fehlt oder ungültig. Muss mit https:// beginnen (z.B. https://xxx.supabase.co). In .env.local setzen.',
    });
    status = 'env_missing';
  } else {
    checks.push({ step: 'NEXT_PUBLIC_SUPABASE_URL', ok: true, message: 'Gesetzt.' });
  }

  if (!hasKey) {
    checks.push({
      step: 'SUPABASE_SERVICE_ROLE_KEY',
      ok: false,
      message: 'Fehlt oder zu kurz. Supabase Dashboard → Project Settings → API → service_role (secret) kopieren. In .env.local setzen.',
    });
    status = 'env_missing';
  } else {
    checks.push({ step: 'SUPABASE_SERVICE_ROLE_KEY', ok: true, message: 'Gesetzt.' });
  }

  if (status !== 'ok') {
    return NextResponse.json({
      ok: false,
      status,
      checks,
      nextStep: 'In .env.local eintragen: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY. Dann Server neu starten (npm run dev).',
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('access_requests')
      .select('id')
      .limit(1);

    if (error) {
      const msg = (error.message || '').toLowerCase();
      const errStatus = (error as { status?: number }).status;
      if (msg.includes('does not exist') || msg.includes('relation') || error.code === '42P01') {
        checks.push({
          step: 'Tabelle access_requests',
          ok: false,
          message: 'Tabelle fehlt. Bitte SQL auf /setup kopieren und in Supabase SQL Editor ausführen.',
        });
        status = 'table_missing';
      } else if (errStatus === 401 || msg.includes('jwt') || msg.includes('invalid') || msg.includes('api key')) {
        checks.push({
          step: 'SUPABASE_SERVICE_ROLE_KEY',
          ok: false,
          message: 'Key ungültig oder abgelaufen. Supabase → Project Settings → API → Service Role (secret) → Reveal → kompletten Key kopieren, in .env.local eintragen (ohne Anführungszeichen), Server neu starten.',
        });
        status = 'connection_failed';
      } else if (msg.includes('fetch') || msg.includes('network')) {
        checks.push({
          step: 'Verbindung zu Supabase',
          ok: false,
          message: 'Verbindung fehlgeschlagen. URL und Service-Role-Key in .env.local prüfen. Nach Änderung: Server neu starten (Strg+C, dann npm run dev).',
        });
        status = 'connection_failed';
      } else {
        checks.push({ step: 'Supabase-Abfrage', ok: false, message: error.message || 'Unbekannter Fehler.' });
        status = 'connection_failed';
      }
    } else {
      checks.push({
        step: 'Tabelle access_requests',
        ok: true,
        message: 'Vorhanden. Zugang anfordern sollte funktionieren.',
      });
    }
  } catch (e) {
    const err = e as { message?: string };
    const msg = (err?.message || '').toLowerCase();
    checks.push({
      step: 'Verbindung zu Supabase',
      ok: false,
      message: msg.includes('fetch') || msg.includes('econnrefused')
        ? 'Server kann Supabase nicht erreichen. URL und Key in .env.local prüfen (Supabase Dashboard → Project Settings → API).'
        : (err?.message || 'Fehler beim Verbinden.'),
    });
    status = 'connection_failed';
  }

  return NextResponse.json({
    ok: status === 'ok',
    status,
    checks,
    nextStep:
      status === 'table_missing'
        ? 'Seite /setup öffnen → SQL kopieren → Supabase Dashboard → SQL Editor → einfügen → Run.'
        : status === 'connection_failed'
          ? '.env.local prüfen: NEXT_PUBLIC_SUPABASE_URL = https://dein-projekt.supabase.co (ohne Anführungszeichen), SUPABASE_SERVICE_ROLE_KEY = langer Key aus Supabase. Danach Server neu starten.'
          : undefined,
  });
}
