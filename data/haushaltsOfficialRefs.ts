/**
 * Haushalts-Einstiegspunkte und Kurznachweise für 2026 (Demo-Referenz für Clara).
 *
 * Regel: Keine zusätzlichen Beträge erfinden. `nachweisart` unterscheidet parlamentarische/
 * behördliche Portale, öffentlich-rechtliche Berichterstattung und Presse (journalistisch).
 */

export type HaushaltScopeKey = 'bund' | 'land_saarland' | 'kreis_saarpfalz' | 'kommune_kirkel';

export type Nachweisart = 'parlament' | 'bundesregierung_portal' | 'oeffentlich_rechtlich' | 'presse';

export type VerifizierterHaushaltHinweis = {
  /** Haushaltsjahr, auf das sich der Inhalt bezieht */
  haushaltsjahr: 2026;
  text: string;
  quelleUrl: string;
  quelleBehoerde: string;
  /** ISO-Datum des Quellenabrufs */
  abgerufenAm: string;
  nachweisart: Nachweisart;
};

export type HaushaltBlock = {
  scope: HaushaltScopeKey;
  einstieg: Array<{ label: string; url: string }>;
  verifizierteHinweise: VerifizierterHaushaltHinweis[];
};

const BUND_BMF_2026_URL =
  'https://www.bundesfinanzministerium.de/Web/DE/Themen/Oeffentliche_Finanzen/Bundeshaushalt/Bundeshaushalt-2026/bundeshaushalt-2026.html';

const BUND_BUNDESTAG_2026_URL =
  'https://www.bundestag.de/dokumente/textarchiv/2025/kw46-pa-haushalt-bereinigung-1126856';

const SAARLAND_SR_HAUSHALT_2026_URL =
  'https://www.sr.de/sr/home/nachrichten/politik_wirtschaft/saar-haushalt_2026_2027_wichtigste_daten_100.html';

/** Presse: Kreisumlage Saarpfalz 2026 – journalistisch, keine Ersatz für Kreis-PDF */
const SAARPFALZ_SZ_KREISUMLAGE_2026_URL =
  'https://www.saarbruecker-zeitung.de/saarland/saar-pfalz-kreis/warum-spd-und-cdu-rekord-kreisumlage-im-saarpfalz-kreis-kritisieren_aid-143117363.html';

/** Presse: Kirkel Haushalt 2026 – journalistisch */
const KIRKEL_SZ_HAUSHALT_2026_URL =
  'https://www.saarbruecker-zeitung.de/saarland/saar-pfalz-kreis/kirkel/haushalt-kirkel-2026-beschlossen-keine-steuererhoehungen_aid-145618671.html';

export const HAUSHALT_OFFIZIELL: Record<HaushaltScopeKey, HaushaltBlock> = {
  bund: {
    scope: 'bund',
    einstieg: [
      { label: 'BMF – Informationen Bundeshaushalt 2026', url: BUND_BMF_2026_URL },
      { label: 'Deutscher Bundestag – Dokumentation Haushalt 2026', url: 'https://www.bundestag.de/themen/haushalt' },
      { label: 'bundeshaushalt.de – Haushaltsdaten interaktiv', url: 'https://www.bundeshaushalt.de' },
    ],
    verifizierteHinweise: [
      {
        haushaltsjahr: 2026,
        text:
          'Laut BMF-Seite „Bundeshaushalt 2026“ übersteigen die für 2026 veranschlagten Ausgaben im Bundeshaushalt und im KTF sowie im SVIK mit insgesamt 128,7 Mrd. Euro die entsprechenden Ausgaben des Jahres 2025 deutlich.',
        quelleUrl: BUND_BMF_2026_URL,
        quelleBehoerde: 'Bundesministerium der Finanzen',
        abgerufenAm: '2026-04-19',
        nachweisart: 'bundesregierung_portal',
      },
      {
        haushaltsjahr: 2026,
        text:
          'Der Deutsche Bundestag dokumentiert zur Bereinigungssitzung 2025: Nach Beschluss des Haushaltsausschusses vom 14.11.2025 sind für 2026 Ausgaben in Höhe von 524,54 Milliarden Euro geplant; für 2025 liegt der Soll-Ansatz bei 502,55 Milliarden Euro.',
        quelleUrl: BUND_BUNDESTAG_2026_URL,
        quelleBehoerde: 'Deutscher Bundestag',
        abgerufenAm: '2026-04-19',
        nachweisart: 'parlament',
      },
    ],
  },
  land_saarland: {
    scope: 'land_saarland',
    einstieg: [
      { label: 'Saarland.de – Haushalt und Finanzen (Landesportal)', url: 'https://www.saarland.de/mfw/DE/portale/haushaltundfinanzen/home/home_node.html' },
      { label: 'SR.de – Dossier Landespolitik', url: 'https://www.sr.de/sr/home/nachrichten/index.html' },
    ],
    verifizierteHinweise: [
      {
        haushaltsjahr: 2026,
        text:
          'SR.de fasst den Doppelhaushalt 2026/2027 zusammen: Für 2026 werden Ausgaben von insgesamt gut 6,5 Milliarden Euro, für 2027 knapp 6,7 Milliarden Euro genannt; 2025 betrage der Haushalt samt Nachtrag 6,3 Milliarden Euro. Größter Einzeletat Bildungsministerium 2026: 1,6 Mrd. Euro.',
        quelleUrl: SAARLAND_SR_HAUSHALT_2026_URL,
        quelleBehoerde: 'SR.de (ARD)',
        abgerufenAm: '2026-04-19',
        nachweisart: 'oeffentlich_rechtlich',
      },
    ],
  },
  kreis_saarpfalz: {
    scope: 'kreis_saarpfalz',
    einstieg: [
      { label: 'Saarpfalz-Kreis – Kreistag', url: 'https://www.saarpfalz-kreis.de/politik-verwaltung/der-kreistag/' },
      { label: 'Saarpfalz-Kreis – Startseite', url: 'https://www.saarpfalz-kreis.de/' },
    ],
    verifizierteHinweise: [
      {
        haushaltsjahr: 2026,
        text:
          'Die Saarbrücker Zeitung berichtete zur Kreisumlage im Saarpfalz-Kreis u. a. für 2026 von knapp 140 Millionen Euro (Presse, kein Ersatz für die Kreis-Haushaltsdrucksache).',
        quelleUrl: SAARPFALZ_SZ_KREISUMLAGE_2026_URL,
        quelleBehoerde: 'Saarbrücker Zeitung (Presse)',
        abgerufenAm: '2026-04-19',
        nachweisart: 'presse',
      },
    ],
  },
  kommune_kirkel: {
    scope: 'kommune_kirkel',
    einstieg: [
      { label: 'Gemeinde Kirkel – Satzungen / Haushaltsrecht', url: 'https://www.kirkel.de/rathaus-service/was-erledige-ich-wo/detail/satzungen' },
      { label: 'Ratsinformationssystem Kirkel (RIS)', url: 'https://ratsinfoservice.de/ris/kirkel/' },
      { label: 'Gemeinde Kirkel – Öffentliche Bekanntmachungen', url: 'https://www.kirkel.de/rathaus-service/oeffentliche-bekanntmachungen/archiv-oeffentliche-bekanntmachungen' },
    ],
    verifizierteHinweise: [
      {
        haushaltsjahr: 2026,
        text:
          'Die Saarbrücker Zeitung berichtete zum beschlossenen Haushalt Kirkel 2026 u. a.: Investitionen von knapp vier Millionen Euro; mit Zuschüssen von Bund und Land von etwa 1,95 Millionen Euro; daher Kreditbedarf von gut zwei Millionen Euro unter der Bedingung, dass Förderzusagen eintreffen; keine Steuererhöhungen; u. a. 500.000 Euro für Planungen Solarfreibad Limbach (Presse – verbindliche Beträge in der amtlichen Haushaltsakte prüfen).',
        quelleUrl: KIRKEL_SZ_HAUSHALT_2026_URL,
        quelleBehoerde: 'Saarbrücker Zeitung (Presse)',
        abgerufenAm: '2026-04-19',
        nachweisart: 'presse',
      },
    ],
  },
};

/** Ordnet Demo-Abstimmungskarten-IDs der Haushalts-Ebene zu (Präfixe aus data/constants.ts). */
export function haushaltScopeFromVotingCardId(cardId: string): HaushaltScopeKey {
  if (cardId.startsWith('bund-')) return 'bund';
  if (cardId.startsWith('land-')) return 'land_saarland';
  if (cardId.startsWith('kreis-')) return 'kreis_saarpfalz';
  if (cardId.startsWith('kirkel-')) return 'kommune_kirkel';
  return 'bund';
}

function formatHinweis(v: VerifizierterHaushaltHinweis): string {
  const art =
    v.nachweisart === 'parlament'
      ? 'Parlamentarische Dokumentation'
      : v.nachweisart === 'bundesregierung_portal'
        ? 'Bundesbehörde (Portal)'
        : v.nachweisart === 'oeffentlich_rechtlich'
          ? 'Öffentlich-rechtliche Berichterstattung'
          : 'Presse (journalistisch – keine amtliche Rechtsgrundlage)';
  return `• [${v.haushaltsjahr}] ${v.text} — ${art}; Quelle: ${v.quelleBehoerde}, ${v.quelleUrl} (Abruf: ${v.abgerufenAm})`;
}

/** Textblock für Prompts: nur erlaubte Fakten + Links, explizites Verbot von Erfindungen */
export function buildHaushaltKontextFuerPrompt(scope: HaushaltScopeKey): string {
  const block = HAUSHALT_OFFIZIELL[scope];
  const links = block.einstieg.map((e) => `- ${e.label}: ${e.url}`).join('\n');
  const verified =
    block.verifizierteHinweise.length > 0
      ? block.verifizierteHinweise.map((v) => formatHinweis(v)).join('\n')
      : '• (Keine Einträge – nur amtliche Dokumente unter den Links.)';

  return `
HAUSHALT 2026 – NUR FOLGENDE NACHWEISE (KEINE WEITEREN ZAHLEN ERFINDEN):
Amtliche / journalistische Einstiege:
${links}

Verifizierte Kurznachweise (nur diese verwenden; bei „Presse“ klar als Presse kennzeichnen):
${verified}

VERBOT: Keine weiteren Haushaltsbeträge, keine Schätzungen. Fehlt eine Zahl hier, Nutzer auf RIS/PDF/Landtag/Bundestag verweisen.
`.trim();
}
