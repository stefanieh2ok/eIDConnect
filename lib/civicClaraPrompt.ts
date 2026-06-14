import type { CivicPrefillPacket } from '@/types/civic';
import type { CivicClaraContextAction } from '@/lib/civicClaraContext';
import {
  CIVIC_BA_CONTACT_NOTICE,
  CIVIC_BINDING_NOTICE,
  CIVIC_DEMO_NOTICE,
  CIVIC_NO_CLAIM_CHECK,
} from '@/lib/civicCompliance';

function addressMode(du: boolean): string {
  return du ? 'du' : 'Sie';
}

function contextBlock(packet: CivicPrefillPacket): string {
  const jurisdiction = packet.authority.jurisdiction.join(', ');
  const notes = packet.contextNotes?.length
    ? `\nKontext-Hinweise: ${packet.contextNotes.join(' ')}`
    : '';
  return [
    `[Civic Trust — Demo-Kontext]`,
    `serviceId: ${packet.serviceId}`,
    `authorityId: ${packet.authorityId}`,
    `Zuständige Stelle: ${packet.authority.name}`,
    `Zuständigkeitsbereich: ${jurisdiction}`,
    notes,
  ]
    .filter(Boolean)
    .join('\n');
}

function complianceFooter(serviceId: string): string {
  const lines = [
    `${CIVIC_DEMO_NOTICE}.`,
    CIVIC_BINDING_NOTICE,
    'Keine Rechtsberatung. Verweise auf die angezeigten Quellen, nicht auf erfundene Details.',
  ];
  if (serviceId === 'buergergeld-erstantrag') {
    lines.push(CIVIC_NO_CLAIM_CHECK);
  }
  if (serviceId === 'alg1-orientierung') {
    lines.push(CIVIC_BA_CONTACT_NOTICE);
  }
  return lines.join(' ');
}

/** Statischer Prompt für Clara Quick Action „Warum diese Stelle?“. */
export function buildCivicAuthorityWhyPrompt(packet: CivicPrefillPacket, du: boolean): string {
  const address = addressMode(du);
  return [
    contextBlock(packet),
    '',
    `Bitte erkläre ${address} neutral und verständlich, warum für dieses Anliegen diese Stelle zuständig ist.`,
    'Keine Anspruchsprüfung. Keine Rechtsberatung.',
    complianceFooter(packet.serviceId),
  ].join('\n');
}

export function buildCivicMissingDocsPrompt(packet: CivicPrefillPacket, du: boolean): string {
  const address = addressMode(du);
  const missing = packet.missingFields.map((m) => `- ${m.label}: ${m.reason}`).join('\n');
  return [
    contextBlock(packet),
    '',
    `Noch offene Unterlagen/Felder:\n${missing || '—'}`,
    '',
    `Welche Unterlagen fehlen noch für ${address}? Gib eine kurze, neutrale Checkliste.`,
    complianceFooter(packet.serviceId),
  ].join('\n');
}

export function buildCivicPrefillSummaryPrompt(packet: CivicPrefillPacket, du: boolean): string {
  const address = addressMode(du);
  const filled = packet.filledFields.map((f) => `- ${f.label}: ${f.value}`).join('\n');
  const review = packet.reviewFields.map((r) => `- ${r.label}: ${r.note}`).join('\n');
  return [
    contextBlock(packet),
    '',
    `Vorausgefüllte Felder:\n${filled || '—'}`,
    review ? `\nPrüfhinweise:\n${review}` : '',
    '',
    `Was wurde für ${address} vorausgefüllt? Erkläre kurz, was Demo-Daten sind und was vor Vorsprache geprüft werden muss.`,
    complianceFooter(packet.serviceId),
  ].join('\n');
}

export function buildCivicSourcePrompt(packet: CivicPrefillPacket, du: boolean): string {
  const address = addressMode(du);
  const sources = packet.sourceRefs
    .map((r) => `- ${r.label}: ${r.url} (Prüfstand: ${r.lastVerifiedAt}, ${r.confidenceLevel})`)
    .join('\n');
  return [
    contextBlock(packet),
    '',
    `Quellen:\n${sources}`,
    '',
    `Zeige ${address} die relevanten Quellen und erkläre kurz, was geprüft wurde.`,
    complianceFooter(packet.serviceId),
  ].join('\n');
}

export function buildCivicClaraPrompt(
  packet: CivicPrefillPacket,
  du: boolean,
  action: CivicClaraContextAction,
): string {
  switch (action) {
    case 'why-authority':
      return buildCivicAuthorityWhyPrompt(packet, du);
    case 'missing-docs':
      return buildCivicMissingDocsPrompt(packet, du);
    case 'prefill-summary':
      return buildCivicPrefillSummaryPrompt(packet, du);
    case 'show-source':
      return buildCivicSourcePrompt(packet, du);
    default:
      return buildCivicAuthorityWhyPrompt(packet, du);
  }
}
