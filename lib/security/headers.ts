/**
 * Security headers for HookAI Civic Demo (global + demo-hardened).
 * Abschreckung und Standard-Härtung, keine Garantien.
 */

export type DemoSecurityHeaders = Record<string, string>;

/** CSP für Next.js + Supabase (+ OpenAI bei Clara/TTS). */
export function getDemoCspHeader(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const connectSrc = supabaseUrl
    ? `'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co https://api.openai.com`
    : "'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com";
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
    "object-src 'none'",
    "media-src 'self' blob:",
  ];
  return parts.join('; ');
}

/** Basis-Sicherheitsheader für alle App-Routen. */
export function getGlobalSecurityHeaders(): DemoSecurityHeaders {
  const headers: DemoSecurityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Content-Security-Policy': getDemoCspHeader(),
  };
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }
  return headers;
}

/** Zusätzliche Demo-/NDA-Routen: no-store, noindex. */
export function getDemoRouteExtraHeaders(): DemoSecurityHeaders {
  return {
    'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'no-referrer',
  };
}

/** @deprecated Alias — nutze getGlobalSecurityHeaders + getDemoRouteExtraHeaders */
export function getDemoSecurityHeaders(): DemoSecurityHeaders {
  return { ...getGlobalSecurityHeaders(), ...getDemoRouteExtraHeaders() };
}

/** Für next.config.js `headers()` — Paare key/value. */
export function getGlobalSecurityHeaderPairs(): { key: string; value: string }[] {
  return Object.entries(getGlobalSecurityHeaders()).map(([key, value]) => ({ key, value }));
}
