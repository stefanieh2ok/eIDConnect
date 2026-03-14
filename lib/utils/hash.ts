/**
 * SHA-256 Hash für Beweis-Reports (Integrität, append-only).
 * Kein qualifizierter Zeitstempel – verbessert nur die interne Beweiskette.
 */

export async function sha256Hex(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = new TextEncoder().encode(data);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Node (API Route)
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

export function sha256HexSync(data: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(data, 'utf8').digest('hex');
}
