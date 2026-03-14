import { NextRequest } from 'next/server';

/**
 * Prüft, ob die Anfrage von einem Admin kommt:
 * - ADMIN_SECRET gesetzt und Header x-admin-secret stimmt überein, oder
 * - (für Route Handler mit Supabase) eingeloggter User – wird getrennt geprüft
 */
export function isAuthorizedAdminRequest(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return false;
  }

  const headerSecret = request.headers.get('x-admin-secret');
  return headerSecret === adminSecret;
}
