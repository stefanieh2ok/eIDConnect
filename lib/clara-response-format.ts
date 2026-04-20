import type { AddressMode } from '@/lib/clara-system-prompt';

const REQUIRED_BLOCK_MARKERS = [
  /1\)\s*Kontext/i,
  /2\)\s*Sachliche Information/i,
  /3\)\s*Beteiligungsmoeglichkeit/i,
  /4\)\s*Quellenhinweis/i,
  /5\)\s*Transparenzhinweis/i,
];

export function isStructuredClaraResponse(text: string): boolean {
  const normalized = text || '';
  return REQUIRED_BLOCK_MARKERS.every((rx) => rx.test(normalized));
}

export type ClaraAnswerSection = {
  id: number;
  title: string;
  body: string;
};

/**
 * Zerlegt Antworten im 5-Block-Format für die UI (Clara-Chat).
 * Gibt null zurück, wenn kein erkennbares Strukturformat vorliegt.
 */
export function parseClaraStructuredResponse(text: string): ClaraAnswerSection[] | null {
  const raw = (text || '').trim();
  if (!raw || !/[1-5]\)\s/.test(raw)) return null;
  const parts = raw.split(/\n(?=[1-5]\)\s)/);
  const blocks: ClaraAnswerSection[] = [];
  for (const part of parts) {
    const p = part.trim();
    const m = p.match(/^([1-5])\)\s*([^\n]*)(?:\n([\s\S]*))?$/);
    if (!m) continue;
    blocks.push({
      id: Number(m[1]),
      title: (m[2] || '').trim() || `Abschnitt ${m[1]}`,
      body: (m[3] || '').trim(),
    });
  }
  return blocks.length ? blocks : null;
}

export function ensureStructuredClaraResponse(text: string, addressMode: AddressMode): string {
  const cleaned = (text || '').trim();
  if (isStructuredClaraResponse(cleaned)) return cleaned;

  const sourceFallback =
    /laut\s+[A-ZÄÖÜa-zäöü]/.test(cleaned) || /Bundeswahlleiter|Landesbehoerde|Wahlleitung|offizielle/i.test(cleaned)
      ? cleaned.match(/(laut[^\n.]*[.\n]?)/i)?.[1]?.trim() || 'laut zustaendiger offizieller Stelle'
      : 'Dazu liegen mir keine gesicherten offiziellen Informationen vor.';

  const participation = 'In dieser Demo werden Beteiligungswege konzeptionell vorgesehen dargestellt; eine reale digitale Stimmabgabe wird nicht angeboten.';
  const transparency = 'Dies ist eine KI-gestuetzte Zusammenfassung auf Basis offizieller Informationen.';
  const contextLine =
    addressMode === 'sie'
      ? 'Es geht um eine Anfrage zur demokratischen Orientierung in Deutschland.'
      : 'Es geht um eine Anfrage zur demokratischen Orientierung in Deutschland.';

  const factual = cleaned || 'Dazu liegen mir keine gesicherten Informationen vor.';

  return [
    '1) Kontext',
    contextLine,
    '',
    '2) Sachliche Information / Verfahrenserklaerung',
    factual,
    '',
    '3) Beteiligungsmoeglichkeit',
    participation,
    '',
    '4) Quellenhinweis',
    sourceFallback,
    '',
    '5) Transparenzhinweis',
    transparency,
  ].join('\n');
}
