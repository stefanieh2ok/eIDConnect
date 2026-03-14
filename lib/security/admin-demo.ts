import { createHmac } from 'crypto';

export const ADMIN_DEMO_COOKIE = 'admin_demo';

const PAYLOAD_SEP = '.';
const DEFAULT_EXPIRES_IN_SEC = 8 * 60 * 60; // 8 Stunden

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Buffer | null {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64');
  } catch {
    return null;
  }
}

/**
 * Erzeugt einen signierten Cookie-Wert für den Admin-Demo-Zugang.
 * Payload: demoId + Ablaufzeit, Signatur mit HMAC-SHA256.
 */
export function createAdminDemoCookieValue(
  secret: string,
  demoId: string,
  expiresInSec: number = DEFAULT_EXPIRES_IN_SEC
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const payload = `${demoId}${PAYLOAD_SEP}${exp}`;
  const sig = createHmac('sha256', secret).update(payload).digest();
  return base64UrlEncode(Buffer.from(payload, 'utf8')) + PAYLOAD_SEP + base64UrlEncode(sig);
}

/**
 * Verifiziert den Admin-Demo-Cookie und gibt die demoId zurück, falls gültig.
 */
export function verifyAdminDemoCookie(
  secret: string,
  cookieValue: string
): { demoId: string } | null {
  if (!cookieValue || !secret) return null;
  const parts = cookieValue.split(PAYLOAD_SEP);
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const payloadBuf = base64UrlDecode(payloadB64);
  const sigBuf = base64UrlDecode(sigB64);
  if (!payloadBuf || !sigBuf) return null;
  const payload = payloadBuf.toString('utf8');
  const [demoId, expStr] = payload.split(PAYLOAD_SEP);
  if (!demoId || !expStr) return null;
  const exp = parseInt(expStr, 10);
  if (Number.isNaN(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  const expectedSig = createHmac('sha256', secret).update(payload).digest();
  if (sigBuf.length !== expectedSig.length || !expectedSig.equals(sigBuf)) return null;
  return { demoId };
}
