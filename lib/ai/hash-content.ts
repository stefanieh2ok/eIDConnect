import { createHash } from 'crypto';

/** SHA-256 für Audit-Trail — kein Klartext personenbezogener Inhalte in Logs. */
export function hashForAudit(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
