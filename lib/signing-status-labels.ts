/**
 * Deutsche Bezeichnungen für Signatur-/Umschlag-Status (anbieterneutral).
 * Kann bei Anzeige von API-Statuswerten verwendet werden.
 */
export const SIGNING_STATUS_LABEL_DE: Record<string, string> = {
  draft: 'Vorbereitet',
  created: 'Vorbereitet',
  sent: 'Zur Unterzeichnung versendet',
  delivered: 'Zur Unterzeichnung versendet',
  viewed: 'Geöffnet',
  signed: 'Unterzeichnet',
  completed: 'Unterzeichnet',
  declined: 'Abgelehnt',
  voided: 'Abgebrochen',
  canceled: 'Abgebrochen',
  failed: 'Fehlgeschlagen',
  pending: 'In Bearbeitung',
};

export function signingStatusLabelDe(status: string | undefined | null): string {
  if (!status) return 'In Bearbeitung';
  const key = status.toLowerCase();
  return SIGNING_STATUS_LABEL_DE[key] ?? status;
}
