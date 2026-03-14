/**
 * Security headers for protected demo routes.
 * Abschreckung und Standard-Härtung, keine Garantien.
 */

export type DemoSecurityHeaders = Record<string, string>;

/** Headers für Demo-Responses (no-store, no framing, no referrer). */
export function getDemoSecurityHeaders(): DemoSecurityHeaders {
  return {
    'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };
}

/** CSP für Next.js + Supabase (strikt, Anpassung bei Bedarf). */
export function getDemoCspHeader(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const connectSrc = supabaseUrl
    ? `'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co`
    : "'self' https://*.supabase.co wss://*.supabase.co";
  const parts = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  return parts.join('; ');
}
