/**
 * CommonJS-Export für next.config.js (kein TS-Require nötig).
 * Logik spiegelt lib/security/headers.ts — bei Änderungen beide pflegen.
 */

function getDemoCspHeader() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const connectSrc = supabaseUrl
    ? `'self' ${supabaseUrl} https://*.supabase.co wss://*.supabase.co https://api.openai.com`
    : "'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com";
  return [
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
  ].join('; ');
}

function getGlobalSecurityHeaderPairs() {
  const pairs = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
    { key: 'Content-Security-Policy', value: getDemoCspHeader() },
  ];
  if (process.env.NODE_ENV === 'production') {
    pairs.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    });
  }
  return pairs;
}

module.exports = { getGlobalSecurityHeaderPairs, getDemoCspHeader };
