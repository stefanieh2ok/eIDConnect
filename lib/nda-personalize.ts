import {
  GOVERNIKUS_COMPANY_ADDRESS_BLOCK,
  GOVERNIKUS_EMAIL_SUFFIX,
  ndaConfig,
} from '@/config/nda';

export function isGovernikusEmail(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase().endsWith(GOVERNIKUS_EMAIL_SUFFIX);
}

/**
 * Block „Empfangende Partei“ im Vertragkopf (zwischen „und“ und „– nachfolgend Empfangende Partei –“).
 */
export function buildNdaReceivingPartyBlock(input: {
  fullName: string | null | undefined;
  email: string | null | undefined;
  company: string | null | undefined;
}): string {
  const name = (input.fullName ?? '').trim() || 'Empfänger';
  const email = (input.email ?? '').trim();
  if (isGovernikusEmail(email)) {
    const lines = [GOVERNIKUS_COMPANY_ADDRESS_BLOCK.trim(), '', `Ansprechpartner: ${name}`];
    if (email) lines.push(`Firmen-E-Mail: ${email}`);
    return lines.join('\n');
  }
  const lines = [name];
  if (email) lines.push(email);
  return lines.join('\n');
}

/**
 * Vollständiger NDA-Vertragstext für Anzeige/PDF: bei Tester-Freunden wird der Governikus-Block
 * durch die natürliche Person ersetzt; bei @governikus.de bleibt der Firmenblock.
 */
export function buildNdaFullContractText(input: {
  fullName: string | null | undefined;
  email: string | null | undefined;
  company: string | null | undefined;
}): string {
  const base = ndaConfig.fullText;
  return base.replace(GOVERNIKUS_COMPANY_ADDRESS_BLOCK, buildNdaReceivingPartyBlock(input));
}

/** Kurzbezeichnung der Organisation, die den Demo-Zugriff innehat (für UI). */
export function describeAccessRecipientOrg(input: {
  email: string | null | undefined;
  company: string | null | undefined;
}): string {
  if (isGovernikusEmail(input.email)) {
    return 'Governikus GmbH & Co. KG';
  }
  const company = (input.company ?? '').trim();
  return company || 'Privatperson / Einzeltest';
}

/**
 * Textblock, der nach dem statischen NDA-Kern angehängt wird (Anzeige, PDF, DocuSign).
 * Der dokumentierte Hash (`getNdaDocumentHash`) bezieht sich weiterhin nur auf den statischen Kern.
 */
export function buildNdaPersonalizationAnnex(input: {
  fullName: string | null | undefined;
  email: string | null | undefined;
  company: string | null | undefined;
}): string {
  const name = (input.fullName ?? '').trim();
  const email = (input.email ?? '').trim();

  const lines: string[] = [];
  lines.push('');
  lines.push('────────────────────────────────────────');
  lines.push('Ergänzung (verbindlicher Bestandteil dieser Vereinbarung)');
  lines.push('');

  if (isGovernikusEmail(email)) {
    if (name) {
      lines.push(`Vor- und Nachname / Ansprechpartner mit Zugriff: ${name}`);
    }
    if (email) {
      lines.push(`Firmen-E-Mail: ${email}`);
    }
    lines.push('');
    lines.push('Firmenanschrift der Empfangenden Partei (Empfangende Partei im Vertragskopf):');
    lines.push(GOVERNIKUS_COMPANY_ADDRESS_BLOCK);
  } else {
    if (name) {
      lines.push(`Name (Empfangende Partei): ${name}`);
    }
    if (email) {
      lines.push(`E-Mail: ${email}`);
    }
  }
  lines.push('────────────────────────────────────────');
  return lines.join('\n');
}
