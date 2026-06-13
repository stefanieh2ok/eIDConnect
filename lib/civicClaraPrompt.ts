import type { CivicPrefillPacket } from '@/types/civic';

/** Statischer Prompt für Clara Quick Action „Warum diese Stelle?“ (Civic Trust slice). */
export function buildCivicAuthorityWhyPrompt(
  packet: CivicPrefillPacket,
  du: boolean,
): string {
  const address = du ? 'du' : 'Sie';
  const authorityName = packet.authority.name;
  const jurisdiction = packet.authority.jurisdiction.join(', ');
  const contextBlock = packet.contextNotes?.length
    ? `\nKontext-Hinweise: ${packet.contextNotes.join(' ')}`
    : '';

  return [
    `[Civic Trust — Demo-Kontext]`,
    `serviceId: ${packet.serviceId}`,
    `authorityId: ${packet.authorityId}`,
    `Zuständige Stelle: ${authorityName}`,
    `Zuständigkeitsbereich: ${jurisdiction}`,
    contextBlock,
    '',
    `Bitte erkläre ${address} neutral und verständlich, warum für dieses Anliegen diese Stelle zuständig ist.`,
    'Keine Anspruchsprüfung. Keine Rechtsberatung. Demo / nicht amtlich.',
    'Verbindlich entscheidet die zuständige Stelle.',
    'Verweise auf die angezeigten Quellen, nicht auf erfundene Details.',
  ]
    .filter(Boolean)
    .join('\n');
}
