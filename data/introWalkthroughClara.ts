import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';

/**
 * Pro Walkthrough-Screen: UI (short/long) und **Spoken** (`speakSegments*`) getrennt.
 * TTS nutzt nur `speakSegments*` — kurze Sätze, 2–3 pro Szene.
 */
export type WalkthroughClaraBlock = {
  label: string;
  line10sDu: string;
  line10sSie: string;
  shortDu: string;
  shortSie: string;
  longDu: string;
  longSie: string;
  speakSegmentsDu: readonly string[];
  speakSegmentsSie: readonly string[];
};

export const INTRO_WALKTHROUGH_CLARA: Record<IntroOverlayStepId, WalkthroughClaraBlock> = {
  intro: {
    label: 'HookAI Civic',
    line10sDu: 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.',
    line10sSie: 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.',
    shortDu:
      'Willkommen bei HookAI Civic. Clara führt dich durch Orientierung, Meldungen, Beteiligung und mehr.',
    shortSie:
      'Willkommen bei HookAI Civic. Clara führt Sie durch Orientierung, Meldungen, Beteiligung und mehr.',
    longDu:
      'Willkommen bei HookAI Civic. Ich bin Clara. Diese App hilft dir, Verwaltung besser zu verstehen — von Orientierung bis Beteiligung.',
    longSie:
      'Willkommen bei HookAI Civic. Ich bin Clara. Diese App hilft Ihnen, Verwaltung besser zu verstehen — von Orientierung bis Beteiligung.',
    speakSegmentsDu: [
      'Willkommen bei HookAI Civic. Ich bin Clara.',
      'Diese App hilft dir, Verwaltung besser zu verstehen — von Orientierung bis Beteiligung.',
    ],
    speakSegmentsSie: [
      'Willkommen bei HookAI Civic. Ich bin Clara.',
      'Diese App hilft Ihnen, Verwaltung besser zu verstehen — von Orientierung bis Beteiligung.',
    ],
  },
  wegweiser: {
    label: 'Wegweiser',
    line10sDu: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
    line10sSie: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
    shortDu: 'Nehmen wir ein echtes Beispiel: Du bekommst ein Baby.',
    shortSie: 'Nehmen wir ein echtes Beispiel: Sie bekommen ein Baby.',
    longDu:
      'Nehmen wir ein echtes Beispiel: Du bekommst ein Baby. Der Wegweiser zeigt dir, welche Behördenschritte jetzt wichtig werden könnten.',
    longSie:
      'Nehmen wir ein echtes Beispiel: Sie bekommen ein Baby. Der Wegweiser zeigt Ihnen, welche Behördenschritte jetzt wichtig werden könnten.',
    speakSegmentsDu: [
      'Nehmen wir ein echtes Beispiel: Du bekommst ein Baby.',
      'Der Wegweiser zeigt dir, welche Behördenschritte jetzt wichtig werden könnten.',
    ],
    speakSegmentsSie: [
      'Nehmen wir ein echtes Beispiel: Sie bekommen ein Baby.',
      'Der Wegweiser zeigt Ihnen, welche Behördenschritte jetzt wichtig werden könnten.',
    ],
  },
  profil: {
    label: 'Profil',
    line10sDu: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
    line10sSie: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
    shortDu: 'Freiwilliges Kurzprofil — nur zur besseren Sortierung.',
    shortSie: 'Freiwilliges Kurzprofil — nur zur besseren Sortierung.',
    longDu:
      'Wenn du möchtest, kannst du freiwillig ein kurzes Profil ergänzen. Diese Angaben helfen nur beim Sortieren — daraus entsteht keine Bewertung.',
    longSie:
      'Wenn Sie möchten, können Sie freiwillig ein kurzes Profil ergänzen. Diese Angaben helfen nur beim Sortieren — daraus entsteht keine Bewertung.',
    speakSegmentsDu: [
      'Wenn du möchtest, kannst du freiwillig ein kurzes Profil ergänzen.',
      'Diese Angaben helfen nur beim Sortieren — daraus entsteht keine Bewertung.',
    ],
    speakSegmentsSie: [
      'Wenn Sie möchten, können Sie freiwillig ein kurzes Profil ergänzen.',
      'Diese Angaben helfen nur beim Sortieren — daraus entsteht keine Bewertung.',
    ],
  },
  behoerdenweg: {
    label: 'Behördenweg',
    line10sDu: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
    line10sSie: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
    shortDu: 'Aus deiner Lebenslage entsteht eine einfache Checkliste.',
    shortSie: 'Aus Ihrer Lebenslage entsteht eine einfache Checkliste.',
    longDu:
      'Aus deiner Lebenslage entsteht eine einfache Checkliste. Du siehst, welche Stelle zuständig sein könnte und welche Unterlagen häufig gebraucht werden.',
    longSie:
      'Aus Ihrer Lebenslage entsteht eine einfache Checkliste. Sie sehen, welche Stelle zuständig sein könnte und welche Unterlagen häufig gebraucht werden.',
    speakSegmentsDu: [
      'Aus deiner Lebenslage entsteht eine einfache Checkliste.',
      'Du siehst, welche Stelle zuständig sein könnte und welche Unterlagen häufig gebraucht werden.',
    ],
    speakSegmentsSie: [
      'Aus Ihrer Lebenslage entsteht eine einfache Checkliste.',
      'Sie sehen, welche Stelle zuständig sein könnte und welche Unterlagen häufig gebraucht werden.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
    line10sSie: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
    shortDu: 'Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    shortSie: 'Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    longDu:
      'Wenn vor Ort etwas nicht stimmt, kannst du es strukturiert melden. Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    longSie:
      'Wenn vor Ort etwas nicht stimmt, können Sie es strukturiert melden. Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    speakSegmentsDu: [
      'Wenn vor Ort etwas nicht stimmt, kannst du es strukturiert melden.',
      'Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    ],
    speakSegmentsSie: [
      'Wenn vor Ort etwas nicht stimmt, können Sie es strukturiert melden.',
      'Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    ],
  },
  abstimmen: {
    label: 'Abstimmungen',
    line10sDu: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
    line10sSie: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
    shortDu: 'Der Daumen zeigt nur: Deine Beteiligung wurde erfasst.',
    shortSie: 'Der Daumen zeigt nur: Ihre Beteiligung wurde erfasst.',
    longDu:
      'Nach deiner Teilnahme erscheint eine kurze Bestätigung. Der Daumen zeigt nur: Deine Beteiligung wurde erfasst. Die Punkte stehen für Mitwirkung.',
    longSie:
      'Nach Ihrer Teilnahme erscheint eine kurze Bestätigung. Der Daumen zeigt nur: Ihre Beteiligung wurde erfasst. Die Punkte stehen für Mitwirkung.',
    speakSegmentsDu: [
      'Nach deiner Teilnahme erscheint eine kurze Bestätigung.',
      'Der Daumen zeigt nur: Deine Beteiligung wurde erfasst.',
      'Die Punkte stehen für Mitwirkung — nicht für eine Meinung.',
    ],
    speakSegmentsSie: [
      'Nach Ihrer Teilnahme erscheint eine kurze Bestätigung.',
      'Der Daumen zeigt nur: Ihre Beteiligung wurde erfasst.',
      'Die Punkte stehen für Mitwirkung — nicht für eine Meinung.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Wahlvorschau — keine echte Stimmabgabe.',
    line10sSie: 'Wahlvorschau — keine echte Stimmabgabe.',
    shortDu: 'Stimmzettel verstehen. Informationen öffnen und Programme vergleichen.',
    shortSie: 'Stimmzettel verstehen. Informationen öffnen und Programme vergleichen.',
    longDu:
      'Das ist keine echte Stimmabgabe. Du kannst sehen, wie ein Stimmzettel aufgebaut ist, Informationen öffnen und Programme vergleichen. Die Markierung ist nur ein neutrales Beispiel — keine Empfehlung.',
    longSie:
      'Das ist keine echte Stimmabgabe. Sie können sehen, wie ein Stimmzettel aufgebaut ist, Informationen öffnen und Programme vergleichen. Die Markierung ist nur ein neutrales Beispiel — keine Empfehlung.',
    speakSegmentsDu: [
      'Das ist keine echte Stimmabgabe.',
      'Du kannst sehen, wie ein Stimmzettel aufgebaut ist, Informationen öffnen und Programme vergleichen.',
      'Die Markierung ist nur ein neutrales Beispiel — keine Empfehlung.',
    ],
    speakSegmentsSie: [
      'Das ist keine echte Stimmabgabe.',
      'Sie können sehen, wie ein Stimmzettel aufgebaut ist, Informationen öffnen und Programme vergleichen.',
      'Die Markierung ist nur ein neutrales Beispiel — keine Empfehlung.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Fristen und Beteiligungen an einem Ort.',
    line10sSie: 'Fristen und Beteiligungen an einem Ort.',
    shortDu: 'Fristen, Beteiligungen und Wahltermine — übersichtlich gebündelt.',
    shortSie: 'Fristen, Beteiligungen und Wahltermine — übersichtlich gebündelt.',
    longDu:
      'Im Kalender laufen wichtige Termine zusammen. So siehst du Fristen, Beteiligungen und Wahltermine an einem Ort.',
    longSie:
      'Im Kalender laufen wichtige Termine zusammen. So sehen Sie Fristen, Beteiligungen und Wahltermine an einem Ort.',
    speakSegmentsDu: [
      'Im Kalender laufen wichtige Termine zusammen.',
      'So siehst du Fristen, Beteiligungen und Wahltermine an einem Ort.',
    ],
    speakSegmentsSie: [
      'Im Kalender laufen wichtige Termine zusammen.',
      'So sehen Sie Fristen, Beteiligungen und Wahltermine an einem Ort.',
    ],
  },
  postfach: {
    label: 'Postfach',
    line10sDu: 'Beispielhafte Vorschau — keine echte Zustellung oder Behördenanbindung.',
    line10sSie: 'Beispielhafte Vorschau — keine echte Zustellung oder Behördenanbindung.',
    shortDu: 'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.',
    shortSie: 'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.',
    longDu:
      'Im Postfach siehst du beispielhaft, wie verifizierte Behördenkommunikation aussehen könnte. Rückmeldungen, Erinnerungen und Hinweise bleiben nachvollziehbar an einem Ort.',
    longSie:
      'Im Postfach sehen Sie beispielhaft, wie verifizierte Behördenkommunikation aussehen könnte. Rückmeldungen, Erinnerungen und Hinweise bleiben nachvollziehbar an einem Ort.',
    speakSegmentsDu: [
      'Im Postfach siehst du beispielhaft, wie verifizierte Behördenkommunikation aussehen könnte.',
      'Rückmeldungen, Erinnerungen und Hinweise bleiben nachvollziehbar an einem Ort.',
    ],
    speakSegmentsSie: [
      'Im Postfach sehen Sie beispielhaft, wie verifizierte Behördenkommunikation aussehen könnte.',
      'Rückmeldungen, Erinnerungen und Hinweise bleiben nachvollziehbar an einem Ort.',
    ],
  },
  praemien: {
    label: 'Prämien',
    line10sDu: 'Lokale Anerkennung fürs Mitmachen — unabhängig von deiner Entscheidung.',
    line10sSie: 'Lokale Anerkennung fürs Mitmachen — unabhängig von Ihrer Entscheidung.',
    shortDu: 'Gutschein fürs Naturfreibad in Kirkel — als QR-Code oder fürs Wallet.',
    shortSie: 'Gutschein fürs Naturfreibad in Kirkel — als QR-Code oder fürs Wallet.',
    longDu:
      'Wenn eine Kommune Teilnahme anerkennen möchte, kann eine lokale Prämie erscheinen. Zum Beispiel ein Gutschein fürs Naturfreibad in Kirkel — als QR-Code oder fürs Wallet.',
    longSie:
      'Wenn eine Kommune Teilnahme anerkennen möchte, kann eine lokale Prämie erscheinen. Zum Beispiel ein Gutschein fürs Naturfreibad in Kirkel — als QR-Code oder fürs Wallet.',
    speakSegmentsDu: [
      'Wenn eine Kommune Teilnahme anerkennen möchte, kann eine lokale Prämie erscheinen.',
      'Zum Beispiel ein Gutschein fürs Naturfreibad in Kirkel — als QR-Code oder fürs Wallet.',
    ],
    speakSegmentsSie: [
      'Wenn eine Kommune Teilnahme anerkennen möchte, kann eine lokale Prämie erscheinen.',
      'Zum Beispiel ein Gutschein fürs Naturfreibad in Kirkel — als QR-Code oder fürs Wallet.',
    ],
  },
  oekosystem: {
    label: 'Ökosystem',
    line10sDu: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
    line10sSie: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
    shortDu: 'Orientierung, Beteiligung, Meldungen, Kommunikation und lokale Anerkennung.',
    shortSie: 'Orientierung, Beteiligung, Meldungen, Kommunikation und lokale Anerkennung.',
    longDu:
      'So entsteht ein Civic-Ökosystem: Orientierung, Beteiligung, Meldungen, sichere Kommunikation und lokale Anerkennung. Und ich bleibe unten am lila Symbol erreichbar.',
    longSie:
      'So entsteht ein Civic-Ökosystem: Orientierung, Beteiligung, Meldungen, sichere Kommunikation und lokale Anerkennung. Und ich bleibe unten am lila Symbol erreichbar.',
    speakSegmentsDu: [
      'So entsteht ein Civic-Ökosystem: Orientierung, Beteiligung, Meldungen, sichere Kommunikation und lokale Anerkennung.',
      'Und ich bleibe unten am lila Symbol erreichbar.',
    ],
    speakSegmentsSie: [
      'So entsteht ein Civic-Ökosystem: Orientierung, Beteiligung, Meldungen, sichere Kommunikation und lokale Anerkennung.',
      'Und ich bleibe unten am lila Symbol erreichbar.',
    ],
  },
};

export function claraBlockForStep(
  id: IntroOverlayStepId,
  du: boolean,
): {
  label: string;
  line10s: string;
  short: string;
  long: string;
  speak: string;
  speakSegments: string[];
} {
  const b = INTRO_WALKTHROUGH_CLARA[id];
  const body = du ? b.longDu : b.longSie;
  const speakSegments = du ? [...b.speakSegmentsDu] : [...b.speakSegmentsSie];
  const line10s = du ? b.line10sDu : b.line10sSie;
  return {
    label: b.label,
    line10s,
    short: du ? b.shortDu : b.shortSie,
    long: body,
    speak: speakSegments.join(' '),
    speakSegments,
  };
}
