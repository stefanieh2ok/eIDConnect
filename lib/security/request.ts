import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

export function buildDeviceFingerprint(ip: string, userAgent: string): string {
  return createHash('sha256').update(`${ip}::${userAgent}`, 'utf8').digest('hex');
}
